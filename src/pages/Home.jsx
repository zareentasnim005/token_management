import { Link, useNavigate } from 'react-router-dom';
import { HALLS } from '../data/seedData.js';
import { isFirebaseConfigured } from '../firebase.js';
import { Alert } from '../components/ui.jsx';

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="home">
      <div className="container">
        {!isFirebaseConfigured && (
          <Alert tone="warn" icon="⚠️">
            Firebase কনফিগার করা হয়নি। প্রজেক্ট ফোল্ডারে <code>.env</code> ফাইল বানিয়ে Firebase-এর কী বসান (README দেখুন)।
          </Alert>
        )}

        <section className="home-hero">
          <div className="logo-lg">
            <img src="/logo.png" alt="পাবনা বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের লোগো" />
          </div>
          <h1 className="home-title">হল মিল ম্যানেজমেন্ট</h1>
          <p className="home-desc">
            অনলাইনে মিল টোকেন কিনুন, QR কোড দেখিয়ে হলে খাবার নিন।
          </p>
        </section>

        <section className="panel-grid">
          <article className="panel-card panel-clickable" onClick={() => navigate('/student')}>
            <div className="panel-icon panel-icon-blue">🎓</div>
            <h2 className="panel-title">শিক্ষার্থী প্যানেল</h2>
            <Link to="/student" className="btn btn-pill btn-navy">প্রবেশ করুন →</Link>
          </article>

          <article className="panel-card panel-card-amber panel-clickable" onClick={() => navigate('/admin')}>
            <div className="panel-icon panel-icon-amber">🏛️</div>
            <h2 className="panel-title panel-title-amber">প্রশাসক প্যানেল</h2>
            <Link to="/admin" className="btn btn-pill btn-gold">প্রবেশ করুন →</Link>
          </article>
        </section>

        <section className="hall-mini-grid" aria-label="হলসমূহ">
          {HALLS.map((h) => (
            <div key={h.hallId} className="hall-mini">
              <b>{h.name}</b>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}