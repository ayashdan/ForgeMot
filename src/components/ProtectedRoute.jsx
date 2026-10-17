import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AppHeader from "./AppHeader";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen" />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <Outlet />
      </main>
    </>
  );
}
