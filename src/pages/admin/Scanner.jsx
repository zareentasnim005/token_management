import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { collectToken, lookupToken } from '../../services/adminService.js';
import QRScanner from '../../components/QRScanner.jsx';
import { DetailList, Modal } from '../../components/ui.jsx';
import { MEAL_META, SHOW_DEMO_HINTS } from '../../config.js';
import { bn, taka } from '../../utils/format.js';
import { formatDateTime } from '../../utils/time.js';
import { isValidTokenId, parseQrPayload } from '../../utils/token.js';

const PROBLEMS = {
  not_found: ['❌ টোকেন পাওয়া যায়নি', 'এই আইডির কোনো টোকেন ডেটাবেসে নেই। QR কোড নকল হতে পারে।'],
  other_hall: ['🚫 অন্য হলের টোকেন', 'এই টোকেনটি আপনার হলের নয় (বা টোকেনটি নেই)। খাবার দেওয়া যাবে না।'],
  mismatch: ['🚨 QR কোড সন্দেহজনক', 'QR-এর তথ্য ডেটাবেসের সাথে মিলছে না। খাবার দেবেন না।'],
  unpaid: ['💳 পেমেন্ট সম্পন্ন হয়নি', 'এই টোকেনের পেমেন্ট সম্পন্ন নয়, তাই এটি বৈধ নয়।'],
  collected: ['⚠️ টোকেনটি আগেই ব্যবহার করা হয়েছে', 'এই টোকেন দিয়ে খাবার নেওয়া হয়ে গেছে। আবার দেওয়া যাবে না।'],
  expired: ['⌛ টোকেনের মেয়াদ শেষ', 'এই টোকেনের তারিখ পেরিয়ে গেছে।'],
  future: ['📅 আজকের টোকেন নয়', 'এই টোকেনটি পরবর্তী কোনো দিনের জন্য কেনা হয়েছে।'],
  error: ['⚠️ যাচাই করা যায়নি', 'সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।'],
};

function tokenRows(t) {
  return [
    { label: 'শিক্ষার্থী আইডি', value: t.studentId },
    { label: 'নাম', value: t.studentName },
    { label: 'হল', value: t.hallName },
    { label: 'মিল', value: `${MEAL_META[t.mealType]?.icon || ''} ${MEAL_META[t.mealType]?.label || ''} — ${t.menu || ''}` },
    { label: 'তারিখ', value: bn(t.mealDate) },
    { label: 'পরিমাণ', value: <b>{taka(t.amount)}</b> },
  ];
}

export default function Scanner() {
  const { admin } = useAuth();
  const toast = useToast();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [inputError, setInputError] = useState('');

  const verify = async (text) => {
    const parsed = parseQrPayload(text);
    if (!isValidTokenId(parsed.tokenId)) {
      setResult(null);
      return setInputError('সঠিক টোকেন আইডি লিখুন (যেমন: TKN-002)।');
    }
    setInputError('');
    setBusy(true);
    setResult(null);
    try {
      setResult(await lookupToken(text, admin));
    } catch (e) {
      console.error(e);
      setResult({ status: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const doCollect = async () => {
    setConfirm(false);
    setCollecting(true);
    try {
      await collectToken(result.token.tokenId, admin);
      toast.success('খাবার সংগ্রহ সম্পন্ন হয়েছে।');
      setResult({ status: 'done', token: { ...result.token, tokenStatus: 'Collected' } });
    } catch (e) {
      const map = { ALREADY_COLLECTED: 'collected', WRONG_DATE: 'expired', UNPAID: 'unpaid', NOT_FOUND: 'not_found' };
      if (map[e.message]) {
        // অন্য কেউ এইমাত্র ব্যবহার করে ফেললে এখানে ধরা পড়ে
        setResult({ status: map[e.message], token: result.token });
      } else {
        console.error(e);
        toast.error('সংগ্রহ নিশ্চিত করা যায়নি। আবার চেষ্টা করুন।');
      }
    } finally {
      setCollecting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setManual('');
  };

  return (
    <section className="card card-pad scan-card">
      <h1 className="card-title">টোকেন যাচাই করুন</h1>

      <QRScanner disabled={busy} onScan={verify} />

      <div className="field">
        <label htmlFor="tk">টোকেন আইডি লিখুন</label>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            verify(manual);
          }}
        >
          <input
            id="tk"
            className={`input mono ${inputError ? 'input-error' : ''}`}
            placeholder="যেমন: TKN-002"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? '…' : 'স্ক্যান'}
          </button>
        </form>
        {inputError && <p className="field-error" role="alert">{inputError}</p>}
      </div>

      {SHOW_DEMO_HINTS && (
        <div className="hint-box">
          <strong>পরীক্ষার টোকেন:</strong> TKN-002 (অব্যবহৃত), TKN-001 (ব্যবহৃত), TKN-005 (মেয়াদোত্তীর্ণ)
        </div>
      )}

      {result?.status === 'valid' && (
        <div className="result result-ok" role="status">
          <div className="result-title">✅ বৈধ টোকেন</div>
          <div className="result-id mono">{result.token.tokenId}</div>
          <DetailList rows={tokenRows(result.token)} />
          <button type="button" className="btn btn-success" disabled={collecting} onClick={() => setConfirm(true)}>
            {collecting ? 'অপেক্ষা করুন…' : '🍽️ খাবার সংগ্রহ নিশ্চিত করুন'}
          </button>
        </div>
      )}

      {result?.status === 'done' && (
        <div className="result result-ok" role="status">
          <div className="result-title">🎉 খাবার প্রদান সম্পন্ন</div>
          <div className="result-id mono">{result.token.tokenId}</div>
          <DetailList rows={tokenRows(result.token)} />
          <p className="muted small">টোকেনটি এখন "ব্যবহৃত" — আর ব্যবহার করা যাবে না।</p>
          <button type="button" className="btn btn-primary" onClick={reset}>পরবর্তী টোকেন স্ক্যান করুন</button>
        </div>
      )}

      {result && PROBLEMS[result.status] && (
        <div className="result result-bad" role="alert">
          <div className="result-title">{PROBLEMS[result.status][0]}</div>
          <p>{PROBLEMS[result.status][1]}</p>
          {result.status === 'collected' && result.token?.collectedAt && (
            <p className="small">সংগ্রহের সময়: <b>{formatDateTime(result.token.collectedAt)}</b></p>
          )}
          {result.token && result.status !== 'other_hall' && <DetailList rows={tokenRows(result.token)} />}
          <button type="button" className="btn btn-outline" onClick={reset}>আবার চেষ্টা করুন</button>
        </div>
      )}

      <Modal
        open={confirm}
        title="খাবার সংগ্রহ নিশ্চিত করবেন?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(false)}>বাতিল</button>
            <button type="button" className="btn btn-success btn-sm" onClick={doCollect}>হ্যাঁ, নিশ্চিত</button>
          </>
        }
      >
        <p>নিশ্চিত করলে টোকেনটি "ব্যবহৃত" হয়ে যাবে এবং আর কাজ করবে না।</p>
      </Modal>
    </section>
  );
}
