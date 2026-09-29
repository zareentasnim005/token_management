import { Link, Navigate } from 'react-router-dom';
import { GENDER_LABEL, HALL_ICON } from '../config.js';
import { HALLS } from '../data/seedData.js';
import { useAuth } from '../context/AuthContext.jsx';

/** প্রশাসক প্যানেল → প্রথমে হল নির্বাচন → সেই হলের লগইন */
export default function AdminHallSelect() {
  const { admin, loading } = useAuth();
  if (!loading && admin) return <Navigate to="/admin/panel" replace />;

  return (
    <main className="container narrow page-pad">
      <section className="card card-pad">
        <h1 className="card-title">হল নির্বাচন করুন</h1>
        <p className="card-sub">যে হলের প্রশাসক হিসেবে প্রবেশ করবেন সেটি বেছে নিন</p>
        <div className="option-list">
          {HALLS.map((h) => (
            <Link key={h.hallId} to={`/admin/login/${h.hallId}`} className="option-card option-link">
              <span className="option-icon">{HALL_ICON[h.gender]}</span>
              <span className="option-text">
                <span className="option-title">{h.name}</span>
                <span className="option-sub">{GENDER_LABEL[h.gender]}</span>
              </span>
              <span className="option-arrow">→</span>
            </Link>
          ))}
        </div>
        <Link to="/" className="text-link">← হোমে ফিরে যান</Link>
      </section>
    </main>
  );
}
