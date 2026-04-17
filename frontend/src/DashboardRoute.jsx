import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StudentDashboardPage from "./StudentDashboardPage";
import LecturerDashboardPage from "./LecturerDashboardPage";
import AdminDashboardPage from "./AdminDashboardPage";
import TechnicianDashboardPage from "./TechnicianDashboardPage";
import DashboardPage from "./DashboardPage";

function LogoutAndRedirectPending() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login?reason=pending" replace />;
}

export default function DashboardRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }

  const accountStatus = String(user.accountStatus ?? "active")
    .trim()
    .toLowerCase();
  if (accountStatus === "pending") {
    return <LogoutAndRedirectPending />;
  }

  const role = String(user.role ?? "")
    .trim()
    .toLowerCase();

  if (role === "student") {
    return <StudentDashboardPage />;
  }
  if (role === "lecturer") {
    return <LecturerDashboardPage />;
  }
  if (role === "administrator") {
    return <AdminDashboardPage />;
  }
  if (role === "technician") {
    return <TechnicianDashboardPage />;
  }

  return <DashboardPage />;
}
