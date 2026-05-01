import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import StudentSettingsPage from "./StudentSettingsPage";

export default function StudentSettingsRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/settings" replace />;
  }

  return <StudentSettingsPage />;
}
