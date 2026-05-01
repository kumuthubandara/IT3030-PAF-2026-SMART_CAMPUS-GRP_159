import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { useAuth } from "./AuthContext";
import { apiGet, apiPatch, apiPost } from "./api";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED"];

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const authHeaders = useMemo(() => {
    if (!user?.email) return {};
    return {
      "Content-Type": "application/json",
      "X-User-Email": user.email,
      "X-User-Role": String(user.role || "student").toUpperCase(),
    };
  }, [user]);

  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  const canChangeStatus = role === "administrator" || role === "technician";

  async function loadTickets() {
    if (!user?.email) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/tickets", authHeaders);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Could not load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authHeaders]);

  async function handleCreateTicket(e) {
    e.preventDefault();
    if (!user?.email) return;
    setSubmitting(true);
    setError("");
    try {
      await apiPost(
        "/api/tickets",
        { title: title.trim(), description: description.trim() },
        authHeaders
      );
      setTitle("");
      setDescription("");
      await loadTickets();
    } catch (e) {
      setError(e.message || "Could not create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(ticketId, status) {
    setError("");
    try {
      await apiPatch(
        `/api/tickets/${encodeURIComponent(ticketId)}/status`,
        authHeaders,
        { status }
      );
      await loadTickets();
    } catch (e) {
      setError(e.message || "Could not update status");
    }
  }

  async function handleAddComment(ticketId) {
    if (!commentText.trim()) return;
    setCommentBusy(true);
    setError("");
    try {
      await apiPost(
        `/api/tickets/${encodeURIComponent(ticketId)}/comments`,
        { message: commentText.trim() },
        authHeaders
      );
      setCommentText("");
      await loadTickets();
    } catch (e) {
      setError(e.message || "Could not add comment");
    } finally {
      setCommentBusy(false);
    }
  }

  const selected = tickets.find((t) => t.id === selectedId) || null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Maintenance
            </p>
            <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              Keep the campus running smoothly
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Log facility issues as tickets, track status updates, and discuss fixes with staff. You
              receive in-app notifications when status changes or when someone comments on your
              tickets.
            </p>
            {!user ? (
              <p className="mt-6 text-sm text-amber-200/90">
                <Link to="/login" className="font-semibold text-cyan-400 underline-offset-2 hover:underline">
                  Sign in
                </Link>{" "}
                to create and view tickets.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          {user ? (
            <form
              onSubmit={handleCreateTicket}
              className="mb-12 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-lg"
            >
              <h3 className="font-heading text-lg font-semibold text-white">Report an issue</h3>
              <p className="mt-1 text-sm text-slate-400">
                Creates a maintenance ticket. Campus technicians and admins can update status; all
                parties get notifications on changes and comments.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                    placeholder="e.g. Projector not working in Lab A"
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                    placeholder="Location, when it happens, safety notes…"
                    required
                    maxLength={5000}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit ticket"}
                </button>
              </div>
            </form>
          ) : null}

          {error ? (
            <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-2/5">
              <h3 className="font-heading text-lg font-semibold text-white">Your tickets</h3>
              <p className="mt-1 text-sm text-slate-400">
                {canChangeStatus
                  ? "All campus tickets (staff view)."
                  : "Tickets you have reported."}
              </p>
              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading…</p>
              ) : tickets.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-600/60 bg-slate-900/50 p-6 text-sm text-slate-500">
                  No tickets yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {tickets.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(t.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                          selectedId === t.id
                            ? "border-cyan-400/50 bg-cyan-500/10 text-white"
                            : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="font-medium text-slate-100">{t.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {t.status?.replaceAll("_", " ")} · {formatTime(t.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-6">
              {!selected ? (
                <p className="text-sm text-slate-500">Select a ticket to view details and comments.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400/90">
                      {selected.status?.replaceAll("_", " ")}
                    </p>
                    <h4 className="font-heading text-xl font-semibold text-white">{selected.title}</h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{selected.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Reporter: {selected.reporterEmail} · {formatTime(selected.createdAt)}
                    </p>
                  </div>

                  {canChangeStatus ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">Set status:</span>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void handleStatusChange(selected.id, s)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            selected.status === s
                              ? "bg-cyan-400 text-slate-950"
                              : "border border-slate-600 text-slate-300 hover:border-cyan-400/40"
                          }`}
                        >
                          {s.replaceAll("_", " ")}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="border-t border-slate-700/80 pt-4">
                    <h5 className="text-sm font-semibold text-slate-200">Comments</h5>
                    <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                      {(selected.comments || []).length === 0 ? (
                        <li className="text-xs text-slate-500">No comments yet.</li>
                      ) : (
                        (selected.comments || []).map((c, idx) => (
                          <li
                            key={`${c.createdAt}-${idx}`}
                            className="rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-sm"
                          >
                            <p className="text-xs text-slate-500">
                              {c.authorEmail} · {formatTime(c.createdAt)}
                            </p>
                            <p className="mt-1 text-slate-300">{c.body}</p>
                          </li>
                        ))
                      )}
                    </ul>
                    {user ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/40 focus:ring-2"
                          placeholder="Add a comment…"
                        />
                        <button
                          type="button"
                          disabled={commentBusy || !commentText.trim()}
                          onClick={() => void handleAddComment(selected.id)}
                          className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-50"
                        >
                          {commentBusy ? "Sending…" : "Comment"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-400">
              Notifications for ticket updates appear in the{" "}
              <Link to="/notifications" className="font-medium text-cyan-400 hover:text-cyan-300">
                notification panel
              </Link>{" "}
              and the header bell after you sign in.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
