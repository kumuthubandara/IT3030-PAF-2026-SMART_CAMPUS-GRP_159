import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";

function priorityTag(priority) {
  if (priority === "HIGH") return { icon: "🔴", text: "HIGH", cls: "text-red-300" };
  if (priority === "MEDIUM") return { icon: "🟠", text: "MED", cls: "text-orange-300" };
  return { icon: "🟢", text: "LOW", cls: "text-emerald-300" };
}

export default function LecturerMaintenancePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isLecturer = role === "lecturer";

  useEffect(() => {
    if (!user || !isLecturer) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await ticketsApi.listTickets(user, {
          q: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
        });
        if (!cancelled) setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load lecturer tickets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, isLecturer, search, status, priority]);

  const summary = useMemo(() => {
    const high = tickets.filter((t) => t.priority === "HIGH" && !["CLOSED", "REJECTED"].includes(t.status)).length;
    const pending = tickets.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status)).length;
    const resolved = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
    return { high, pending, resolved };
  }, [tickets]);

  if (!user) {
    return <Navigate to="/login?redirect=/lecturer/maintenance" replace />;
  }
  if (!isLecturer) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <header className="border-b border-cyan-500/20 bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-slate-950">
              SC
            </span>
            <span className="font-heading text-lg font-semibold text-white sm:text-xl">Smart Campus</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/notifications#notifications" className="rounded-full p-2 text-slate-400 hover:text-cyan-300">
              🔔
            </Link>
            <Link to="/dashboard" className="rounded-full border border-cyan-500/40 px-3 py-1.5 text-xs text-cyan-200">
              Profile
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-700/50 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <Link to="/dashboard" className="text-slate-400 hover:text-cyan-300">Dashboard</Link>
          <Link to="/facilities" className="text-slate-400 hover:text-cyan-300">Bookings</Link>
          <span className="font-semibold text-cyan-400">Maintenance</span>
          <Link to="/tickets/manage" className="text-slate-400 hover:text-cyan-300">Reports</Link>
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
        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</p> : null}

        <section className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-slate-900 to-red-950/30 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-300">🚨 Quick Actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/lecturer/submit-ticket" className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400">
              + Report Issue
            </Link>
            <a href="#ticket-overview" className="rounded-xl border border-cyan-500/50 px-5 py-2.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10">
              View My Tickets
            </a>
          </div>
        </section>

        <section id="ticket-overview" className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-cyan-300">📋 Ticket Overview</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2">
              <span className="text-slate-500">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="flex gap-2">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100">
                <option value="">Status ▼</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100">
                <option value="">Priority ▼</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
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
                    <th className="px-4 py-3 font-medium">Assigned</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No lecturer tickets yet.</td>
                    </tr>
                  ) : (
                    tickets.map((t) => {
                      const pr = priorityTag(t.priority);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-mono text-slate-300">{t.id}</td>
                          <td className="px-4 py-3 text-white">{t.title}</td>
                          <td className={`px-4 py-3 ${pr.cls}`}>{pr.icon} {pr.text}</td>
                          <td className="px-4 py-3 text-slate-300">{t.status}</td>
                          <td className="px-4 py-3 text-slate-400">{t.assignedTechnician || "-"}</td>
                          <td className="px-4 py-3">
                            <Link to={`/tickets/${t.id}`} className="font-medium text-cyan-400 hover:text-cyan-300">View</Link>
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

        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-cyan-300">📊 Summary Panel</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
              <p className="text-sm text-red-100/80">🔴 High Priority</p>
              <p className="mt-1 text-2xl font-bold text-red-200">{summary.high}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
              <p className="text-sm text-amber-100/80">⏳ Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-200">{summary.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-100/80">✅ Resolved</p>
              <p className="mt-1 text-2xl font-bold text-emerald-200">{summary.resolved}</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
