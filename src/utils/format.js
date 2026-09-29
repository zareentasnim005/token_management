const BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const bn = (v) => String(v ?? '').replace(/\d/g, (d) => BN[Number(d)]);
export const taka = (n) => `৳ ${bn(Number(n || 0))}`;

const YEAR = { 1: '১ম', 2: '২য়', 3: '৩য়', 4: '৪র্থ', 5: '৫ম' };
export const yearLabel = (n) => `${YEAR[n] || bn(n) + 'তম'} বর্ষ`;

export const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];
export const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${BN_MONTHS[m - 1]} ${bn(y)}`;
};

export const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);
