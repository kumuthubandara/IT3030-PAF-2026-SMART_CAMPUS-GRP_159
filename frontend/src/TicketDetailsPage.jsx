import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { backendUsernameForUser, ticketsApi } from "./api/ticketsApi";

const STATUS_FLOW = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [technician, setTechnician] = useState("tech1");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [activities, setActivities] = useState([]);
  const apiUsername = backendUsernameForUser(user);

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isAdmin = role === "administrator" || role === "admin";
  const isTechnician = role === "technician" || role === "tech";
  const canUpdateStatus = isAdmin || isTechnician;

  async function loadTicket() {
    if (!user || !id) return;
    try {
      setLoading(true);
      setError("");
      const data = await ticketsApi.getTicket(id, user);
      setTicket(data);
      const activityData = await ticketsApi.listActivities(id, user);
      setActivities(Array.isArray(activityData) ? activityData : []);
    } catch (e) {
      setError(e.message || "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id, user]);

  async function handleStatusChange(nextStatus) {
    try {
      setError("");
      await ticketsApi.updateStatusWithNotes(id, nextStatus, resolutionNotes, user);
      if (nextStatus === "RESOLVED" || nextStatus === "CLOSED") {
        setResolutionNotes("");
      }
      await loadTicket();
    } catch (e) {
      setError(e.message || "Status update failed.");
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    try {
      setError("");
      await ticketsApi.assignTechnician(id, technician, user);
      await loadTicket();
    } catch (e) {
      setError(e.message || "Assignment failed.");
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    try {
      setError("");
      await ticketsApi.addComment(id, comment, user);
      setComment("");
      await loadTicket();
    } catch (e) {
      setError(e.message || "Comment failed.");
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      setError("");
      await ticketsApi.deleteComment(id, commentId, user);
      await loadTicket();
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  }

  async function handleAttachment(e) {
    e.preventDefault();
    try {
      setError("");
      const existing = Array.isArray(ticket?.attachments) ? ticket.attachments.length : 0;
      if (existing >= 3) {
        throw new Error("Maximum 3 images allowed.");
      }
      await ticketsApi.addAttachments(id, [imageUrl], user);
      setImagePreview("");
      setImageUrl("");
      await loadTicket();
    } catch (e) {
      setError(e.message || "Attachment upload failed.");
    }
  }

  if (!user) {
    return <Navigate to={`/login?redirect=/tickets/${id}`} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/tickets" className="text-sm text-cyan-300 hover:text-cyan-200">
            Back to tickets
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</p> : null}
        {loading ? <p className="text-slate-300">Loading ticket...</p> : null}

        {ticket ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <h1 className="font-heading text-2xl font-bold text-white">{ticket.title}</h1>
              <p className="mt-2 text-slate-300">{ticket.description}</p>
              <p className="mt-3 text-sm text-slate-400">
                {ticket.category} | {ticket.priority} | {ticket.status}
              </p>
              <p className="text-xs text-slate-500">
                Location: {ticket.location} | Assigned: {ticket.assignedTechnician || "Not assigned"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Age: {ticket.ageHours}h
                {ticket.resolutionHours != null ? ` | Resolved in: ${ticket.resolutionHours}h` : ""}
              </p>
              {ticket.slaBreached ? <p className="mt-1 text-xs font-semibold text-red-300">SLA breached (&gt;48h)</p> : null}
              {ticket.resolutionNotes ? (
                <p className="mt-2 rounded-lg bg-emerald-500/10 p-2 text-xs text-emerald-200">
                  Resolution notes: {ticket.resolutionNotes}
                </p>
              ) : null}
            </section>

            {canUpdateStatus ? (
              <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
                <h2 className="mb-3 text-lg font-semibold text-cyan-300">Update Status</h2>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  rows={2}
                  placeholder="Resolution notes (required for RESOLVED/CLOSED)"
                />
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:border-cyan-400"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {isAdmin ? (
              <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
                <h2 className="mb-3 text-lg font-semibold text-cyan-300">Assign Technician</h2>
                <form onSubmit={handleAssign} className="flex flex-wrap gap-2">
                  <input
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    placeholder="technician username"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
                  >
                    Assign
                  </button>
                </form>
              </section>
            ) : null}

            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-lg font-semibold text-cyan-300">Attachments (max 3)</h2>
              <form onSubmit={handleAttachment} className="mb-4 flex flex-wrap gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="min-w-[280px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  placeholder="Paste image URL"
                  required
                />
                <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
                  Add Image
                </button>
              </form>
              {imagePreview ? (
                <img src={imagePreview} alt="Attachment preview" className="mb-4 max-h-52 rounded-lg border border-slate-700 object-cover" />
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                {(ticket.attachments ?? []).map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    {attachment.imageUrl}
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-lg font-semibold text-cyan-300">Comments</h2>
              <form onSubmit={handleComment} className="mb-4 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  rows={3}
                  placeholder="Add a comment"
                  required
                />
                <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
                  Add Comment
                </button>
              </form>
              <div className="space-y-2">
                {(ticket.comments ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <p className="text-sm text-white">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-400">By {item.author}</p>
                    {(item.author === apiUsername || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(item.id)}
                        className="mt-2 text-xs text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-lg font-semibold text-cyan-300">Activity Timeline</h2>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      By {activity.actor} at {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {activities.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : null}
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
