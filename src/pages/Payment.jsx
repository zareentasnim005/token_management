import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow } from '../context/FlowContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { MEAL_KEYS, MEAL_META } from '../config.js';
import { bn, taka } from '../utils/format.js';
import { getPurchaseWindow } from '../utils/time.js';
import { isValidBkash } from '../utils/token.js';
import { demoTransactionId, payWithBkash } from '../services/paymentService.js';
import { createPaidTokens } from '../services/tokenService.js';
import { Alert, Modal } from '../components/ui.jsx';

export default function Payment() {
  const { flow, setTokens } = useFlow();
  const { student, hall, selection } = flow;
  const navigate = useNavigate();
  const toast = useToast();

  const [number, setNumber] = useState('');
  const [trx, setTrx] = useState(demoTransactionId());
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [win, setWin] = useState(getPurchaseWindow());

  useEffect(() => {
    const t = setInterval(() => setWin(getPurchaseWindow()), 30000);
    return () => clearInterval(t);
  }, []);

  const items = MEAL_KEYS.filter((k) => selection[k].checked && selection[k].option).map((k) => ({
    key: k,
    option: selection[k].option,
  }));
  const total = items.reduce((s, i) => s + i.option.price, 0);

  const validate = () => {
    const e = {};
    if (!isValidBkash(number)) e.number = 'সঠিক bKash নম্বর দিন (১১ ডিজিট, যেমন 01712345678)।';
    if (!/^[A-Za-z0-9]{8,12}$/.test(trx)) e.trx = 'ট্রানজেকশন আইডি ৮–১২ অক্ষরের হতে হবে (ইংরেজি অক্ষর/সংখ্যা)।';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onPayClick = () => {
    if (!win.open) return toast.error('টোকেন কেনার সময় শেষ হয়ে গেছে (রাত ১০:০০টা)।');
    if (validate()) setConfirmOpen(true);
  };

  const confirmPay = async () => {
    setConfirmOpen(false);
    const w = getPurchaseWindow();
    if (!w.open) return toast.error('টোকেন কেনার সময় শেষ হয়ে গেছে (রাত ১০:০০টা)।');

    setBusy(true);
    try {
      const pay = await payWithBkash({ number, transactionId: trx, amount: total });
      // পেমেন্ট সফল হলেই কেবল টোকেন তৈরি হয় (paymentStatus = "Paid")
      const tokens = await createPaidTokens({
        student,
        hall,
        options: items.map((i) => i.option),
        mealDate: w.mealDate,
        maskedNumber: pay.maskedNumber,
        transactionId: pay.transactionId,
      });
      setTokens(tokens);
      toast.success('পেমেন্ট সফল হয়েছে!');
      navigate('/student/token', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err.code === 'permission-denied'
          ? 'টোকেন তৈরি করা যায়নি — রাত ১০:০০টার সময়সীমা পার হয়ে থাকতে পারে অথবা তথ্য সঠিক নয়।'
          : 'পেমেন্ট সম্পন্ন করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card card-pad">
        <h1 className="card-title">পেমেন্ট সারাংশ</h1>

        <div className="summary-rows">
          <div className="summary-row"><span>শিক্ষার্থী</span><b>{student.name}</b></div>
          <div className="summary-row"><span>আইডি</span><b>{student.studentId}</b></div>
          <div className="summary-row"><span>হল</span><b>{hall.name}</b></div>
          <div className="summary-row"><span>তারিখ</span><b>{bn(win.mealDate)}</b></div>
        </div>

        <div className="summary-items">
          {items.map(({ key, option }) => (
            <div key={key} className="summary-item">
              <div>
                <div className="summary-item-name">
                  <span>{MEAL_META[key].icon}</span> {MEAL_META[key].label}
                </div>
                <div className="summary-item-menu">{option.menu}</div>
              </div>
              <span className="summary-item-price">{taka(option.price)}</span>
            </div>
          ))}
        </div>

        <div className="summary-total">
          <span>মোট</span>
          <strong>{taka(total)}</strong>
        </div>
      </section>

      <section className="card card-pad">
        <div className="bkash-head">
          <div className="bkash-logo">b</div>
          <div>
            <div className="bkash-title">bKash পেমেন্ট</div>
            <div className="bkash-sub">মোবাইল ব্যাংকিং</div>
          </div>
        </div>

        <Alert tone="info" icon="ℹ️">
          এটি ডেমো পেমেন্ট — বাস্তব টাকা কাটা হবে না। যেকোনো সঠিক ফরম্যাটের নম্বর দিলেই পেমেন্ট সফল হবে।
        </Alert>

        {!win.open && (
          <Alert tone="error" icon="⛔">টোকেন কেনার সময় (রাত ১০:০০টা) শেষ হয়ে গেছে।</Alert>
        )}

        <div className="field">
          <label htmlFor="bk">bKash নম্বর</label>
          <input
            id="bk"
            className={`input ${errors.number ? 'input-error' : ''}`}
            inputMode="numeric"
            maxLength={11}
            placeholder="01XXXXXXXXX"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
          />
          {errors.number && <p className="field-error" role="alert">{errors.number}</p>}
        </div>

        <div className="field">
          <label htmlFor="trx">ট্রানজেকশন আইডি (TrxID)</label>
          <input
            id="trx"
            className={`input mono ${errors.trx ? 'input-error' : ''}`}
            maxLength={12}
            value={trx}
            onChange={(e) => setTrx(e.target.value.trim().toUpperCase())}
          />
          {errors.trx && <p className="field-error" role="alert">{errors.trx}</p>}
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => navigate('/student/meal')}>
            ← পেছনে
          </button>
          <button type="button" className="btn btn-bkash" disabled={busy || !win.open} onClick={onPayClick}>
            {busy ? 'পেমেন্ট হচ্ছে…' : `পেমেন্ট করুন ${taka(total)}`}
          </button>
        </div>
      </section>

      <Modal
        open={confirmOpen}
        title="পেমেন্ট নিশ্চিত করবেন?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setConfirmOpen(false)}>বাতিল</button>
            <button type="button" className="btn btn-bkash" onClick={confirmPay}>হ্যাঁ, পেমেন্ট করুন</button>
          </>
        }
      >
        <p>
          bKash নম্বর <b>{number}</b> থেকে <b>{taka(total)}</b> পেমেন্ট করা হবে এবং {bn(items.length)}টি মিল টোকেন তৈরি হবে।
        </p>
      </Modal>

      {busy && (
        <div className="busy-overlay" role="status">
          <span className="spinner spinner-lg" />
          <p>পেমেন্ট প্রক্রিয়া চলছে… দয়া করে অপেক্ষা করুন</p>
        </div>
      )}
    </>
  );
}
