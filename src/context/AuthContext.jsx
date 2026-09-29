import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import { fetchAdminProfile, loginAdmin, logoutAdmin } from '../services/adminService.js';

const AuthCtx = createContext(null);

/**
 * admin = অনুমোদিত অ্যাডমিন প্রোফাইল অথবা null।
 * শিক্ষার্থীর anonymous সেশন কখনো admin হিসেবে গণ্য হয় না।
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, admin: null });
  const adminRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) {
        adminRef.current = null;
        setState({ loading: false, admin: null });
        return;
      }
      if (adminRef.current?.uid === user.uid) return; // login() ইতিমধ্যে সেট করেছে
      setState((s) => ({ ...s, loading: true }));
      try {
        const p = await fetchAdminProfile(user.uid);
        const admin = p && p.approved === true ? p : null;
        adminRef.current = admin;
        setState({ loading: false, admin });
      } catch {
        adminRef.current = null;
        setState({ loading: false, admin: null });
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (username, password, hallId) => {
    const admin = await loginAdmin(username, password, hallId);
    adminRef.current = admin;
    setState({ loading: false, admin });
    return admin;
  }, []);

  const logout = useCallback(async () => {
    adminRef.current = null;
    await logoutAdmin();
    setState({ loading: false, admin: null });
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
