import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "smart-campus-auth";

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
    const full = { ...payload, createdAt };
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
