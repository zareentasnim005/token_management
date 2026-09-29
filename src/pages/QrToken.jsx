import { useNavigate } from 'react-router-dom';
import { useFlow } from '../context/FlowContext.jsx';
import TokenCard from '../components/TokenCard.jsx';
import { bn } from '../utils/format.js';

export default function QrToken() {
  const { flow, reset } = useFlow();
  const navigate = useNavigate();
  const { tokens } = flow;

  const again = () => {
    reset();
    navigate('/student');
  };

  return (
    <>
      <section className="card success-card no-print">
        <div className="success-circle">✅</div>
        <h1 className="success-title">পেমেন্ট সফল হয়েছে!</h1>
        <p className="card-sub">
          আপনার {bn(tokens.length)}টি মিল টোকেন তৈরি হয়েছে। খাবার নেওয়ার সময় QR কোডটি দেখান — একটি টোকেন একবারই ব্যবহার করা যাবে।
        </p>
      </section>

      <div className="print-area">
        {tokens.map((t) => (
          <TokenCard key={t.tokenId} token={t} />
        ))}
      </div>

      <div className="btn-row no-print">
        <button type="button" className="btn btn-outline" onClick={() => window.print()}>
          🖨️ প্রিন্ট করুন
        </button>
        <button type="button" className="btn btn-primary" onClick={again}>
          নতুন টোকেন কিনুন
        </button>
      </div>
    </>
  );
}
