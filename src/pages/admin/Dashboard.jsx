import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { countStudents } from '../../services/adminService.js';
import { BarChart, Empty, Spinner, StatCard } from '../../components/ui.jsx';
import SummaryBlock from '../../components/SummaryBlock.jsx';
import { MEAL_META } from '../../config.js';
import { bn, taka } from '../../utils/format.js';
import { addDaysStr, formatDateTime } from '../../utils/time.js';

export default function Dashboard() {
  const { admin } = useAuth();
  const { tokens, collections, loading, today } = useAdminData();
  const [students, setStudents] = useState(null);

  useEffect(() => {
    countStudents(admin).then(setStudents).catch(() => setStudents('—'));
  }, [admin]);

  const stats = useMemo(() => {
    const paid = tokens.filter((t) => t.paymentStatus === 'Paid');
    const todayT = paid.filter((t) => t.mealDate === today);
    const tomorrow = addDaysStr(today, 1);
    const days = Array.from({ length: 7 }, (_, i) => addDaysStr(today, i - 6));
    return {
      todayT,
      collected: todayT.filter((t) => t.status === 'Collected').length,
      pending: todayT.filter((t) => t.status === 'Unused').length,
      revenue: todayT.reduce((s, t) => s + t.amount, 0),
      tomorrow: paid.filter((t) => t.mealDate === tomorrow).length,
      chart: days.map((d) => {
        const sum = paid.filter((t) => t.mealDate === d).reduce((s, t) => s + t.amount, 0);
        return { label: bn(d.slice(5)), value: sum, display: taka(sum) };
      }),
    };
  }, [tokens, today]);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">ড্যাশবোর্ড</h1>
        <Link to="/admin/panel/scanner" className="btn btn-primary btn-sm">📷 QR স্ক্যান করুন</Link>
      </div>

      <div className="stat-grid">
        <StatCard icon="🧑‍🎓" label="মোট শিক্ষার্থী" value={students === null ? '…' : bn(students)} tone="blue" />
        <StatCard icon="🎟️" label="আজকের মিল টোকেন" value={bn(stats.todayT.length)} tone="purple" />
        <StatCard icon="✅" label="আজকের সংগৃহীত মিল" value={bn(stats.collected)} tone="green" />
        <StatCard icon="💰" label="আজকের আয়" value={taka(stats.revenue)} tone="amber" />
        <StatCard icon="⏳" label="অব্যবহৃত টোকেন (আজ)" value={bn(stats.pending)} tone="yellow" />
        <StatCard icon="📆" label="আগামীকালের টোকেন" value={bn(stats.tomorrow)} tone="sky" />
      </div>

      <div className="grid-2">
        <section className="card card-pad">
          <h2 className="section-title">গত ৭ দিনের আয়</h2>
          <BarChart data={stats.chart} />
        </section>

        <section className="card card-pad">
          <h2 className="section-title">সাম্প্রতিক খাবার সংগ্রহ</h2>
          {collections.length === 0 ? (
            <Empty icon="🍽️" title="এখনো কোনো সংগ্রহ নেই">QR স্ক্যান করে খাবার দেওয়া শুরু করুন।</Empty>
          ) : (
            <ul className="recent-list">
              {collections.slice(0, 6).map((c) => (
                <li key={c.collectionId}>
                  <span className="recent-meal">{MEAL_META[c.mealType]?.icon}</span>
                  <span className="recent-main">
                    <b>{c.studentName}</b>
                    <small className="mono">{c.tokenId}</small>
                  </span>
                  <span className="muted small">{formatDateTime(c.collectedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <h2 className="section-title spaced">আজকের মিলভিত্তিক হিসাব</h2>
      <SummaryBlock rows={stats.todayT} />
    </>
  );
}
