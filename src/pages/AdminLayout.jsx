import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AdminDataProvider, useAdminData } from '../context/AdminDataContext.jsx';
import { HALL_BY_ID } from '../config.js';
import { HALLS } from '../data/seedData.js';
import { Alert, Modal } from '../components/ui.jsx';
import { useState } from 'react';

const TABS = [
  { to: '/admin/panel', label: 'ড্যাশবোর্ড', icon: '📊', end: true },
  { to: '/admin/panel/scanner', label: 'QR স্ক্যানার', icon: '📷' },
  { to: '/admin/panel/tokens', label: 'টোকেন লগ', icon: '📋' },
  { to: '/admin/panel/verify', label: 'শিক্ষার্থী যাচাই', icon: '🧑‍🎓' },
  { to: '/admin/panel/collection', label: 'খাবার সংগ্রহ', icon: '🍽️' },
  { to: '/admin/panel/daily', label: 'দৈনিক খরচ', icon: '💰' },
  { to: '/admin/panel/monthly', label: 'মাসিক খরচ', icon: '📅' },
  { to: '/admin/panel/history', label: 'ইতিহাস', icon: '🕘' },
];

function Shell() {
  const { admin, logout } = useAuth();
  const { isSuper, hallFilter, setHallFilter, error } = useAdminData();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const hallName = isSuper ? (hallFilter === 'all' ? 'সব হল' : HALL_BY_ID[hallFilter]?.name) : HALL_BY_ID[admin.hallId]?.name;

  const doLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className="admin-bar">
        <div className="container admin-bar-inner">
          <div>
            <div className="admin-hall">🏛️ {hallName}</div>
            <div className="admin-welcome">স্বাগতম, {admin.name}</div>
          </div>
          <div className="admin-bar-actions">
            {isSuper && (
              <select className="input input-sm" value={hallFilter} onChange={(e) => setHallFilter(e.target.value)} aria-label="হল ফিল্টার">
                <option value="all">সব হল</option>
                {HALLS.map((h) => (
                  <option key={h.hallId} value={h.hallId}>{h.name}</option>
                ))}
              </select>
            )}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(true)}>লগআউট</button>
          </div>
        </div>
      </div>

      <nav className="admin-tabs" aria-label="অ্যাডমিন মেনু">
        <div className="container admin-tabs-inner">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              <span aria-hidden="true">{t.icon}</span> {t.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="container admin-main">
        {error && (
          <Alert tone="error" icon="⚠️">
            ডেটা লোড করা যায়নি ({error.code || 'error'})। Firestore Rules ডিপ্লয় করা হয়েছে কি না এবং আপনার অ্যাকাউন্ট অনুমোদিত কি না দেখুন।
          </Alert>
        )}
        <Outlet />
      </main>

      <Modal
        open={confirm}
        title="লগআউট করবেন?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(false)}>না</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={doLogout}>হ্যাঁ, লগআউট</button>
          </>
        }
      >
        <p>আপনি প্রশাসক প্যানেল থেকে বের হয়ে যাবেন।</p>
      </Modal>
    </>
  );
}

export default function AdminLayout() {
  return (
    <AdminDataProvider>
      <Shell />
    </AdminDataProvider>
  );
}
