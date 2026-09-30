import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { FlowProvider } from './context/FlowContext.jsx';
import Header from './components/Header.jsx';
import { Spinner } from './components/ui.jsx';

import Home from './pages/Home.jsx';
import StudentLayout from './pages/StudentLayout.jsx';
import StudentId from './pages/StudentId.jsx';
import HallSelect from './pages/HallSelect.jsx';
import MealSelect from './pages/MealSelect.jsx';
import Payment from './pages/Payment.jsx';
import QrToken from './pages/QrToken.jsx';
import AdminHallSelect from './pages/AdminHallSelect.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLayout from './pages/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Scanner from './pages/admin/Scanner.jsx';
import TokenLog from './pages/admin/TokenLog.jsx';

import Collection from './pages/admin/Collection.jsx';
import DailyExpense from './pages/admin/DailyExpense.jsx';
import MonthlyExpense from './pages/admin/MonthlyExpense.jsx';


function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

/** শুধু অনুমোদিত প্রশাসকরাই ঢুকতে পারবেন — শিক্ষার্থী/অতিথিকে হোম/লগইনে ফেরত পাঠানো হয় */
function RequireAdmin({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <Spinner label="যাচাই হচ্ছে…" />;
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FlowProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />

                <Route path="/student" element={<StudentLayout />}>
                  <Route index element={<StudentId />} />
                  <Route path="hall" element={<HallSelect />} />
                  <Route path="meal" element={<MealSelect />} />
                  <Route path="payment" element={<Payment />} />
                  <Route path="token" element={<QrToken />} />
                </Route>

                <Route path="/admin" element={<AdminHallSelect />} />
                <Route path="/admin/login/:hallId" element={<AdminLogin />} />
                <Route
                  path="/admin/panel"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="scanner" element={<Scanner />} />
                  <Route path="tokens" element={<TokenLog />} />

                  <Route path="collection" element={<Collection />} />
                  <Route path="daily" element={<DailyExpense />} />
                  <Route path="monthly" element={<MonthlyExpense />} />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </FlowProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
