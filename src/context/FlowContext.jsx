import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const FLOW_KEY = 'pust-student-flow-v1';
const KEY = FLOW_KEY;

const emptySelection = () => ({
  breakfast: { checked: false, mealId: null },
  lunch: { checked: false, mealId: null },
  dinner: { checked: false, mealId: null },
});
const initial = () => ({ student: null, hall: null, selection: emptySelection(), tokens: [] });

const FlowCtx = createContext(null);

/** শিক্ষার্থীর ধাপগুলোর তথ্য (আইডি → হল → মিল → পেমেন্ট → QR)। পেজ রিফ্রেশ করলেও sessionStorage এ থাকে। */
export function FlowProvider({ children }) {
  const [flow, setFlow] = useState(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? { ...initial(), ...JSON.parse(raw) } : initial();
    } catch {
      return initial();
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(flow));
    } catch {
      /* ignore */
    }
  }, [flow]);

  const api = useMemo(
    () => ({
      flow,
      setStudent: (student) => setFlow({ ...initial(), student }),
      setHall: (hall) => setFlow((f) => ({ ...f, hall })),
      setSelection: (selection) => setFlow((f) => ({ ...f, selection })),
      setTokens: (tokens) => setFlow((f) => ({ ...f, tokens })),
      reset: () => setFlow(initial()),
    }),
    [flow],
  );

  return <FlowCtx.Provider value={api}>{children}</FlowCtx.Provider>;
}

export const useFlow = () => useContext(FlowCtx);
