import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { HALL_BY_ID } from '../config.js';
import { registerAdmin } from '../services/adminService.js';
import { Alert, Modal } from '../components/ui.jsx';
import { isFirebaseConfigured } from '../firebase.js';

const ERRORS = {
  'auth/invalid-credential': 'ইউজার নাম বা পাসওয়ার্ড ভুল।',
  'auth/wrong-password': 'ইউজার নাম বা পাসওয়ার্ড ভুল।', 
  'auth/user-not-found': 'ইউজার নাম বা পাসওয়ার্ড ভুল।',
  'auth/invalid-email': 'ইউজার নাম/ইমেইলের ফরম্যাট সঠিক নয়।',
  'auth/too-many-requests': 'অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
  'auth/network-request-failed': 'ইন্টারনেট সংযোগে সমস্যা হয়েছে।',
  'auth/email-already-in-use': 'এই ইউজার নামটি আগে থেকেই ব্যবহৃত হচ্ছে।',
  'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
  'auth/operation-not-allowed': 'Firebase Authentication-এ Email/Password সাইন-ইন চালু করা নেই। (README ধাপ ৩)',
  'admin/not-admin': 'এই অ্যাকাউন্টটি প্রশাসক হিসেবে নিবন্ধিত নয়।',
  'admin/pending': 'আপনার অ্যাকাউন্ট এখনো অনুমোদন পায়নি। অনুমোদনের পর লগইন করতে পারবেন।',
  'admin/wrong-hall': 'আপনি এই হলের প্রশাসক নন। নিজের হল বেছে নিয়ে লগইন করুন।',
};

export default function AdminLogin() {
  const { hallId } = useParams();
  const hall = HALL_BY_ID[hallId];
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ username: '', password: '', name: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);

  if (!hall) return <Navigate to="/admin" replace />;
  if (!loading && admin) return <Navigate to="/admin/panel" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isFirebaseConfigured) return setError('Firebase কনফিগার করা হয়নি। README অনুযায়ী .env ফাইল তৈরি করুন।');
    const username = form.username.trim();
    if (!username || !form.password) return setError('ইউজার নাম ও পাসওয়ার্ড দিন।');

    setBusy(true);
    try {
      if (mode === 'login') {
        await login(username, form.password, hallId);
        navigate('/admin/panel', { replace: true });
      } else {
        if (form.name.trim().length < 2) return setError('আপনার নাম লিখুন।');
        if (!username.includes('@') && !/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
          return setError('ইউজার নাম ৩–৩০ অক্ষরের হতে হবে (ইংরেজি অক্ষর, সংখ্যা, . _ - )।');
        }
        if (form.password.length < 6) return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        if (form.password !== form.confirm) return setError('পাসওয়ার্ড দুটি মিলছে না।');
        await registerAdmin({ name: form.name, username, password: form.password, hallId });
        toast.success('নিবন্ধন সম্পন্ন! অনুমোদনের পর লগইন করতে পারবেন।');
        setMode('login');
        setForm({ username, password: '', name: '', confirm: '' });
      }
    } catch (err) {
      console.error(err);
      setError(ERRORS[err.code] || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container admin-login page-pad">
      <div className="hall-banner">🏛️ {hall.name}</div>

      <form className="card card-pad" onSubmit={submit} noValidate>
        <h1 className="card-title">{mode === 'login' ? 'প্রশাসক লগইন' : 'নতুন অ্যাকাউন্ট'}</h1>
        <p className="card-sub">
          {mode === 'login' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : `${hall.name}-এর প্রশাসক হিসেবে নিবন্ধন করুন`}
        </p>

        {mode === 'register' && (
          <div className="field">
            <label htmlFor="an">আপনার নাম</label>
            <input id="an" className="input" value={form.name} onChange={set('name')} autoComplete="name" />
          </div>
        )}

        <div className="field">
          <label htmlFor="au">ইউজার নাম / ইমেইল</label>
          <input
            id="au"
            className="input"
            placeholder="admin123"
            value={form.username}
            onChange={set('username')}
            autoComplete="username"
            autoCapitalize="none"
          />
        </div>

        <div className="field">
          <label htmlFor="ap">পাসওয়ার্ড</label>
          <input
            id="ap"
            type="password"
            className="input"
            placeholder="••••••"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label htmlFor="ac">পাসওয়ার্ড আবার লিখুন</label>
            <input id="ac" type="password" className="input" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </div>
        )}

        {error && <Alert tone="error" icon="⚠️">{error}</Alert>}
        {mode === 'register' && (
          <Alert tone="info" icon="ℹ️">নিবন্ধনের পর সুপার অ্যাডমিন অনুমোদন না দেওয়া পর্যন্ত প্যানেলে প্রবেশ করা যাবে না।</Alert>
        )}

        <button type="submit" className="btn btn-gold" disabled={busy}>
          {busy ? 'অপেক্ষা করুন…' : mode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
        </button>

        <button
          type="button"
          className="text-link center"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন'}
        </button>
        <Link to="/admin" className="text-link center">← অন্য হল বেছে নিন</Link>
      </form>

      <button type="button" className="help-fab" aria-label="সাহায্য" onClick={() => setHelp(true)}>?</button>
      <Modal
        open={help}
        title="সাহায্য"
        onClose={() => setHelp(false)}
        footer={<button type="button" className="btn btn-primary btn-sm" onClick={() => setHelp(false)}>বুঝেছি</button>}
      >
        <ul className="help-list">
          <li>শুধু অনুমোদিত প্রশাসকরাই এই প্যানেলে ঢুকতে পারবেন।</li>
          <li>নতুন হলে <b>নতুন অ্যাকাউন্ট তৈরি করুন</b> চেপে নিবন্ধন করুন; অনুমোদনের পর লগইন করুন।</li>
          <li>ইউজার নামের বদলে ইমেইলও ব্যবহার করা যায়।</li>
          <li>পাসওয়ার্ড ভুলে গেলে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।</li>
        </ul>
      </Modal>
    </main>
  );
}
