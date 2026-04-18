import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StudentSettingsPage from "./StudentSettingsPage";

/** UI: StudentSettingsRoute. */
export default function StudentSettingsRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/settings" replace />;
  }

  const role = String(user.role ?? "")
    .trim()
    .toLowerCase();
  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return <StudentSettingsPage />;
}
