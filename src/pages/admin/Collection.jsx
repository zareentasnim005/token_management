import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { Empty, MealChips, Spinner } from '../../components/ui.jsx';
import { HALL_BY_ID, MEAL_META } from '../../config.js';
import { bn, taka } from '../../utils/format.js';
import { formatDateTime } from '../../utils/time.js';

export default function Collection() {
  const { collections, loading, isSuper, hallFilter } = useAdminData();
  const [meal, setMeal] = useState('all');
  const [date, setDate] = useState('');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return collections.filter(
      (c) =>
        (meal === 'all' || c.mealType === meal) &&
        (!date || c.mealDate === date) &&
        (!query || [c.tokenId, c.studentId, c.studentName].some((v) => String(v).toLowerCase().includes(query))),
    );
  }, [collections, meal, date, q]);

  if (loading) return <Spinner />;
  const showHall = isSuper && hallFilter === 'all';

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">খাবার সংগ্রহের রেকর্ড</h1>
        <MealChips value={meal} onChange={setMeal} />
      </div>

      <div className="filter-bar">
        <div className="filter">
          <label htmlFor="c-q">খুঁজুন</label>
          <input id="c-q" className="input input-sm" placeholder="টোকেন / আইডি / নাম" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="c-d">তারিখ</label>
          <input id="c-d" type="date" className="input input-sm" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="filter filter-summary">
          মোট সংগ্রহ: <b>{bn(rows.length)}টি</b> · টাকা: <b>{taka(rows.reduce((s, c) => s + (c.amount || 0), 0))}</b>
        </div>
      </div>

      <div className="table-card">
        {rows.length === 0 ? (
          <Empty icon="🍽️" title="কোনো সংগ্রহের রেকর্ড নেই">QR স্ক্যান করে খাবার দিলে এখানে রেকর্ড জমা হবে।</Empty>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>সংগ্রহ আইডি</th>
                  <th>টোকেন আইডি</th>
                  <th>শিক্ষার্থী আইডি</th>
                  <th>নাম</th>
                  {showHall && <th>হল</th>}
                  <th>মিল</th>
                  <th>তারিখ</th>
                  <th>সংগ্রহের সময়</th>
                  <th>সংগ্রহকারী</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.collectionId}>
                    <td className="mono muted">{c.collectionId.slice(0, 8)}</td>
                    <td className="mono">{c.tokenId}</td>
                    <td className="mono muted">{c.studentId}</td>
                    <td className="strong">{c.studentName}</td>
                    {showHall && <td>{HALL_BY_ID[c.hallId]?.name}</td>}
                    <td className="nowrap">{MEAL_META[c.mealType]?.icon} {MEAL_META[c.mealType]?.label}</td>
                    <td className="muted nowrap">{bn(c.mealDate)}</td>
                    <td className="nowrap">{formatDateTime(c.collectedAt)}</td>
                    <td className="muted">{c.collectedByName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
