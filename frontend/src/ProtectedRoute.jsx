import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function normalizeRole(role) {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();
  if (value === "admin") return "administrator";
  if (value === "user") return "student";
  return value;
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));
    const currentRole = normalizeRole(user.role);
    if (!normalizedAllowedRoles.includes(currentRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
