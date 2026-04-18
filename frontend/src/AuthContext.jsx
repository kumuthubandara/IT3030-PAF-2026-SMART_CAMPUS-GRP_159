import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "smart-campus-auth";

/** Reads persisted auth payload from sessionStorage; returns null if missing or invalid JSON. */
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

/** Provides auth state (`user`) and `login` / `logout` to the React tree. */
export function AuthProvider({ children }) {
  /** Sync read on first paint so /dashboard sees the correct role immediately (no flash to login / wrong dashboard). */
  const [user, setUser] = useState(() => readStoredUser());

  /** Persists the signed-in user to session storage and updates React state. */
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

  /** Clears session storage and sets the current user to null. */
  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  /** Memoized context value `{ user, login, logout }` for Provider consumers. */
  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** Returns `{ user, login, logout }` from context; throws if there is no provider. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
