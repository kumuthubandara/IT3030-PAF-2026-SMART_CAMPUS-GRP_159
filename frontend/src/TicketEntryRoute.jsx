/**
 * Role-aware entry for /tickets: sends each role to the correct first screen
 * (student submit, lecturer submit, staff management).
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function TicketEntryRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/tickets" replace />;
  }

  const role = String(user.role ?? "").trim().toLowerCase();
  if (role === "student") {
    return <Navigate to="/student/submit-ticket" replace />;
  }
  if (role === "lecturer") {
    return <Navigate to="/lecturer/submit-ticket" replace />;
  }
  return <Navigate to="/tickets/manage" replace />;
}
