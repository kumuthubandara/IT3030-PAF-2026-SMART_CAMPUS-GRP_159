import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";

/** priorityLabel. */
function priorityLabel(p) {
  if (p === "HIGH") return { text: "HIGH", dot: "🔴", cls: "text-red-300" };
  if (p === "MEDIUM") return { text: "MED", dot: "🟠", cls: "text-orange-300" };
  return { text: "LOW", dot: "🟢", cls: "text-emerald-300" };
}

/** Helper: formatLastUpdate. */
function formatLastUpdate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const ySame =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (ySame) return "Yesterday";
  return d.toLocaleDateString();
}

/** UI: StudentEmergencyDashboardPage. */
export default function StudentEmergencyDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isStudent = role === "student";

  useEffect(() => {
    if (!user || !isStudent) return;
    let cancelled = false;
    /** Helper: load. */
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await ticketsApi.listTickets(user, {
          status: statusFilter || undefined,
          q: search.trim() || undefined,
        });
        if (!cancelled) setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load tickets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, isStudent, statusFilter, search]);

  /** Aggregated ticket counts (pending, resolved, high-priority open) for summary UI. */
  const summary = useMemo(() => {
    const pending = tickets.filter((t) =>
      ["OPEN", "IN_PROGRESS"].includes(t.status)
    ).length;
    const resolved = tickets.filter((t) =>
      ["RESOLVED", "CLOSED"].includes(t.status)
    ).length;
    const highOpen = tickets.filter(
      (t) => t.priority === "HIGH" && !["CLOSED", "REJECTED"].includes(t.status)
    ).length;
    return { pending, resolved, highOpen };
  }, [tickets]);

  if (!user) {
    return <Navigate to="/login?redirect=/student/maintenance" replace />;
  }
  if (!isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Wireframe: top bar */}
      <header className="border-b border-cyan-500/20 bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950">
              SC
            </span>
            <span className="font-heading text-lg font-semibold text-white sm:text-xl">
              Smart Campus
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/notifications#notifications"
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300"
              aria-label="Notifications"
            >
              🔔
            </Link>
            <Link
              to="/dashboard"
              className="hidden max-w-[120px] truncate rounded-full border border-cyan-500/40 px-3 py-1.5 text-xs font-medium text-cyan-200 sm:inline"
            >
              Profile
            </Link>
          </div>
        </div>
        {/* Wireframe: secondary nav */}
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-700/50 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <Link to="/" className="text-slate-400 hover:text-cyan-300">
            Home
          </Link>
          <Link to="/facilities" className="text-slate-400 hover:text-cyan-300">
            My Bookings
          </Link>
          <span className="font-semibold text-cyan-400">Maintenance</span>
          <Link to="/contact" className="text-slate-400 hover:text-cyan-300">
            Help
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="ml-auto text-slate-400 hover:text-red-300"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {/* Report an issue */}
        <section className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-slate-900 to-red-950/30 p-6 shadow-lg shadow-red-950/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-300/90">
                🚨 Report an issue
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Facing a problem? Report instantly
              </p>
            </div>
            <Link
              to="/student/submit-ticket"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition hover:bg-red-400"
            >
              <span aria-hidden>+</span> Report Emergency Issue
            </Link>
          </div>
        </section>

        {/* My tickets */}
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-cyan-300">📋 My tickets</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2">
              <span className="text-slate-500" aria-hidden>
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              Filter
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              >
                <option value="">Status ▼ (all)</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-600/60 bg-slate-800/80 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Issue</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last update</th>
                    <th className="px-4 py-3 font-medium">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No tickets yet. Use Report Emergency Issue to create one.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => {
                      const pr = priorityLabel(t.priority);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-mono text-slate-300">{t.id}</td>
                          <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white sm:max-w-xs">
                            {t.title}
                          </td>
                          <td className={`px-4 py-3 ${pr.cls}`}>
                            {pr.dot} {pr.text}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{t.status}</td>
                          <td className="px-4 py-3 text-slate-400">
                            {formatLastUpdate(t.updatedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/tickets/${t.id}`}
                              className="font-medium text-cyan-400 hover:text-cyan-300"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Quick summary */}
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-cyan-300">📊 Quick summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
              <p className="text-2xl">🟡</p>
              <p className="mt-2 text-2xl font-bold text-amber-200">{summary.pending}</p>
              <p className="text-xs text-amber-100/80">Pending</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <p className="text-2xl">🟢</p>
              <p className="mt-2 text-2xl font-bold text-emerald-200">{summary.resolved}</p>
              <p className="text-xs text-emerald-100/80">Resolved</p>
            </div>
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
              <p className="text-2xl">🔴</p>
              <p className="mt-2 text-2xl font-bold text-red-200">{summary.highOpen}</p>
              <p className="text-xs text-red-100/80">High priority (open)</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
