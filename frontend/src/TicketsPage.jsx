import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

function priorityBadge(priority) {
  if (priority === "HIGH") return "bg-red-500/20 text-red-200";
  if (priority === "MEDIUM") return "bg-orange-500/20 text-orange-200";
  return "bg-green-500/20 text-green-200";
}

export default function TicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    location: "",
    imageUrl: "",
    initialComment: "",
  });
  const [filters, setFilters] = useState({ status: "", priority: "", q: "" });

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isAdmin = role === "administrator" || role === "admin";
  const isStudent = role === "student";
  const canCreate = false;

  async function loadTickets() {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const data = await ticketsApi.listTickets(user, filters);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [user, filters.status, filters.priority, filters.q]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");
      const created = await ticketsApi.createTicket(
        {
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          location: form.location,
        },
        user
      );
      if (form.imageUrl.trim()) {
        await ticketsApi.addAttachments(created.id, [form.imageUrl.trim()], user);
      }
      if (form.initialComment.trim()) {
        await ticketsApi.addComment(created.id, form.initialComment.trim(), user);
      }
      setForm({
        title: "",
        description: "",
        category: "",
        priority: "MEDIUM",
        location: "",
        imageUrl: "",
        initialComment: "",
      });
      await loadTickets();
      navigate(`/tickets/${created.id}`);
    } catch (e) {
      setError(e.message || "Failed to create ticket.");
    }
  }

  async function handleExportCsv() {
    try {
      setError("");
      const blob = await ticketsApi.exportTicketsCsv(user, filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tickets-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || "CSV export failed.");
    }
  }

  if (!user) {
    return <Navigate to="/login?redirect=/tickets" replace />;
  }
  if (isStudent) {
    return <Navigate to="/student/submit-ticket" replace />;
  }

  const assignedCount = tickets.length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const slaRiskCount = tickets.filter((t) => t.slaBreached).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-white">Ticket Management</h1>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
              >
                Export CSV
              </button>
            ) : null}
            <Link to="/notifications" className="text-sm text-cyan-300 hover:text-cyan-200">
              View notifications
            </Link>
          </div>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</p> : null}

        {canCreate ? (
          <section className="mb-8 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
            <h2 className="mb-4 text-lg font-semibold text-cyan-300">Create Ticket</h2>
            <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Title"
              />
              <input
                required
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Category (Electrical, Network...)"
              />
              <input
                required
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Resource / Location"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                rows={4}
                placeholder="Describe the issue"
              />
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                placeholder="Optional image URL (added as first attachment)"
              />
              <textarea
                value={form.initialComment}
                onChange={(e) => setForm((p) => ({ ...p, initialComment: e.target.value }))}
                className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                rows={3}
                placeholder="Optional first comment"
              />
              <button
                type="submit"
                className="md:col-span-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
              >
                Submit Ticket
              </button>
            </form>
          </section>
        ) : null}

        <section className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-lg font-semibold text-cyan-300">Search & Filter</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              placeholder="Search title/category/location"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="">All Priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </section>

        {role === "technician" || role === "tech" ? (
          <section className="mb-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">My Assigned Tickets</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{assignedCount}</p>
            </article>
            <article className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-orange-300">{inProgressCount}</p>
            </article>
            <article className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">SLA Risk (&gt; 48h)</p>
              <p className="mt-1 text-2xl font-bold text-red-300">{slaRiskCount}</p>
            </article>
          </section>
        ) : null}

        <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-lg font-semibold text-cyan-300">Tickets</h2>
          {loading ? <p className="text-slate-300">Loading tickets...</p> : null}
          {!loading && tickets.length === 0 ? <p className="text-slate-300">No tickets yet.</p> : null}
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block rounded-lg border border-slate-700 bg-slate-950 p-4 hover:border-cyan-400/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{ticket.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${priorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <p className="text-xs text-slate-300">{ticket.status}</p>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">{ticket.category}</p>
                <p className="mt-1 text-xs text-slate-500">Location: {ticket.location}</p>
                <p className="mt-1 text-xs text-slate-500">Age: {ticket.ageHours}h</p>
                {ticket.slaBreached ? (
                  <p className="mt-1 text-xs font-semibold text-red-300">SLA breached</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
