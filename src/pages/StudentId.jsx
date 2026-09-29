import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent } from '../services/studentService.js';
import { useFlow } from '../context/FlowContext.jsx';
import { SHOW_DEMO_HINTS } from '../config.js';
import { isValidStudentId } from '../utils/token.js';
import { isFirebaseConfigured } from '../firebase.js';

export default function StudentId() {
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setStudent } = useFlow();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const value = id.trim();
    setError('');
    if (!value) return setError('শিক্ষার্থী আইডি লিখুন।');
    if (!isValidStudentId(value)) return setError('আইডি শুধু ইংরেজি সংখ্যা দিয়ে লিখুন (যেমন: 2022201001)।');
    if (!isFirebaseConfigured) return setError('Firebase কনফিগার করা হয়নি। README অনুযায়ী .env ফাইল তৈরি করুন।');

    setLoading(true);
    try {
      const student = await getStudent(value);
      if (!student) {
        setError('এই আইডি দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি। আইডি ঠিক আছে কি না আবার দেখুন।');
        return;
      }
      setStudent(student);
      navigate('/student/hall');
    } catch (err) {
      console.error(err);
      setError(
        err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation'
          ? 'Firebase Authentication-এ "Anonymous" সাইন-ইন চালু করা নেই। (README ধাপ ৩ দেখুন)'
          : 'সংযোগে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card card-pad" onSubmit={submit} noValidate>
      <h1 className="card-title">শিক্ষার্থী আইডি দিন</h1>
      <p className="card-sub">আপনার বিশ্ববিদ্যালয় আইডি নম্বর লিখুন</p>

      <div className="field">
        <label htmlFor="sid">শিক্ষার্থী আইডি</label>
        <input
          id="sid"
          className={`input ${error ? 'input-error' : ''}`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="যেমন: 2022201001"
          value={id}
          onChange={(e) => setId(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'sid-err' : undefined}
          autoFocus
        />
        {error && <p id="sid-err" className="field-error" role="alert">{error}</p>}
      </div>

      {SHOW_DEMO_HINTS && (
        <div className="hint-box">
          <strong>পরীক্ষার আইডি:</strong> 2021101001, 2022201001, 2023301001 (ছেলে: 2022201002)
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'যাচাই হচ্ছে…' : 'পরবর্তী ধাপ →'}
      </button>
    </form>
  );
}
