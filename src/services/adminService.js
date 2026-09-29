import {
  collection, doc, getCountFromServer, getDoc, onSnapshot, query, runTransaction,
  serverTimestamp, setDoc, where,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { parseQrPayload } from '../utils/token.js';
import { toBDDateString } from '../utils/time.js';

const EMAIL_DOMAIN = 'hallmeal.pust.example';
/** "admin123" → admin123@hallmeal.pust.example ; ইমেইল দিলে সেটাই ব্যবহার হয় */
export const toLoginEmail = (input) => {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@${EMAIL_DOMAIN}`;
};

// ---------------- Auth ----------------
export async function fetchAdminProfile(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() ? { ...snap.data(), uid } : null;
}

/** লগইন করে; অ্যাডমিন না হলে / অনুমোদন না থাকলে / ভুল হল হলে সাইন-আউট করে ত্রুটি ছোড়ে */
export async function loginAdmin(usernameOrEmail, password, hallId) {
  const cred = await signInWithEmailAndPassword(auth, toLoginEmail(usernameOrEmail), password);
  let profile;
  try {
    profile = await fetchAdminProfile(cred.user.uid);
  } catch {
    profile = null;
  }
  const fail = async (code) => {
    await signOut(auth);
    const err = new Error(code);
    err.code = code;
    throw err;
  };
  if (!profile) return fail('admin/not-admin');
  if (profile.approved !== true) return fail('admin/pending');
  if (profile.role !== 'superAdmin' && hallId && profile.hallId !== hallId) return fail('admin/wrong-hall');
  return profile;
}

export async function registerAdmin({ name, username, password, hallId }) {
  const email = toLoginEmail(username);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await setDoc(doc(db, 'admins', cred.user.uid), {
      adminId: cred.user.uid,
      email,
      username: username.trim().toLowerCase(),
      name: name.trim(),
      role: 'hallAdmin',
      hallId,
      approved: true, // Firebase Console/সুপার অ্যাডমিন approved=true না করা পর্যন্ত প্রবেশ নেই
      createdAt: serverTimestamp(),
    });
  } finally {
    await signOut(auth);
  }
}

export const logoutAdmin = () => signOut(auth);

// ---------------- Realtime data ----------------
const scoped = (col, admin) =>
  admin.role === 'superAdmin' ? collection(db, col) : query(collection(db, col), where('hallId', '==', admin.hallId));

export function subscribeTokens(admin, onData, onError) {
  return onSnapshot(
    scoped('mealTokens', admin),
    (snap) => onData(snap.docs.map((d) => ({ ...d.data(), tokenId: d.id }))),
    onError,
  );
}

export function subscribeCollections(admin, onData, onError) {
  return onSnapshot(
    scoped('foodCollection', admin),
    (snap) => onData(snap.docs.map((d) => ({ ...d.data(), collectionId: d.id }))),
    onError,
  );
}

export async function countStudents(admin) {
  const q =
    admin.role === 'superAdmin'
      ? collection(db, 'users')
      : query(collection(db, 'users'), where('hallId', '==', admin.hallId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

// ---------------- QR যাচাই ও খাবার সংগ্রহ ----------------
/**
 * টোকেন যাচাই। ফলাফলের status:
 * valid | collected | expired | future | unpaid | mismatch | not_found | other_hall
 */
export async function lookupToken(rawText, admin) {
  const parsed = parseQrPayload(rawText);
  let snap;
  try {
    snap = await getDoc(doc(db, 'mealTokens', parsed.tokenId));
  } catch (e) {
    // অন্য হলের টোকেন পড়তে গেলে রুলস permission-denied দেয়
    if (e.code === 'permission-denied') return { status: 'other_hall' };
    throw e;
  }
  if (!snap.exists()) return { status: 'not_found' };

  const token = { ...snap.data(), tokenId: snap.id };
  if (admin.role !== 'superAdmin' && token.hallId !== admin.hallId) return { status: 'other_hall', token };

  // QR এর তথ্য ও ডেটাবেস না মিললে QR নকল হতে পারে
  if (
    (parsed.studentId && parsed.studentId !== token.studentId) ||
    (parsed.mealDate && parsed.mealDate !== token.mealDate)
  ) {
    return { status: 'mismatch', token };
  }
  if (token.paymentStatus !== 'Paid') return { status: 'unpaid', token };
  if (token.tokenStatus === 'Collected') return { status: 'collected', token };

  const today = toBDDateString();
  if (token.mealDate < today) return { status: 'expired', token };
  if (token.mealDate > today) return { status: 'future', token };
  return { status: 'valid', token };
}

/**
 * খাবার সংগ্রহ নিশ্চিত করে: Unused → Collected।
 * Transaction ব্যবহার করা হয়েছে যাতে একই টোকেন দুইবার ব্যবহার করা না যায় (একসাথে দুই অ্যাডমিন স্ক্যান করলেও)।
 */
export async function collectToken(tokenId, admin) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'mealTokens', tokenId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('NOT_FOUND');
    const t = snap.data();
    if (t.paymentStatus !== 'Paid') throw new Error('UNPAID');
    if (t.tokenStatus === 'Collected') throw new Error('ALREADY_COLLECTED');
    if (t.mealDate !== toBDDateString()) throw new Error('WRONG_DATE');

    tx.update(ref, { tokenStatus: 'Collected', collectedAt: serverTimestamp(), collectedBy: admin.uid });

    const colRef = doc(collection(db, 'foodCollection'));
    tx.set(colRef, {
      collectionId: colRef.id,
      tokenId,
      studentId: t.studentId,
      studentName: t.studentName,
      hallId: t.hallId,
      mealId: t.mealId,
      mealType: t.mealType,
      mealDate: t.mealDate,
      amount: t.amount,
      collectedAt: serverTimestamp(),
      collectedBy: admin.uid,
      collectedByName: admin.name,
    });
  });
}
