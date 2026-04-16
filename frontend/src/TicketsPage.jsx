import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    location: "",
  });

  const role = String(user?.role ?? "").trim().toLowerCase();
  const canCreate = role !== "technician";

  async function loadTickets() {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const data = await ticketsApi.listTickets(user);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");
      await ticketsApi.createTicket(form, user);
      setForm({
        title: "",
        description: "",
        category: "",
        priority: "MEDIUM",
        location: "",
      });
      await loadTickets();
    } catch (e) {
      setError(e.message || "Failed to create ticket.");
    }
  }

  if (!user) {
    return <Navigate to="/login?redirect=/tickets" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-white">Ticket Management</h1>
          <Link to="/notifications" className="text-sm text-cyan-300 hover:text-cyan-200">
            View notifications
          </Link>
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
              <button
                type="submit"
                className="md:col-span-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
              >
                Submit Ticket
              </button>
            </form>
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
                  <p className="text-xs text-slate-300">
                    {ticket.priority} | {ticket.status}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{ticket.category}</p>
                <p className="mt-1 text-xs text-slate-500">Location: {ticket.location}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
