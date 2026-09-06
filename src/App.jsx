import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";

function Gate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="h-screen w-screen bg-bg flex items-center justify-center">
        <div className="text-dim text-sm num">loading…</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="staff"
            element={user.role === "admin" ? <Staff /> : <Navigate to="/" replace />}
          />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </HashRouter>
  );
}
