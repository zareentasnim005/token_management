/**
 * bKash পেমেন্ট (ডেমো)
 * ------------------------------------------------------------------
 * এখানে কোনো বাস্তব লেনদেন হয় না। বাস্তব bKash Tokenized Checkout যুক্ত করতে হলে:
 *   1. bKash merchant credentials নিয়ে একটি Cloud Function/সার্ভার বানাও (secret কখনো ফ্রন্টএন্ডে রেখো না)
 *   2. সেখানে createPayment → executePayment → queryPayment করে trxID যাচাই করো
 *   3. যাচাই সফল হলে সার্ভার থেকেই mealTokens/payments লিখো
 * এই ফাংশনটি সেই জায়গায় বসানোর জন্য প্রস্তুত রাখা হয়েছে।
 * ------------------------------------------------------------------
 */
export async function payWithBkash({ number, transactionId, amount }) {
  await new Promise((r) => setTimeout(r, 1400)); // পেমেন্ট প্রক্রিয়ার অনুকরণ
  if (!number || !transactionId || !(amount > 0)) throw new Error('INVALID_PAYMENT');
  return { ok: true, transactionId, maskedNumber: `${number.slice(0, 3)}XXXXX${number.slice(-3)}` };
}

/** ডেমোর জন্য একটি র‍্যান্ডম ট্রানজেকশন আইডি */
export function demoTransactionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
