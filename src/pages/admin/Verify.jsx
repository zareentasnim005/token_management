import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext.jsx';
import { getStudent } from '../../services/studentService.js';
import { Alert, Empty } from '../../components/ui.jsx';
import TokenTable from '../../components/TokenTable.jsx';
import { HALL_BY_ID } from '../../config.js';
import { yearLabel } from '../../utils/format.js';
import { isValidStudentId } from '../../utils/token.js';

/** শিক্ষার্থী যাচাই: আইডি দিয়ে শিক্ষার্থীর তথ্য ও তার টোকেনগুলো দেখা */
export default function Verify() {
  const { tokens } = useAdminData();
  const [id, setId] = useState('');
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mine = useMemo(() => (student ? tokens.filter((t) => t.studentId === student.studentId) : []), [tokens, student]);

  const search = async (e) => {
    e.preventDefault();
    const v = id.trim();
    setError('');
    setStudent(null);
    if (!isValidStudentId(v)) return setError('সঠিক শিক্ষার্থী আইডি লিখুন (শুধু সংখ্যা)।');
    setBusy(true);
    try {
      const s = await getStudent(v);
      if (!s) setError('এই আইডির কোনো শিক্ষার্থী পাওয়া যায়নি।');
      else setStudent(s);
    } catch {
      setError('তথ্য আনা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">শিক্ষার্থী যাচাই</h1>
      </div>

      <form className="card card-pad inline-form" onSubmit={search}>
        <input
          className="input"
          inputMode="numeric"
          placeholder="শিক্ষার্থী আইডি লিখুন (যেমন: 2022201001)"
          aria-label="শিক্ষার্থী আইডি"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? '…' : 'যাচাই করুন'}</button>
      </form>
      {error && <Alert tone="error" icon="⚠️">{error}</Alert>}

      {student ? (
        <>
          <section className="card student-card">
            <div className="avatar">{student.gender === 'female' ? '👩' : '👨'}</div>
            <div>
              <div className="student-name">{student.name} <span className="badge badge-green">✓ যাচাইকৃত</span></div>
              <div className="student-meta">
                {student.department} · {yearLabel(student.year)} · আইডি: {student.studentId}
              </div>
              <div className="student-meta">
                {student.gender === 'female' ? 'ছাত্রী' : 'ছাত্র'} · {HALL_BY_ID[student.hallId]?.name || '—'} · {student.email}
              </div>
            </div>
          </section>
          <h2 className="section-title spaced">এই শিক্ষার্থীর টোকেন</h2>
          <div className="table-card"><TokenTable rows={mine} /></div>
        </>
      ) : (
        !error && <Empty icon="🧑‍🎓" title="শিক্ষার্থীর আইডি দিয়ে খুঁজুন">তথ্য ও টোকেনের অবস্থা এখানে দেখা যাবে।</Empty>
      )}
    </>
  );
}
