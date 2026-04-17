import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { useAuth } from "./AuthContext";
import { apiGet, apiPatch } from "./api";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

function formatTime(iso) {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleString();
}

export default function NotificationsPage() {
  const { hash } = useLocation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState("");
  const [markAllBusy, setMarkAllBusy] = useState(false);

  const authHeaders = useMemo(() => {
    if (!user?.email) return {};
    return {
      "X-User-Email": user.email,
      "X-User-Role": String(user.role || "student").toUpperCase(),
    };
  }, [user]);

  const unreadCount = useMemo(
    () => items.reduce((total, item) => (item.read ? total : total + 1), 0),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((item) => !item.read);
    if (filter === "read") return items.filter((item) => item.read);
    return items;
  }, [items, filter]);

  useEffect(() => {
    if (hash !== "#notifications") return;
    const el = document.getElementById("notifications");
    if (!el) return;
    const t = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [hash]);

  async function loadNotifications() {
    if (!user?.email) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(
        `/api/notifications?userEmail=${encodeURIComponent(user.email)}`,
        authHeaders
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authHeaders]);

  async function markAsRead(id, read) {
    setProcessingId(id);
    setError("");
    try {
      const updated = await apiPatch(`/api/notifications/${id}/read?read=${read}`, authHeaders);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err.message || "Failed to update notification");
    } finally {
      setProcessingId("");
    }
  }

  async function markAllAsRead() {
    const unreadItems = items.filter((item) => !item.read);
    if (unreadItems.length === 0) return;
    setMarkAllBusy(true);
    setError("");
    try {
      const updatedItems = await Promise.all(
        unreadItems.map((item) =>
          apiPatch(`/api/notifications/${item.id}/read?read=true`, authHeaders)
        )
      );
      const updatedMap = new Map(updatedItems.map((item) => [item.id, item]));
      setItems((prev) => prev.map((item) => updatedMap.get(item.id) || item));
    } catch (err) {
      setError(err.message || "Failed to mark all as read");
    } finally {
      setMarkAllBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400/90">
              Smart notifications
            </p>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Your campus activity
            </h1>
            <p className="mt-4 text-sm text-slate-400 sm:text-base">
              Track approvals, ticket updates, and comments in one place.
            </p>
          </div>
        </section>

        <section
          id="notifications"
          className="mx-auto w-full max-w-3xl scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
        >
          <h2 className="sr-only">Recent notifications</h2>

          <div className="mb-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filter === f.id
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-slate-700 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{unreadCount} unread</span>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={markAllBusy || unreadCount === 0}
                  className="rounded-lg border border-cyan-400/40 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {markAllBusy ? "Processing..." : "Mark all as read"}
                </button>
                <button
                  type="button"
                  onClick={loadNotifications}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
              <div className="h-20 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
              <div className="h-20 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
            </div>
          ) : error ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-400">
              No {filter === "all" ? "" : filter} notifications right now.
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    item.read
                      ? "border-slate-800 bg-slate-900/60"
                      : "border-cyan-500/30 bg-cyan-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-100">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                    </div>
                    {!item.read ? (
                      <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                        New
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => markAsRead(item.id, !item.read)}
                      disabled={processingId === item.id}
                      className="rounded-lg border border-cyan-400/40 px-3 py-1 text-xs text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingId === item.id
                        ? "Updating..."
                        : item.read
                          ? "Mark as unread"
                          : "Mark as read"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            Prefer email? Adjust preferences on the{" "}
            <Link to="/settings" className="text-cyan-400 hover:text-cyan-300">
              settings
            </Link>{" "}
            page or contact{" "}
            <Link to="/contact" className="text-cyan-400 hover:text-cyan-300">
              IT support
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
