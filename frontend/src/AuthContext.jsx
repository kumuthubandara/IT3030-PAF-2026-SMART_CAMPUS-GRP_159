import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "smart-campus-auth";

function normalizeRole(role) {
  const r = String(role ?? "")
    .trim()
    .toLowerCase();
  if (r === "user") return "student";
  if (r === "admin") return "administrator";
  if (r === "tech") return "technician";
  return r;
}

function normalizeAccountStatus(status) {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();
  if (s === "pending") return "pending";
  return "active";
}

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.role != null) {
        parsed.role = normalizeRole(parsed.role);
      }
      parsed.accountStatus = normalizeAccountStatus(parsed.accountStatus);
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /** Sync read on first paint so /dashboard sees the correct role immediately (no flash to login / wrong dashboard). */
  const [user, setUser] = useState(() => readStoredUser());

  const login = useCallback((payload) => {
    const prev = readStoredUser();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const prevEmail = String(prev?.email ?? "").trim().toLowerCase();
    const createdAt =
      payload.createdAt ??
      (prev && email && prevEmail === email && prev.createdAt
        ? prev.createdAt
        : null) ??
      new Date().toISOString();
    const full = {
      ...payload,
      role: normalizeRole(payload.role),
      accountStatus: normalizeAccountStatus(payload.accountStatus),
      createdAt,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    setUser(full);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
