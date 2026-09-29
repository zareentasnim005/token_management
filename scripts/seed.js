// ============================================================================
//  ডেমো ডেটা Firestore এ ঢোকানোর স্ক্রিপ্ট
//  চালাতে:  npm run seed
//  আগে প্রয়োজন: প্রজেক্ট রুটে serviceAccountKey.json (README ধাপ ৪ দেখো)
//  ফ্ল্যাগ:  --no-admin   → ডেমো সুপার অ্যাডমিন (admin123) তৈরি করবে না
//            --no-tokens  → ডেমো টোকেন তৈরি করবে না
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { HALLS, MEAL_OPTIONS, STUDENTS } from '../src/data/seedData.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = join(root, 'serviceAccountKey.json');
if (!existsSync(keyPath)) {
  console.error('❌ serviceAccountKey.json পাওয়া যায়নি। README এর ধাপ ৪ অনুযায়ী ফাইলটি প্রজেক্ট ফোল্ডারে রাখো।');
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();
const auth = getAuth();

// বাংলাদেশ সময়ে আজকের তারিখ (YYYY-MM-DD) ± দিন
const bdDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + 6 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return d.toISOString().slice(0, 10);
};

async function seedBasics() {
  const batch = db.batch();
  HALLS.forEach((h) => batch.set(db.doc(`halls/${h.hallId}`), h));
  MEAL_OPTIONS.forEach((m) => batch.set(db.doc(`mealTypes/${m.mealId}`), m));
  STUDENTS.forEach((s) => batch.set(db.doc(`users/${s.studentId}`), s));
  await batch.commit();
  console.log(`✅ ${HALLS.length}টি হল, ${MEAL_OPTIONS.length}টি মিল অপশন, ${STUDENTS.length}জন শিক্ষার্থী যোগ হয়েছে`);
}

async function seedTokens() {
  const hall = Object.fromEntries(HALLS.map((h) => [h.hallId, h]));
  const meal = Object.fromEntries(MEAL_OPTIONS.map((m) => [m.mealId, m]));
  const stu = Object.fromEntries(STUDENTS.map((s) => [s.studentId, s]));

  // TKN-001 ব্যবহৃত | TKN-002 অব্যবহৃত (আজকের — স্ক্যান টেস্টের জন্য) | TKN-005 মেয়াদোত্তীর্ণ
  const demo = [
    { id: 'TKN-001', studentId: '2021101001', mealId: 'lunch_chicken', date: bdDate(-14), status: 'Collected' },
    { id: 'TKN-002', studentId: '2022201001', mealId: 'lunch_fish', date: bdDate(0), status: 'Unused' },
    { id: 'TKN-003', studentId: '2022201002', mealId: 'dinner_veg_bhorta', date: bdDate(0), status: 'Unused' },
    { id: 'TKN-004', studentId: '2023301002', mealId: 'breakfast_egg_veg', date: bdDate(1), status: 'Unused' },
    { id: 'TKN-005', studentId: '2023301001', mealId: 'breakfast_egg_bhorta', date: bdDate(-15), status: 'Unused' },
  ];

  for (const t of demo) {
    const s = stu[t.studentId];
    const m = meal[t.mealId];
    const h = hall[s.hallId];
    const paymentId = `PAY-${t.id.slice(4)}`;
    const base = {
      tokenId: t.id, studentId: s.studentId, studentName: s.name, hallId: h.hallId, mealId: m.mealId,
      mealType: m.meal, mealDate: t.date, amount: m.price, paymentStatus: 'Paid', tokenStatus: t.status, paymentId,
    };
    const qrCode = JSON.stringify({
      v: 1, tokenId: base.tokenId, studentId: base.studentId, hallId: base.hallId, mealId: base.mealId,
      mealDate: base.mealDate, amount: base.amount, paymentStatus: 'Paid', tokenStatus: 'Unused',
    });
    const created = Timestamp.fromDate(new Date(`${t.date}T00:00:00+06:00`));
    const collectedAt = t.status === 'Collected' ? Timestamp.fromDate(new Date(`${t.date}T13:10:00+06:00`)) : null;

    await db.doc(`mealTokens/${t.id}`).set({
      ...base, hallName: h.name, menu: m.menu, qrCode, createdAt: created, collectedAt,
      ...(t.status === 'Collected' ? { collectedBy: 'seed' } : {}),
    });
    await db.doc(`payments/${paymentId}`).set({
      paymentId, tokenId: t.id, studentId: s.studentId, hallId: h.hallId, amount: m.price, method: 'bKash',
      paymentStatus: 'Paid', transactionId: `DEMO${t.id.slice(4)}XYZ`, bkashNumber: '01XXXXXXXXX', createdAt: created,
    });
    if (t.status === 'Collected') {
      const ref = db.collection('foodCollection').doc();
      await ref.set({
        collectionId: ref.id, tokenId: t.id, studentId: s.studentId, studentName: s.name, hallId: h.hallId,
        mealId: m.mealId, mealType: m.meal, mealDate: t.date, amount: m.price, collectedAt, collectedBy: 'seed',
        collectedByName: 'ডেমো ডেটা',
      });
    }
  }
  console.log(`✅ ${demo.length}টি ডেমো টোকেন যোগ হয়েছে (TKN-001 … TKN-005)`);
}

async function seedAdmin() {
  const email = 'admin123@hallmeal.pust.example';
  const password = 'admin123';
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email, password, displayName: 'সুপার অ্যাডমিন' });
  }
  await db.doc(`admins/${user.uid}`).set({
    adminId: user.uid, email, username: 'admin123', name: 'সুপার অ্যাডমিন', role: 'superAdmin',
    hallId: 'gonotontro', approved: true, createdAt: FieldValue.serverTimestamp(),
  });
  console.log('✅ ডেমো সুপার অ্যাডমিন তৈরি: ইউজার নাম = admin123 , পাসওয়ার্ড = admin123');
  console.log('   ⚠️ বাস্তবে ব্যবহারের আগে Firebase Console থেকে এই ইউজারের পাসওয়ার্ড বদলাও বা ইউজারটি মুছে দাও।');
}

try {
  await seedBasics();
  if (!args.has('--no-tokens')) await seedTokens();
  if (!args.has('--no-admin')) await seedAdmin();
  console.log('\n🎉 সিড সম্পন্ন! এখন `npm run dev` চালাও।');
} catch (e) {
  console.error('❌ সিড ব্যর্থ:', e.message);
  if (/auth|identity/i.test(e.message)) {
    console.error('👉 Firebase Console > Authentication > Get started চাপো এবং Email/Password চালু করো, তারপর আবার চালাও।');
  }
  process.exit(1);
}
