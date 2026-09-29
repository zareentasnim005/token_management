import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const REGION_ID = 'pust-qr-region';

/**
 * ক্যামেরা দিয়ে QR স্ক্যান। নকশা প্রোটোটাইপের মতো: গাঢ় ফ্রেম, সোনালি কোণা, "PUST CAM" ট্যাগ।
 * ক্যামেরা চালু করতে HTTPS অথবা localhost লাগে।
 */
export default function QRScanner({ onScan, disabled }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!active) return undefined;
    let stopped = false;
    const scanner = new Html5Qrcode(REGION_ID);

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => {
          if (stopped) return;
          stopped = true;
          setActive(false); // সফল স্ক্যানের পর ক্যামেরা বন্ধ
          onScanRef.current?.(text);
        },
        () => {},
      )
      .catch(() => {
        setError('ক্যামেরা চালু করা যায়নি। ব্রাউজারে ক্যামেরার অনুমতি দিন, অথবা নিচে টোকেন আইডি লিখুন।');
        setActive(false);
      });

    return () => {
      stopped = true;
      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          try {
            scanner.clear();
          } catch {
            /* ignore */
          }
        });
    };
  }, [active]);

  return (
    <div>
      <div className={`cam-frame ${active ? 'live' : ''}`}>
        <div id={REGION_ID} className="cam-region" />
        {!active && (
          <div className="cam-placeholder">
            <div className="cam-icon">📷</div>
            <div>ক্যামেরা ভিউ</div>
            <button
              type="button"
              className="btn btn-amber btn-sm"
              disabled={disabled}
              onClick={() => {
                setError('');
                setActive(true);
              }}
            >
              ক্যামেরা চালু করুন
            </button>
          </div>
        )}
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <span className="cam-tag">PUST CAM</span>
      </div>
      {active && (
        <button type="button" className="btn btn-outline btn-sm cam-stop" onClick={() => setActive(false)}>
          ক্যামেরা বন্ধ করুন
        </button>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
