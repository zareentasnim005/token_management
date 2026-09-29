import { MEAL_KEYS, MEAL_META } from '../config.js';
import { bn, percent, taka } from '../utils/format.js';
import { summarize } from '../utils/stats.js';

/** প্রোটোটাইপের "মোট হিসাব" ব্লক: রঙিন পিল + মিলভিত্তিক প্রগ্রেস বার */
export default function SummaryBlock({ rows }) {
  const s = summarize(rows);
  return (
    <section className="summary-block" aria-label="মোট হিসাব">
      <div className="pill-row">
        <strong className="summary-title">মোট হিসাব</strong>
        <span className="pill pill-blue">টোকেন {bn(s.count)}</span>
        <span className="pill pill-green">আয় {taka(s.revenue)}</span>
        <span className="pill pill-amber">{MEAL_META.breakfast.icon} নাস্তা {bn(s.meals.breakfast)}</span>
        <span className="pill pill-sky">{MEAL_META.lunch.icon} দুপুর {bn(s.meals.lunch)}</span>
        <span className="pill pill-purple">{MEAL_META.dinner.icon} রাত {bn(s.meals.dinner)}</span>
        <span className="pill pill-green">✅ ব্যবহৃত {bn(s.status.Collected)}</span>
        <span className="pill pill-yellow">⏳ অব্যবহৃত {bn(s.status.Unused)}</span>
        <span className="pill pill-red">❌ মেয়াদোত্তীর্ণ {bn(s.status.Expired)}</span>
      </div>

      <div className="meal-bars">
        {MEAL_KEYS.map((k) => {
          const pct = percent(s.meals[k], s.count);
          return (
            <div key={k} className="meal-bar-row">
              <span className="meal-bar-name">
                {MEAL_META[k].icon} {MEAL_META[k].label}
              </span>
              <div className="progress">
                <div className="progress-fill" style={{ width: `${pct}%`, background: MEAL_META[k].color }} />
              </div>
              <span className="meal-bar-val" style={{ color: MEAL_META[k].color }}>
                {bn(s.meals[k])}টি · {bn(pct)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
