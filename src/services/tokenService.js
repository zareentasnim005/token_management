import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { buildQrPayload, generatePaymentId, generateTokenId } from '../utils/token.js';
import { ensureSignedIn } from './studentService.js';

/**
 * পেমেন্ট সফল হওয়ার পর প্রতিটি নির্বাচিত মিলের জন্য একটি করে টোকেন + পেমেন্ট রেকর্ড তৈরি করে।
 * সবকিছু একটি batch এ লেখা হয় — হয় সব তৈরি হবে, নয়তো কিছুই না।
 *
 * @param options  নির্বাচিত mealTypes ডকুমেন্টের অ্যারে (প্রতি মিলে একটি)
 */
export async function createPaidTokens({ student, hall, options, mealDate, maskedNumber, transactionId }) {
  await ensureSignedIn();
  const batch = writeBatch(db);
  const tokens = [];

  for (const opt of options) {
    // ৬ অক্ষরের র‍্যান্ডম আইডি (৩২^৬ ≈ ১০০ কোটি সম্ভাবনা)। রুলস শুধু `create` অনুমতি দেয়,
    // তাই কোনোভাবে আইডি মিলে গেলে আগের টোকেন overwrite হবে না — লেখাটি ব্যর্থ হবে।
    const tokenId = generateTokenId();
    const paymentId = generatePaymentId();

    const base = {
      tokenId,
      studentId: student.studentId,
      studentName: student.name,
      hallId: hall.hallId,
      mealId: opt.mealId,
      mealType: opt.meal,
      mealDate,
      amount: opt.price,
      paymentStatus: 'Paid',
      tokenStatus: 'Unused',
      paymentId,
    };
    const qrCode = buildQrPayload(base);

    batch.set(doc(db, 'mealTokens', tokenId), {
      ...base,
      hallName: hall.name,
      menu: opt.menu,
      qrCode,
      createdAt: serverTimestamp(),
      collectedAt: null,
    });

    batch.set(doc(db, 'payments', paymentId), {
      paymentId,
      tokenId,
      studentId: student.studentId,
      hallId: hall.hallId,
      amount: opt.price,
      method: 'bKash',
      paymentStatus: 'Paid',
      transactionId,
      bkashNumber: maskedNumber,
      createdAt: serverTimestamp(),
    });

    tokens.push({ ...base, hallName: hall.name, menu: opt.menu, qrCode, createdAt: Date.now(), collectedAt: null });
  }

  await batch.commit();
  return tokens;
}
