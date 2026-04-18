/**
 * Route guard for `/tickets/manage`: only admin/technician see the full queue (`TicketsPage`).
 * Students and lecturers are redirected to role-appropriate maintenance pages.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import TicketsPage from "./TicketsPage";

export default function TicketsManageRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/tickets/manage" replace />;
  }

  const role = String(user.role ?? "").trim().toLowerCase();
  if (role === "student") {
    return <Navigate to="/student/maintenance" replace />;
  }
  if (role === "lecturer") {
    return <Navigate to="/lecturer/maintenance" replace />;
  }
  if (role === "administrator" || role === "admin" || role === "technician" || role === "tech") {
    return <TicketsPage />;
  }
  return <Navigate to="/dashboard" replace />;
}
