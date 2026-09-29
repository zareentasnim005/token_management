import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { BarChart, MealChips, Spinner, StatCard } from '../../components/ui.jsx';
import TokenTable from '../../components/TokenTable.jsx';
import SummaryBlock from '../../components/SummaryBlock.jsx';
import { bn, taka } from '../../utils/format.js';
import { addDaysStr } from '../../utils/time.js';
import { summarize } from '../../utils/stats.js';

export default function History() {
  const { tokens, loading, today, isSuper, hallFilter } = useAdminData();
  const [from, setFrom] = useState(addDaysStr(today, -30));
  const [to, setTo] = useState(addDaysStr(today, 1));
  const [meal, setMeal] = useState('all');
  const [sid, setSid] = useState('');

  const rows = useMemo(
    () =>
      tokens.filter(
        (t) =>
          (!from || t.mealDate >= from) &&
          (!to || t.mealDate <= to) &&
          (meal === 'all' || t.mealType === meal) &&
          (!sid.trim() || t.studentId.includes(sid.trim())),
      ),
    [tokens, from, to, meal, sid],
  );

  const s = summarize(rows);
  const chart = useMemo(() => {
    const m = new Map();
    rows.forEach((t) => t.paymentStatus === 'Paid' && m.set(t.mealDate, (m.get(t.mealDate) || 0) + 1));
    return [...m.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([d, v]) => ({ label: bn(d.slice(5)), value: v }));
  }, [rows]);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">ইতিহাস</h1>
        <MealChips value={meal} onChange={setMeal} />
      </div>

      <div className="filter-bar">
        <div className="filter">
          <label htmlFor="h-from">শুরুর তারিখ</label>
          <input id="h-from" type="date" className="input input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="h-to">শেষ তারিখ</label>
          <input id="h-to" type="date" className="input input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="h-sid">শিক্ষার্থী আইডি</label>
          <input id="h-sid" className="input input-sm" inputMode="numeric" value={sid} onChange={(e) => setSid(e.target.value)} />
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="🎟️" label="মোট টোকেন" value={bn(s.count)} tone="blue" />
        <StatCard icon="💰" label="মোট আয়" value={taka(s.revenue)} tone="amber" />
        <StatCard icon="✅" label="ব্যবহৃত" value={bn(s.status.Collected)} tone="green" />
        <StatCard icon="⌛" label="অব্যবহৃত / মেয়াদোত্তীর্ণ" value={`${bn(s.status.Unused)} / ${bn(s.status.Expired)}`} tone="yellow" />
      </div>

      {chart.length > 0 && (
        <section className="card card-pad">
          <h2 className="section-title">দিনভিত্তিক টোকেন সংখ্যা</h2>
          <BarChart data={chart} />
        </section>
      )}

      <div className="table-card spaced">
        <TokenTable rows={rows} showHall={isSuper && hallFilter === 'all'} />
        <SummaryBlock rows={rows} />
      </div>
    </>
  );
}
