import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { MealChips, Spinner } from '../../components/ui.jsx';
import TokenTable from '../../components/TokenTable.jsx';
import SummaryBlock from '../../components/SummaryBlock.jsx';

export default function TokenLog() {
  const { tokens, loading, hallFilter, isSuper } = useAdminData();
  const [meal, setMeal] = useState('all');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('all');
  const [pay, setPay] = useState('all');
  const [sid, setSid] = useState('');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tokens.filter(
      (t) =>
        (meal === 'all' || t.mealType === meal) &&
        (!date || t.mealDate === date) &&
        (status === 'all' || t.status === status) &&
        (pay === 'all' || t.paymentStatus === pay) &&
        (!sid.trim() || t.studentId.includes(sid.trim())) &&
        (!query || [t.tokenId, t.studentId, t.studentName].some((v) => String(v).toLowerCase().includes(query))),
    );
  }, [tokens, meal, date, status, pay, sid, q]);

  const clear = () => {
    setMeal('all'); setDate(''); setStatus('all'); setPay('all'); setSid(''); setQ('');
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">মিল টোকেন লগ</h1>
        <MealChips value={meal} onChange={setMeal} />
      </div>

      <div className="filter-bar">
        <div className="filter">
          <label htmlFor="f-search">খুঁজুন</label>
          <input id="f-search" className="input input-sm" placeholder="টোকেন / আইডি / নাম" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="f-date">তারিখ</label>
          <input id="f-date" type="date" className="input input-sm" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="f-sid">শিক্ষার্থী আইডি</label>
          <input id="f-sid" className="input input-sm" inputMode="numeric" value={sid} onChange={(e) => setSid(e.target.value)} />
        </div>
        <div className="filter">
          <label htmlFor="f-status">টোকেন স্ট্যাটাস</label>
          <select id="f-status" className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">সব</option>
            <option value="Unused">অব্যবহৃত</option>
            <option value="Collected">ব্যবহৃত</option>
            <option value="Expired">মেয়াদোত্তীর্ণ</option>
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-pay">পেমেন্ট</label>
          <select id="f-pay" className="input input-sm" value={pay} onChange={(e) => setPay(e.target.value)}>
            <option value="all">সব</option>
            <option value="Paid">সম্পন্ন</option>
            <option value="Pending">অপেক্ষমাণ</option>
          </select>
        </div>
        <button type="button" className="btn btn-outline btn-sm filter-clear" onClick={clear}>ফিল্টার মুছুন</button>
      </div>

      <div className="table-card">
        <TokenTable rows={rows} showHall={isSuper && hallFilter === 'all'} />
        <SummaryBlock rows={rows} />
      </div>
    </>
  );
}
