import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import TicketsPage from "./TicketsPage";

/**
 * Guards /tickets/manage: only staff roles should see the full ticket table.
 * Students and lecturers use their own maintenance/submit flows instead.
 */
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
