import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/pages/AuthPage";
import { Dashboard } from "@/pages/Dashboard";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { Login } from "@/pages/Login";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  const { status } = useAuth();

  return (
    <Routes>
      {/* Мубодилаи токен новобаста аз ҳолати сессия кор мекунад */}
      <Route path="/auth" element={<AuthPage />} />

      {status === "loading" ? (
        <Route
          path="*"
          element={
            <div className="flex min-h-dvh items-center justify-center">
              <Spinner />
            </div>
          }
        />
      ) : status === "anonymous" ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}
