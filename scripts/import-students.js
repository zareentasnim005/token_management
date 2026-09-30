// ============================================================================
//  Excel (.xlsx) ফাইল থেকে শিক্ষার্থীদের তালিকা Firestore-এ ঢোকানোর স্ক্রিপ্ট
//  চালাতে: npm run import-students
// ============================================================================
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import XLSX from 'xlsx';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VALID_HALLS = new Set(['july6', 'shadhinota', 'gonotontro', 'matrivasha']);

const argPath = process.argv[2];
let filePath = argPath ? join(root, argPath) : null;
if (!filePath) {
    const candidates = ['students.xlsx', 'Students_list.xlsx', 'student_list.xlsx'];
    filePath = candidates.map((f) => join(root, f)).find((p) => existsSync(p));
}
if (!filePath) {
    const xlsxInRoot = readdirSync(root).filter((f) => f.toLowerCase().endsWith('.xlsx'));
    if (xlsxInRoot.length === 1) filePath = join(root, xlsxInRoot[0]);
}
if (!filePath || !existsSync(filePath)) {
    console.error('❌ .xlsx ফাইল খুঁজে পাওয়া যায়নি।');
    console.error('👉 ফাইলের নাম "students.xlsx" করে প্রজেক্ট ফোল্ডারে রাখুন।');
    process.exit(1);
}
const keyPath = join(root, 'serviceAccountKey.json');
if (!existsSync(keyPath)) {
    console.error('❌ serviceAccountKey.json পাওয়া যায়নি।');
    process.exit(1);
}

const norm = (s) => String(s ?? '').trim().toLowerCase();
const NAME_KEYS = ['নাম', 'name', 'student name', 'শিক্ষার্থীর নাম'];
const ID_KEYS = ['এনআইডি/স্টুডেন্ট', 'স্টুডেন্ট আইডি', 'আইডি নম্বর', 'আইডি', 'studentid', 'student id', 'id'];
const GENDER_KEYS = ['লিঙ্গ', 'জেন্ডার', 'gender', 'sex'];
const HALL_KEYS = ['হল', 'হলের নাম', 'hall', 'hallid', 'hall id'];
const DEPT_KEYS = ['বিভাগ', 'department', 'dept'];
const YEAR_KEYS = ['বর্ষ', 'year'];
const findKey = (headers, candidates) => headers.find((h) => candidates.includes(norm(h)));
const MALE_WORDS = new Set(['male', 'm', 'ছেলে', 'পুরুষ']);
const FEMALE_WORDS = new Set(['female', 'f', 'মেয়ে', 'মহিলা', 'নারী']);
const normalizeGender = (v) => {
    const g = norm(v);
    if (MALE_WORDS.has(g)) return 'male';
    if (FEMALE_WORDS.has(g)) return 'female';
    return null;
};

const wb = XLSX.readFile(filePath, { cellText: true });
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { raw: false, defval: '' });
if (!rows.length) { console.error(`❌ "${sheetName}" শিটে কোনো ডেটা নেই।`); process.exit(1); }

const headers = Object.keys(rows[0]);
const nameKey = findKey(headers, NAME_KEYS);
const idKey = findKey(headers, ID_KEYS);
const genderKey = findKey(headers, GENDER_KEYS);
const hallKey = findKey(headers, HALL_KEYS);
const deptKey = findKey(headers, DEPT_KEYS);
const yearKey = findKey(headers, YEAR_KEYS);

if (!nameKey || !idKey) {
    console.error('❌ "নাম" এবং "আইডি" কলাম খুঁজে পাওয়া যায়নি। পাওয়া গেছে: ' + headers.join(', '));
    process.exit(1);
}
if (!genderKey) {
    console.error('❌ "লিঙ্গ" কলাম খুঁজে পাওয়া যায়নি।');
    process.exit(1);
}

const students = [];
const skipped = [];
for (const row of rows) {
    const studentId = String(row[idKey] ?? '').trim().replace(/\.0$/, '');
    const name = String(row[nameKey] ?? '').trim();
    const genderRaw = row[genderKey];
    const gender = normalizeGender(genderRaw);
    if (!/^[0-9A-Za-z-]+$/.test(studentId)) continue;
    if (!name) { skipped.push([studentId, 'নাম নেই']); continue; }
    if (!gender) { skipped.push([studentId || name, `লিঙ্গ বোঝা যায়নি ("${genderRaw ?? ''}")`]); continue; }
    const hallRaw = hallKey ? norm(row[hallKey]) : '';
    const hallId = VALID_HALLS.has(hallRaw) ? hallRaw : undefined;
    if (hallKey && row[hallKey] && !hallId) skipped.push([studentId, `অজানা হল ("${row[hallKey]}")`]);
    const doc = { studentId, name, gender };
    if (hallId) doc.hallId = hallId;
    if (deptKey && row[deptKey]) doc.department = String(row[deptKey]).trim();
    if (yearKey && row[yearKey]) doc.year = Number(row[yearKey]) || String(row[yearKey]).trim();
    students.push(doc);
}

console.log(`📄 ফাইল: ${filePath.split(/[\\/]/).pop()}  (শিট: ${sheetName})`);
console.log(`   মোট সারি: ${rows.length}  ·  বৈধ শিক্ষার্থী: ${students.length}  ·  বাদ পড়েছে: ${skipped.length}`);
if (!students.length) { console.error('❌ একজনও বৈধ শিক্ষার্থী পাওয়া যায়নি।'); process.exit(1); }

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();
const CHUNK = 400;
try {
    for (let i = 0; i < students.length; i += CHUNK) {
        const batch = db.batch();
        for (const s of students.slice(i, i + CHUNK)) batch.set(db.doc(`users/${s.studentId}`), s, { merge: true });
        await batch.commit();
    }
    console.log(`✅ ${students.length} জন শিক্ষার্থী Firestore-এর "users" কালেকশনে যোগ/আপডেট হয়েছে।`);
} catch (e) {
    console.error('❌ Firestore-এ লেখা ব্যর্থ:', e.message);
    process.exit(1);
}
if (skipped.length) {
    console.log(`\n⚠️  বাদ পড়া ${skipped.length}টি সারি:`);
    skipped.slice(0, 30).forEach(([id, reason]) => console.log(`   - ${id}: ${reason}`));
}
console.log('\n🎉 সম্পন্ন! এখন এই আইডিগুলো দিয়ে "শিক্ষার্থী প্যানেল" থেকে ঢোকা যাবে।');