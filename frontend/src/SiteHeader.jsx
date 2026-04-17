import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiGet } from "./api";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Facilities", to: "/facilities" },
  { label: "Maintenance", to: "/maintenance" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Dashboard", to: "/dashboard" },
];

function isActivePath(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function SiteHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const displayRole = String(user?.role || "user")
    .replaceAll("_", " ")
    .toLowerCase();

  const authHeaders = useMemo(() => {
    if (!user?.email) return {};
    return {
      "X-User-Email": user.email,
      "X-User-Role": String(user.role || "USER").toUpperCase(),
    };
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function loadUnreadCount() {
      if (!user?.email) {
        setUnreadCount(0);
        return;
      }
      try {
        const data = await apiGet(
          `/api/notifications/unread-count?userEmail=${encodeURIComponent(user.email)}`,
          authHeaders
        );
        if (!ignore) {
          setUnreadCount(Number(data?.unreadCount || 0));
        }
      } catch {
        if (!ignore) {
          setUnreadCount(0);
        }
      }
    }
    loadUnreadCount();
    return () => {
      ignore = true;
    };
  }, [user, authHeaders, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
        <Link to="/" className="min-w-0 shrink-0 text-left">
          <h1 className="font-heading text-lg font-bold tracking-wide text-white sm:text-xl">
            SMART CAMPUS
          </h1>
          <p className="text-xs text-slate-300 sm:text-sm">Campus Operations Hub</p>
        </Link>

        <nav
          className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5 lg:gap-8"
          aria-label="Main navigation"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`whitespace-nowrap text-sm font-medium transition ${
                isActivePath(pathname, item.to)
                  ? "text-cyan-400"
                  : "text-slate-400 hover:text-cyan-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Link
            id="notifications-bell"
            to="/notifications#notifications"
            aria-label="View notifications"
            className={`relative rounded-full p-2 transition sm:p-2.5 ${
              isActivePath(pathname, "/notifications")
                ? "text-cyan-400"
                : "text-slate-400 hover:bg-slate-800/80 hover:text-cyan-300"
            }`}
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 min-w-[18px] rounded-full bg-cyan-400 px-1 text-center text-[10px] font-bold text-slate-950">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
          {user ? (
            <>
              <span className="hidden rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1 text-xs text-slate-300 md:inline">
                Signed in as <span className="font-semibold text-cyan-300">{user.name}</span> ({displayRole})
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full border border-cyan-400/50 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10 sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-cyan-400/50 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10 sm:px-4 sm:py-2 sm:text-sm"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:bg-cyan-300 sm:px-4 sm:py-2 sm:text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
