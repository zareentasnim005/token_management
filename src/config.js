import { HALLS } from './data/seedData.js';

// ===== সিস্টেম নিয়ম =====
export const CUTOFF_HOUR = 22; // আগামী দিনের টোকেন আগের রাত ১০:০০টার মধ্যে কিনতে হবে
export const BD_OFFSET_HOURS = 6; // বাংলাদেশ সময় = UTC+6
export const SHOW_DEMO_HINTS = true; // ডেমো আইডি/টোকেনের হিন্ট বক্স — প্রোডাকশনে false করে দাও

// ===== হল =====
export const HALL_BY_ID = Object.fromEntries(HALLS.map((h) => [h.hallId, h]));
export const HALL_ICON = { male: '🏠', female: '🏢' };
export const GENDER_LABEL = { male: 'ছেলেদের হল', female: 'মেয়েদের হল' };

// ===== মিল =====
export const MEAL_KEYS = ['breakfast', 'lunch', 'dinner'];
export const MEAL_META = {
  breakfast: { label: 'সকালের নাস্তা', short: 'নাস্তা', icon: '☀️', color: '#e8a020' },
  lunch: { label: 'দুপুরের খাবার', short: 'দুপুর', icon: '🌤️', color: '#1e3a6e' },
  dinner: { label: 'রাতের খাবার', short: 'রাত', icon: '🌙', color: '#7c3aed' },
};

// ===== স্ট্যাটাস =====
export const TOKEN_STATUS = {
  Unused: { label: 'অব্যবহৃত', tone: 'yellow' },
  Collected: { label: 'ব্যবহৃত', tone: 'blue' },
  Expired: { label: 'মেয়াদোত্তীর্ণ', tone: 'red' },
};
export const PAYMENT_STATUS = {
  Paid: { label: 'সম্পন্ন', tone: 'green' },
  Pending: { label: 'অপেক্ষমাণ', tone: 'yellow' },
};

export const DEADLINE_NOTICE =
  'আগামী দিনের খাবারের টোকেন আগের দিন রাত ১০:০০টার মধ্যে ক্রয় করতে হবে। রাত ১০:০০টার পর পরবর্তী দিনের খাবারের টোকেন কেনার সুযোগ থাকবে না।';
export const DEADLINE_SHORT = 'আগামী দিনের খাবারের টোকেন অবশ্যই আগের রাত ১০:০০টার মধ্যে কিনতে হবে।';
