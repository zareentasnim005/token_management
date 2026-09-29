import { bn } from '../utils/format.js';

const STEPS = ['আইডি', 'হল', 'মিল', 'পেমেন্ট', 'QR কোড'];

export default function Stepper({ current }) {
  return (
    <nav className="stepper" aria-label="ধাপসমূহ">
      <ol className="container stepper-inner">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'active' : 'todo';
          return (
            <li key={label} className={`step ${state}`} aria-current={state === 'active' ? 'step' : undefined}>
              <span className="step-num">{state === 'done' ? '✓' : bn(n)}</span>
              <span className="step-label">{label}</span>
              {n < STEPS.length && <span className="step-sep" aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
