import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { BarChart, Empty, Spinner, StatCard } from '../../components/ui.jsx';
import { HALL_BY_ID } from '../../config.js';
import { bn, taka } from '../../utils/format.js';
import { addDaysStr } from '../../utils/time.js';
import { groupTokens } from '../../utils/stats.js';

export function MealCell({ m }) {
  return (
    <td className="nowrap">
      <b>{taka(m.amount)}</b>
      <small className="cell-sub">{bn(m.count)}টি</small>
    </td>
  );
}

export default function DailyExpense() {
  const { tokens, loading, today } = useAdminData();
  const [from, setFrom] = useState(addDaysStr(today, -6));
  const [to, setTo] = useState(addDaysStr(today, 1));

  const inRange = useMemo(() => tokens.filter((t) => (!from || t.mealDate >= from) && (!to || t.mealDate <= to)), [tokens, from, to]);

  const rows = useMemo(
    () =>
      groupTokens(inRange, (t) => `${t.mealDate}|${t.hallId}`)
        .map((g) => ({ ...g, date: g.key.split('|')[0] }))
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.hallId.localeCompare(b.hallId))),
    [inRange],
  );

  const totals = useMemo(() => {
    const t = { amount: 0, count: 0, collected: 0 };
    rows.forEach((r) => {
      t.amount += r.agg.total.amount;
      t.count += r.agg.total.count;
      t.collected += r.agg.collected;
    });
    return t;
  }, [rows]);

  const chart = useMemo(() => {
    const byDate = new Map();
    rows.forEach((r) => byDate.set(r.date, (byDate.get(r.date) || 0) + r.agg.total.amount));
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([d, v]) => ({ label: bn(d.slice(5)), value: v, display: taka(v) }));
  }, [rows]);

  const days = new Set(rows.map((r) => r.date)).size;

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">দৈনিক খরচ</h1>
      </div>

      <div className="filter-bar">
        <div className="filter">
          <label htmlFor="d-from">শুরুর তারিখ</label>
          <input id="d-from" type="date" className="input input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="d-to">শেষ তারিখ</label>
          <input id="d-to" type="date" className="input input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="💰" label="মোট টাকা" value={taka(totals.amount)} tone="amber" />
        <StatCard icon="🍽️" label="মোট মিল" value={bn(totals.count)} tone="purple" />
        <StatCard icon="✅" label="সংগৃহীত মিল" value={bn(totals.collected)} tone="green" />
        <StatCard icon="📈" label="গড় টাকা / দিন" value={taka(days ? Math.round(totals.amount / days) : 0)} tone="blue" />
      </div>

      {rows.length === 0 ? (
        <div className="table-card"><Empty icon="💰" title="এই সময়ে কোনো হিসাব নেই">তারিখের সীমা বদলে দেখুন।</Empty></div>
      ) : (
        <>
          <section className="card card-pad">
            <h2 className="section-title">দিনভিত্তিক আয়</h2>
            <BarChart data={chart} color="var(--gold)" />
          </section>

          <div className="table-card spaced">
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>তারিখ</th><th>হল</th><th>নাস্তা</th><th>দুপুর</th><th>রাত</th><th>মোট মিল</th><th>মোট টাকা</th><th>সংগৃহীত</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td className="nowrap strong">{bn(r.date)}</td>
                      <td className="nowrap">{HALL_BY_ID[r.hallId]?.name}</td>
                      <MealCell m={r.agg.breakfast} />
                      <MealCell m={r.agg.lunch} />
                      <MealCell m={r.agg.dinner} />
                      <td>{bn(r.agg.total.count)}</td>
                      <td className="strong nowrap">{taka(r.agg.total.amount)}</td>
                      <td>{bn(r.agg.collected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
