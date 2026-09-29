import { MEAL_KEYS } from '../config.js';

export const emptyAgg = () => ({
  breakfast: { count: 0, amount: 0 },
  lunch: { count: 0, amount: 0 },
  dinner: { count: 0, amount: 0 },
  total: { count: 0, amount: 0 },
  collected: 0,
});

/** পেমেন্ট সম্পন্ন টোকেনগুলোকে keyFn অনুযায়ী গ্রুপ করে যোগফল বের করে */
export function groupTokens(tokens, keyFn) {
  const map = new Map();
  for (const t of tokens) {
    if (t.paymentStatus !== 'Paid') continue;
    const key = keyFn(t);
    if (!map.has(key)) map.set(key, { key, hallId: t.hallId, agg: emptyAgg() });
    const { agg } = map.get(key);
    const m = agg[t.mealType];
    if (m) {
      m.count += 1;
      m.amount += t.amount;
    }
    agg.total.count += 1;
    agg.total.amount += t.amount;
    if (t.status === 'Collected') agg.collected += 1;
  }
  return [...map.values()];
}

/** টোকেন লগ/ইতিহাসের নিচের "মোট হিসাব" */
export function summarize(tokens) {
  const s = {
    count: tokens.length,
    revenue: 0,
    meals: { breakfast: 0, lunch: 0, dinner: 0 },
    status: { Collected: 0, Unused: 0, Expired: 0 },
  };
  for (const t of tokens) {
    if (t.paymentStatus === 'Paid') s.revenue += t.amount;
    if (MEAL_KEYS.includes(t.mealType)) s.meals[t.mealType] += 1;
    if (s.status[t.status] !== undefined) s.status[t.status] += 1;
  }
  return s;
}
