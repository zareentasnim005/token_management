import { useEffect } from 'react';
import { MEAL_KEYS, MEAL_META } from '../config.js';
import { bn } from '../utils/format.js';

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Spinner({ label = 'লোড হচ্ছে…' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function Empty({ icon = '📭', title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {children && <div className="empty-text">{children}</div>}
    </div>
  );
}

export function Alert({ tone = 'info', icon, children }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {icon && <span className="alert-icon">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

export function StatCard({ icon, label, value, tone = 'blue', hint }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

/** সব / নাস্তা / দুপুর / রাত ফিল্টার চিপ */
export function MealChips({ value, onChange }) {
  const items = [{ k: 'all', l: 'সব' }, ...MEAL_KEYS.map((k) => ({ k, l: MEAL_META[k].label }))];
  return (
    <div className="chips" role="group" aria-label="মিল ফিল্টার">
      {items.map((it) => (
        <button
          key={it.k}
          type="button"
          className={`chip ${value === it.k ? 'active' : ''}`}
          aria-pressed={value === it.k}
          onClick={() => onChange(it.k)}
        >
          {it.l}
        </button>
      ))}
    </div>
  );
}

/** সহজ CSS বার চার্ট। data = [{ label, value, display }] */
export function BarChart({ data, height = 150, color = 'var(--navy)' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bar-chart" style={{ height: height + 44 }} role="img" aria-label="বার চার্ট">
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div className="bar-val">{d.display ?? bn(d.value)}</div>
          <div className="bar-track" style={{ height }}>
            <div className="bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ open, title, children, footer, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/** লেবেল–মান জোড়ার তালিকা */
export function DetailList({ rows }) {
  return (
    <dl className="detail-list">
      {rows
        .filter((r) => r && r.value !== undefined && r.value !== null)
        .map((r) => (
          <div key={r.label} className="detail-row">
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
    </dl>
  );
}
