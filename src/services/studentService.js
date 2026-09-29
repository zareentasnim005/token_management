import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { MEAL_OPTIONS } from '../data/seedData.js';

/** শিক্ষার্থীর জন্য অজানা (anonymous) সাইন-ইন — Firestore রুলসের `signedIn()` পূরণ করে */
export async function ensureSignedIn() {
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
}

export async function getStudent(studentId) {
  await ensureSignedIn();
  const snap = await getDoc(doc(db, 'users', studentId));
  return snap.exists() ? { ...snap.data(), studentId: snap.id } : null;
}

/** শিক্ষার্থীর লিঙ্গ অনুযায়ী সক্রিয় হলগুলো */
export async function getHallsForGender(gender) {
  const snap = await getDocs(query(collection(db, 'halls'), where('gender', '==', gender)));
  return snap.docs.map((d) => d.data()).filter((h) => h.isActive !== false);
}

const orderOf = (m) => {
  const i = MEAL_OPTIONS.findIndex((x) => x.mealId === m.mealId);
  return i === -1 ? 999 : i;
};

export async function getMealOptions() {
  const snap = await getDocs(collection(db, 'mealTypes'));
  return snap.docs
    .map((d) => d.data())
    .filter((m) => m.isActive !== false)
    .sort((a, b) => orderOf(a) - orderOf(b)); // প্রোটোটাইপের ক্রম (৩০ টাকার মেনু আগে)
}
