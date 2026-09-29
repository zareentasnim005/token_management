import { BD_OFFSET_HOURS, CUTOFF_HOUR } from '../config.js';
import { bn } from './format.js';

const pad = (n) => String(n).padStart(2, '0');
const shift = (d) => new Date(d.getTime() + BD_OFFSET_HOURS * 3600 * 1000);

/** বর্তমান সময়। শুধু `npm run dev` এ VITE_FAKE_NOW দিয়ে নকল করা যায় (ডেডলাইন টেস্টের জন্য)। */
export function getNow() {
  try {
    if (import.meta.env?.DEV && import.meta.env.VITE_FAKE_NOW) {
      const d = new Date(import.meta.env.VITE_FAKE_NOW);
      if (!Number.isNaN(d.getTime())) return d;
    }
  } catch {
    /* ignore */
  }
  return new Date();
}

/** বাংলাদেশ সময় অনুযায়ী YYYY-MM-DD */
export function toBDDateString(d = getNow()) {
  const s = shift(d);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

export function addDaysStr(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/**
 * টোকেন কেনার নিয়ম: শুধু "আগামীকালের" খাবারের টোকেন কেনা যায়,
 * এবং তা আজ রাত ১০:০০টার (CUTOFF_HOUR) আগে।
 */
export function getPurchaseWindow(now = getNow()) {
  const s = shift(now);
  const cutoff = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), CUTOFF_HOUR, 0, 0);
  return {
    open: s.getUTCHours() < CUTOFF_HOUR,
    mealDate: addDaysStr(toBDDateString(now), 1),
    remainingMs: Math.max(0, cutoff - s.getTime()),
  };
}

export function formatRemaining(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${bn(h)} ঘণ্টা ${bn(m)} মিনিট`;
  if (h) return `${bn(h)} ঘণ্টা`;
  return `${bn(m)} মিনিট`;
}

/** Firestore Timestamp / Date / number → Date */
export function tsToDate(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}
export const tsToMillis = (ts) => tsToDate(ts)?.getTime() ?? 0;

/** "২০২৬-০৯-২৪ ১৪:৩০" (বাংলাদেশ সময়) */
export function formatDateTime(ts) {
  const d = tsToDate(ts);
  if (!d) return '—';
  const s = shift(d);
  return bn(`${toBDDateString(d)} ${pad(s.getUTCHours())}:${pad(s.getUTCMinutes())}`);
}

/** মেয়াদ পেরিয়ে গেলে "Unused" টোকেনকে "Expired" ধরা হয় */
export function effectiveStatus(token, today = toBDDateString()) {
  if (token.tokenStatus === 'Unused' && token.mealDate < today) return 'Expired';
  return token.tokenStatus;
}
