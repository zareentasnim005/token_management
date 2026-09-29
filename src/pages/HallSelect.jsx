import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHallsForGender } from '../services/studentService.js';
import { useFlow } from '../context/FlowContext.jsx';
import { GENDER_LABEL, HALL_ICON } from '../config.js';
import { yearLabel } from '../utils/format.js';
import { Alert, Spinner } from '../components/ui.jsx';

export default function HallSelect() {
  const { flow, setHall } = useFlow();
  const { student } = flow;
  const navigate = useNavigate();
  const [halls, setHalls] = useState(null);
  const [selected, setSelected] = useState(flow.hall?.hallId || null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    // শুধু শিক্ষার্থীর লিঙ্গ অনুযায়ী হল দেখানো হয়
    getHallsForGender(student.gender)
      .then((list) => {
        if (!alive) return;
        const order = (h) => (h.hallId === student.hallId ? 0 : 1);
        list.sort((a, b) => order(a) - order(b));
        setHalls(list);
        setSelected((cur) => cur || list[0]?.hallId || null);
      })
      .catch(() => alive && setError('হলের তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।'));
    return () => {
      alive = false;
    };
  }, [student]);

  const next = () => {
    const hall = halls.find((h) => h.hallId === selected);
    if (!hall) return;
    setHall(hall);
    navigate('/student/meal');
  };

  return (
    <>
      <section className="card student-card">
        <div className="avatar">{student.gender === 'female' ? '👩' : '👨'}</div>
        <div>
          <div className="student-name">{student.name}</div>
          <div className="student-meta">
            {student.department} · {yearLabel(student.year)} · আইডি: {student.studentId}
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <h1 className="card-title">হল নির্বাচন করুন</h1>

        {error && <Alert tone="error" icon="⚠️">{error}</Alert>}
        {!halls && !error && <Spinner />}
        {halls && halls.length === 0 && <Alert tone="warn" icon="ℹ️">এই মুহূর্তে কোনো হল সক্রিয় নেই।</Alert>}

        <div className="option-list" role="radiogroup" aria-label="হল">
          {halls?.map((h) => (
            <button
              key={h.hallId}
              type="button"
              role="radio"
              aria-checked={selected === h.hallId}
              className={`option-card ${selected === h.hallId ? 'selected' : ''}`}
              onClick={() => setSelected(h.hallId)}
            >
              <span className="option-icon">{HALL_ICON[h.gender]}</span>
              <span className="option-text">
                <span className="option-title">{h.name}</span>
                <span className="option-sub">{GENDER_LABEL[h.gender]}</span>
              </span>
              {selected === h.hallId && <span className="option-check">✓</span>}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary" disabled={!selected} onClick={next}>
          পরবর্তী ধাপ →
        </button>
      </section>
    </>
  );
}
