import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { subscribeCollections, subscribeTokens } from '../services/adminService.js';
import { effectiveStatus, toBDDateString, tsToMillis } from '../utils/time.js';

const Ctx = createContext(null);

/** অ্যাডমিন প্যানেলের সব পেজ একই রিয়েল-টাইম ডেটা ব্যবহার করে (টোকেন + খাবার সংগ্রহ) */
export function AdminDataProvider({ children }) {
  const { admin } = useAuth();
  const isSuper = admin?.role === 'superAdmin';
  const [rawTokens, setRawTokens] = useState(null);
  const [rawCollections, setRawCollections] = useState([]);
  const [error, setError] = useState(null);
  const [hallFilter, setHallFilter] = useState('all'); // শুধু সুপার অ্যাডমিনের জন্য

  useEffect(() => {
    if (!admin) return undefined;
    setError(null);
    const u1 = subscribeTokens(admin, setRawTokens, (e) => setError(e));
    const u2 = subscribeCollections(admin, setRawCollections, () => {});
    return () => {
      u1();
      u2();
    };
  }, [admin]);

  const today = toBDDateString();

  const tokens = useMemo(() => {
    const list = (rawTokens || [])
      .filter((t) => hallFilter === 'all' || t.hallId === hallFilter)
      .map((t) => ({ ...t, status: effectiveStatus(t, today) }));
    list.sort((a, b) => (a.mealDate === b.mealDate ? tsToMillis(b.createdAt) - tsToMillis(a.createdAt) : a.mealDate < b.mealDate ? 1 : -1));
    return list;
  }, [rawTokens, hallFilter, today]);

  const collections = useMemo(
    () =>
      rawCollections
        .filter((c) => hallFilter === 'all' || c.hallId === hallFilter)
        .sort((a, b) => tsToMillis(b.collectedAt) - tsToMillis(a.collectedAt)),
    [rawCollections, hallFilter],
  );

  const value = {
    tokens,
    collections,
    loading: rawTokens === null && !error,
    error,
    today,
    isSuper,
    hallFilter,
    setHallFilter,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdminData = () => useContext(Ctx);
