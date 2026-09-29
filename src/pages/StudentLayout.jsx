import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Stepper from '../components/Stepper.jsx';
import { useFlow } from '../context/FlowContext.jsx';
import { MEAL_KEYS } from '../config.js';

const STEP_BY_PATH = {
  '/student': 1,
  '/student/hall': 2,
  '/student/meal': 3,
  '/student/payment': 4,
  '/student/token': 5,
};

/** Stepper + ধাপ-সুরক্ষা (আগের ধাপ শেষ না করে পরের ধাপে ঢোকা যাবে না) */
export default function StudentLayout() {
  const { pathname } = useLocation();
  const { flow } = useFlow();
  const step = STEP_BY_PATH[pathname.replace(/\/$/, '')] || 1;

  const hasMeal = MEAL_KEYS.some((k) => flow.selection[k].checked && flow.selection[k].option);

  if (step >= 2 && !flow.student) return <Navigate to="/student" replace />;
  if (step >= 3 && step <= 4 && !flow.hall) return <Navigate to="/student/hall" replace />;
  if (step === 4 && !hasMeal) return <Navigate to="/student/meal" replace />;
  if (step === 4 && flow.tokens.length) return <Navigate to="/student/token" replace />;
  if (step === 5 && !flow.tokens.length) return <Navigate to="/student" replace />;

  return (
    <>
      <Stepper current={step} />
      <main className="container narrow page-pad">
        <Outlet />
      </main>
    </>
  );
}
