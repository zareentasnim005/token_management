const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/O/1/I বাদ

const randomChars = (n) => {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
};

export const generateTokenId = () => `TKN-${randomChars(6)}`;
export const generatePaymentId = () => `PAY-${randomChars(8)}`;

/**
 * QR এর ভেতরের ডেটা (ইচ্ছাকৃতভাবে শুধু ASCII, যাতে QR ছোট ও সহজে স্ক্যানযোগ্য থাকে)।
 * ⚠️ QR এর ডেটাকে বিশ্বাস করা হয় না — স্ক্যানার শুধু tokenId নিয়ে Firestore থেকে আসল তথ্য যাচাই করে।
 */
export function buildQrPayload(t) {
  return JSON.stringify({
    v: 1,
    tokenId: t.tokenId,
    studentId: t.studentId,
    hallId: t.hallId,
    mealId: t.mealId,
    mealDate: t.mealDate,
    amount: t.amount,
    paymentStatus: t.paymentStatus,
    tokenStatus: t.tokenStatus,
  });
}

/** QR / হাতে লেখা টেক্সট থেকে tokenId বের করে */
export function parseQrPayload(text) {
  const raw = String(text ?? '').trim();
  try {
    const o = JSON.parse(raw);
    if (o && typeof o === 'object' && o.tokenId) {
      return { ...o, tokenId: String(o.tokenId).trim().toUpperCase() };
    }
  } catch {
    /* plain text */
  }
  return { tokenId: raw.toUpperCase() };
}

export const isValidTokenId = (id) => /^TKN-[A-Z0-9-]{2,20}$/.test(id);
export const isValidStudentId = (id) => /^\d{6,15}$/.test(id);
export const isValidBkash = (n) => /^01[3-9]\d{8}$/.test(n);
