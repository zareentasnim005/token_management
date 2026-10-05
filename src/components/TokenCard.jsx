import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { MEAL_META, PAYMENT_STATUS, TOKEN_STATUS } from '../config.js';
import { bn, taka } from '../utils/format.js';
import { effectiveStatus } from '../utils/time.js';
import { Badge, DetailList } from './ui.jsx';
import { useToast } from '../context/ToastContext.jsx';

const NAVY = '#1e3a6e';

async function downloadTokenImage(token, qrCanvas) {
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  const W = 640;
  const H = 900;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const font = (w, s) => `${w} ${s}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;

  g.fillStyle = '#f8fafc';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  g.strokeStyle = '#e5e7eb';
  g.beginPath();
  g.roundRect(20, 20, W - 40, H - 40, 28);
  g.fill();
  g.stroke();

  const grad = g.createLinearGradient(0, 20, W, 140);
  grad.addColorStop(0, '#1e3a6e');
  grad.addColorStop(1, '#2b559c');
  g.fillStyle = grad;
  g.beginPath();
  g.roundRect(20, 20, W - 40, 130, [28, 28, 0, 0]);
  g.fill();
  g.fillStyle = '#dbe6fb';
  g.textAlign = 'center';
  g.font = font(400, 24);
  g.fillText('মিল টোকেন', W / 2, 68);
  g.fillStyle = '#fff';
  g.font = '700 40px Inter, sans-serif';
  g.fillText(token.tokenId, W / 2, 122);

  g.strokeStyle = NAVY;
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(W / 2 - 165, 180, 330, 330, 22);
  g.stroke();
  g.drawImage(qrCanvas, W / 2 - 145, 200, 290, 290);

  const rows = [
    ['শিক্ষার্থী', token.studentName],
    ['আইডি', token.studentId],
    ['হল', token.hallName],
    ['মিল', `${MEAL_META[token.mealType]?.label || ''} (${token.menu})`],
    ['তারিখ', bn(token.mealDate)],
    ['পরিমাণ', taka(token.amount)],
    ['পেমেন্ট / স্ট্যাটাস', 'পরিশোধিত · বৈধ'],
  ];
  let y = 570;
  rows.forEach(([k, v]) => {
    g.textAlign = 'left';
    g.fillStyle = '#6b7280';
    g.font = font(400, 24);
    g.fillText(k, 60, y);
    g.textAlign = 'right';
    g.fillStyle = '#111827';
    g.font = font(600, 24);
    g.fillText(String(v), W - 60, y, 360);
    y += 46;
  });

  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = `${token.tokenId}.png`;
  a.click();
}

export default function TokenCard({ token }) {
  const wrapRef = useRef(null);
  const toast = useToast();
  const meal = MEAL_META[token.mealType];
  const status = effectiveStatus(token);
  const payInfo = PAYMENT_STATUS[token.paymentStatus] || { label: 'পরিশোধিত', tone: 'green' };
  const statusInfo = TOKEN_STATUS[status] || { label: 'বৈধ', tone: 'blue' };

  const onDownload = async () => {
    const canvas = wrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    try {
      await downloadTokenImage(token, canvas);
      toast.success('QR টোকেন ডাউনলোড হয়েছে।');
    } catch {
      toast.error('ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <article className="token-card">
      <div className="token-head">
        <div className="token-head-label">মিল টোকেন</div>
        <div className="token-id">{token.tokenId}</div>
      </div>

      <div className="token-body">
        <div className="qr-frame" ref={wrapRef}>
          <QRCodeCanvas value={token.qrCode} size={220} level="M" marginSize={1} fgColor={NAVY} bgColor="#ffffff" />
        </div>

        <div className="token-badges">
          <Badge tone={payInfo.tone}>✓ {payInfo.label}</Badge>
          <Badge tone={statusInfo.tone}>● {statusInfo.label}</Badge>
        </div>

        <DetailList
          rows={[
            { label: 'শিক্ষার্থী', value: token.studentName },
            { label: 'আইডি', value: token.studentId },
            { label: 'হল', value: token.hallName },
            { label: 'মিল', value: `${meal?.icon || ''} ${meal?.label || ''}` },
            { label: 'মেনু', value: token.menu },
            { label: 'তারিখ', value: bn(token.mealDate) },
            { label: 'পরিমাণ', value: <b>{taka(token.amount)}</b> },
          ]}
        />

        <div className="token-actions no-print">
          <button type="button" className="btn btn-outline" onClick={onDownload}>
            ⬇️ QR ডাউনলোড
          </button>
        </div>
      </div>
    </article>
  );
}