import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { BarChart, Empty, Spinner, StatCard } from '../../components/ui.jsx';
import { HALL_BY_ID } from '../../config.js';
import { bn, monthLabel, taka } from '../../utils/format.js';
import { groupTokens } from '../../utils/stats.js';

export default function MonthlyExpense() {
  const { tokens, loading, today } = useAdminData();
  const [year, setYear] = useState(today.slice(0, 4));

  const years = useMemo(() => {
    const s = new Set([today.slice(0, 4), ...tokens.map((t) => t.mealDate.slice(0, 4))]);
    return [...s].sort().reverse();
  }, [tokens, today]);

  const rows = useMemo(
    () =>
      groupTokens(
        tokens.filter((t) => t.mealDate.startsWith(year)),
        (t) => `${t.mealDate.slice(0, 7)}|${t.hallId}`,
      )
        .map((g) => ({ ...g, month: g.key.split('|')[0] }))
        .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : a.hallId.localeCompare(b.hallId))),
    [tokens, year],
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
    const m = new Map();
    rows.forEach((r) => m.set(r.month, (m.get(r.month) || 0) + r.agg.total.amount));
    return [...m.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([k, v]) => ({ label: monthLabel(k).split(' ')[0], value: v, display: taka(v) }));
  }, [rows]);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">মাসিক খরচ</h1>
      </div>

      <div className="filter-bar">
        <div className="filter">
          <label htmlFor="m-year">বছর</label>
          <select id="m-year" className="input input-sm" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>{bn(y)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="💰" label="মোট আয়" value={taka(totals.amount)} tone="amber" />
        <StatCard icon="🍽️" label="মোট মিল" value={bn(totals.count)} tone="purple" />
        <StatCard icon="✅" label="মোট সংগৃহীত মিল" value={bn(totals.collected)} tone="green" />
      </div>

      {rows.length === 0 ? (
        <div className="table-card"><Empty icon="📅" title="এই বছরে কোনো হিসাব নেই">অন্য বছর বেছে দেখুন।</Empty></div>
      ) : (
        <>


          <div className="table-card spaced">
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>মাস</th><th>হল</th><th>মোট নাস্তা</th><th>মোট দুপুর</th><th>মোট রাত</th><th>মোট সংগৃহীত মিল</th><th>মোট আয়</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td className="nowrap strong">{monthLabel(r.month)}</td>
                      <td className="nowrap">{HALL_BY_ID[r.hallId]?.name}</td>
                      <td>{bn(r.agg.breakfast.count)}টি</td>
                      <td>{bn(r.agg.lunch.count)}টি</td>
                      <td>{bn(r.agg.dinner.count)}টি</td>
                      <td>{bn(r.agg.collected)}টি</td>
                      <td className="strong nowrap">{taka(r.agg.total.amount)}</td>
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
