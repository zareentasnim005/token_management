import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMealOptions } from '../services/studentService.js';
import { useFlow } from '../context/FlowContext.jsx';
import { DEADLINE_NOTICE, DEADLINE_SHORT, MEAL_KEYS, MEAL_META } from '../config.js';
import { bn, taka } from '../utils/format.js';
import { formatRemaining, getPurchaseWindow } from '../utils/time.js';
import { Alert, Spinner } from '../components/ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MealSelect() {
  const { flow, setSelection } = useFlow();
  const navigate = useNavigate();
  const toast = useToast();
  const [options, setOptions] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(flow.selection);
  const [win, setWin] = useState(getPurchaseWindow());

  useEffect(() => {
    const t = setInterval(() => setWin(getPurchaseWindow()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    getMealOptions()
      .then((l) => alive && setOptions(l))
      .catch(() => alive && setError('মেনু লোড করা যায়নি। আবার চেষ্টা করুন।'));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (k) =>
    setSel((s) => ({ ...s, [k]: { checked: !s[k].checked, option: s[k].checked ? null : s[k].option } }));
  const choose = (k, option) => setSel((s) => ({ ...s, [k]: { checked: true, option } }));

  const checked = MEAL_KEYS.filter((k) => sel[k].checked);
  const complete = checked.length > 0 && checked.every((k) => sel[k].option);
  const total = checked.reduce((sum, k) => sum + (sel[k].option?.price || 0), 0);
  const canPay = complete && win.open;

  const next = () => {
    const w = getPurchaseWindow();
    setWin(w);
    if (!w.open) return toast.error('টোকেন কেনার সময় শেষ হয়ে গেছে (রাত ১০:০০টা)।');
    setSelection(sel);
    navigate('/student/payment');
  };

  return (
    <section className="card card-pad">
      <h1 className="card-title">মিল নির্বাচন করুন</h1>

      <Alert tone="warn" icon="⚠️">{DEADLINE_NOTICE}</Alert>

      {win.open ? (
        <p className="deadline-line">
          📅 খাবারের তারিখ: <b>{bn(win.mealDate)}</b> (আগামীকাল) · টোকেন কেনার বাকি সময়: <b>{formatRemaining(win.remainingMs)}</b>
        </p>
      ) : (
        <Alert tone="error" icon="⛔">
          {DEADLINE_SHORT} রাত ১০:০০টা পার হয়ে গেছে, তাই এখন টোকেন কেনা যাবে না। রাত ১২:০০টার পর আবার চেষ্টা করুন।
        </Alert>
      )}

      {error && <Alert tone="error" icon="⚠️">{error}</Alert>}
      {!options && !error && <Spinner label="মেনু লোড হচ্ছে…" />}

      {options && (
        <div className="meal-list">
          {MEAL_KEYS.map((k) => {
            const meta = MEAL_META[k];
            const isOn = sel[k].checked;
            const list = options.filter((o) => o.meal === k);
            return (
              <div key={k} className={`meal-card ${isOn ? 'selected' : ''}`}>
                <button
                  type="button"
                  className="meal-head"
                  role="checkbox"
                  aria-checked={isOn}
                  disabled={!win.open}
                  onClick={() => toggle(k)}
                >
                  <span className="meal-icon">{meta.icon}</span>
                  <span className="option-text">
                    <span className="option-title">{meta.label}</span>
                    <span className="option-sub">
                      {sel[k].option ? sel[k].option.menu : 'মেনু থেকে বেছে নিন'}
                    </span>
                  </span>
                  <span className={`checkbox ${isOn ? 'on' : ''}`}>{isOn && '✓'}</span>
                </button>

                {isOn && (
                  <div className="menu-list" role="radiogroup" aria-label={`${meta.label} মেনু`}>
                    <div className="menu-title">মেনু বেছে নিন</div>
                    {list.length === 0 && <div className="menu-empty">এই বেলার মেনু এখনো যোগ করা হয়নি।</div>}
                    {list.map((o) => {
                      const on = sel[k].option?.mealId === o.mealId;
                      return (
                        <button
                          key={o.mealId}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          className={`menu-row ${on ? 'on' : ''}`}
                          onClick={() => choose(k, o)}
                        >
                          <span className="menu-food">🍚</span>
                          <span className="menu-name">{o.menu}</span>
                          <span className="menu-price">{taka(o.price)}</span>
                          <span className={`radio ${on ? 'on' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="total-box">
        <span>মোট টাকা ({bn(checked.length)}টি মিল)</span>
        <strong>{taka(total)}</strong>
      </div>
      {checked.length > 0 && !complete && (
        <p className="field-hint">প্রতিটি নির্বাচিত বেলার জন্য একটি মেনু বেছে নিন।</p>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={() => navigate('/student/hall')}>
          ← পেছনে
        </button>
        <button type="button" className="btn btn-primary" disabled={!canPay} onClick={next}>
          পেমেন্ট করুন →
        </button>
      </div>
    </section>
  );
}
