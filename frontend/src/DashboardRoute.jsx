import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StudentDashboardPage from "./StudentDashboardPage";
import LecturerDashboardPage from "./LecturerDashboardPage";
import AdminDashboardPage from "./AdminDashboardPage";
import DashboardPage from "./DashboardPage";

export default function DashboardRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
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
  if (role === "administrator" || role === "admin") {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
}
