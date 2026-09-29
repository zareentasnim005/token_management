import { useEffect, useState } from 'react';
import { HALL_BY_ID, MEAL_META, PAYMENT_STATUS, TOKEN_STATUS } from '../config.js';
import { bn, taka } from '../utils/format.js';
import { formatDateTime } from '../utils/time.js';
import { Badge, Empty } from './ui.jsx';

/** টোকেন লগ ও ইতিহাসে ব্যবহৃত টেবিল */
export default function TokenTable({ rows, showHall = false, pageSize = 50 }) {
  const [limit, setLimit] = useState(pageSize);
  useEffect(() => setLimit(pageSize), [rows, pageSize]);

  if (!rows.length) {
    return <Empty icon="🔎" title="কোনো টোকেন পাওয়া যায়নি">ফিল্টার বদলে আবার চেষ্টা করুন।</Empty>;
  }

  const visible = rows.slice(0, limit);
  return (
    <>
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>টোকেন আইডি</th>
              <th>শিক্ষার্থী আইডি</th>
              <th>নাম</th>
              {showHall && <th>হল</th>}
              <th>মিল</th>
              <th>তারিখ</th>
              <th>পরিমাণ</th>
              <th>পেমেন্ট</th>
              <th>টোকেন স্ট্যাটাস</th>
              <th>সংগ্রহের সময়</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => {
              const m = MEAL_META[t.mealType];
              const ps = PAYMENT_STATUS[t.paymentStatus] || { label: t.paymentStatus, tone: 'gray' };
              const ts = TOKEN_STATUS[t.status] || { label: t.status, tone: 'gray' };
              return (
                <tr key={t.tokenId}>
                  <td className="mono">{t.tokenId}</td>
                  <td className="mono muted">{t.studentId}</td>
                  <td className="strong">{t.studentName}</td>
                  {showHall && <td>{HALL_BY_ID[t.hallId]?.name || t.hallId}</td>}
                  <td className="nowrap">
                    {m?.icon} {m?.label}
                  </td>
                  <td className="muted nowrap">{bn(t.mealDate)}</td>
                  <td className="strong nowrap">{taka(t.amount)}</td>
                  <td><Badge tone={ps.tone}>{ps.label}</Badge></td>
                  <td><Badge tone={ts.tone}>{ts.label}</Badge></td>
                  <td className="muted nowrap">{t.collectedAt ? formatDateTime(t.collectedAt) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <div className="table-more">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setLimit((l) => l + pageSize)}>
            আরও দেখান ({bn(rows.length - limit)}টি বাকি)
          </button>
        </div>
      )}
    </>
  );
}
