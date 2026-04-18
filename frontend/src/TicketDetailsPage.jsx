/**
 * Single ticket view: comments, attachments, and staff-only assign/status controls.
 */
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { backendUsernameForUser, ticketsApi } from "./api/ticketsApi";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

/** Matches backend TicketService workflow (OPEN → IN_PROGRESS → RESOLVED → CLOSED; admin may REJECT from OPEN/IN_PROGRESS). */
function allowedNextStatuses(status, isAdmin) {
  const s = String(status ?? "").toUpperCase();
  if (s === "CLOSED" || s === "REJECTED") return [];
  if (s === "OPEN") {
    const next = ["IN_PROGRESS"];
    if (isAdmin) next.push("REJECTED");
    return next;
  }
  if (s === "IN_PROGRESS") {
    const next = ["RESOLVED"];
    if (isAdmin) next.push("REJECTED");
    return next;
  }
  if (s === "RESOLVED") return ["CLOSED"];
  return [];
}

function ticketsHubPath() {
  return "/tickets";
}

function ticketsHubBackLabel(role) {
  const r = String(role ?? "").trim().toLowerCase();
  if (r === "student" || r === "lecturer") return "← Back to my tickets";
  return "← Back to ticket queue";
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [technician, setTechnician] = useState("tech1");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [activities, setActivities] = useState([]);
  const apiUsername = backendUsernameForUser(user);

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isAdmin = role === "administrator" || role === "admin";
  const isTechnician = role === "technician" || role === "tech";
  const isStudent = role === "student";
  const isLecturer = role === "lecturer";
  const ticketIsTerminal = ticket && (ticket.status === "CLOSED" || ticket.status === "REJECTED");
  const canUpdateStatus = (isAdmin || isTechnician) && ticket && !ticketIsTerminal;
  /** Backend allows USER + ADMIN to POST attachments; technicians are read-only here. */
  const showAttachmentUpload = isStudent || isLecturer || isAdmin;
  const canAddAttachments = showAttachmentUpload && ticket && !ticketIsTerminal;
  const fileInputRef = useRef(null);
  const [statusDraft, setStatusDraft] = useState("OPEN");
  const [priorityDraft, setPriorityDraft] = useState("MEDIUM");

  function handleLocalImage(file) {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please drop/select a valid image file.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    setImagePreview(objectUrl);
    setError("");
  }

  async function loadTicket() {
    if (!user || !id) return;
    try {
      setLoading(true);
      setError("");
      const data = await ticketsApi.getTicket(id, user);
      setTicket(data);
      const admin = role === "administrator" || role === "admin";
      const nextStatuses = allowedNextStatuses(data.status, admin);
      setStatusDraft(nextStatuses.length > 0 ? nextStatuses[0] : data.status);
      setPriorityDraft(data.priority);
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

  async function handleStatusApply() {
    try {
      setError("");
      await ticketsApi.updateStatusWithNotes(id, statusDraft, resolutionNotes, user);
      if (statusDraft === "RESOLVED" || statusDraft === "CLOSED" || statusDraft === "REJECTED") {
        setResolutionNotes("");
      }
      await loadTicket();
    } catch (e) {
      setError(e.message || "Status update failed.");
    }
  }

  async function handlePrioritySave() {
    try {
      setError("");
      await ticketsApi.updatePriority(id, priorityDraft, user);
      await loadTicket();
    } catch (e) {
      setError(e.message || "Priority update failed.");
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

  function handleRemoveSelectedImage() {
    setImageUrl("");
    setImagePreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          <Link to={ticketsHubPath()} className="text-sm text-cyan-300 hover:text-cyan-200">
            {ticketsHubBackLabel(role)}
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-red-200">{error}</p> : null}
        {loading ? <p className="text-slate-300">Loading ticket...</p> : null}

        {ticket ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-400">Ticket #{ticket.id}</p>
              <h1 className="font-heading text-2xl font-bold text-white">{ticket.title}</h1>
              <p className="mt-2 text-slate-300">{ticket.description}</p>
              <p className="mt-3 text-sm text-slate-400">
                {ticket.category} | {ticket.priority} | {ticket.status}
              </p>
              <p className="text-xs text-slate-500">
                Location: {ticket.location} | Assigned: {ticket.assignedTechnician || "Not assigned"}
                {isTechnician && ticket.assignedTechnician === apiUsername ? " (you)" : ""}
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

            {isAdmin ? (
              <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
                <h2 className="mb-3 text-lg font-semibold text-cyan-300">Assign technician</h2>
                <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-sm text-slate-300">
                    Technician
                    <select
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    >
                      <option value="tech1">tech1 — field technician</option>
                    </select>
                  </label>
                  <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
                    Assign
                  </button>
                </form>
              </section>
            ) : null}

            {canUpdateStatus ? (
              <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
                <h2 className="mb-1 text-lg font-semibold text-cyan-300">Update status</h2>
                <p className="mb-3 text-xs text-slate-500">
                  {isTechnician ? "Technicians may only update tickets assigned to them." : "Administrators may set any workflow state."}
                </p>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  rows={3}
                  placeholder="Resolution notes (required when moving to RESOLVED or CLOSED)"
                />
                <div className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-sm text-slate-300">
                    Status
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleStatusApply()}
                    className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
                  >
                    Update status
                  </button>
                </div>
              </section>
            ) : null}

            {isAdmin ? (
              <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
                <h2 className="mb-3 text-lg font-semibold text-cyan-300">Ticket priority</h2>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-sm text-slate-300">
                    Priority
                    <select
                      value={priorityDraft}
                      onChange={(e) => setPriorityDraft(e.target.value)}
                      className="min-w-[160px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => void handlePrioritySave()}
                    className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
                  >
                    Save priority
                  </button>
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-lg font-semibold text-cyan-300">Attachments (max 3)</h2>
              {canAddAttachments ? (
                <>
                  <p className="mb-2 text-xs text-slate-500">
                    Allowed evidence links: HTTPS, localhost, browser preview (blob:), or small data:image/… URLs (validated on the server).
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      handleLocalImage(file);
                    }}
                    className={`mb-4 w-full rounded-lg border-2 border-dashed px-4 py-6 text-sm transition ${
                      isDragging
                        ? "border-cyan-300 bg-cyan-500/10 text-cyan-200"
                        : "border-slate-600 bg-slate-950/70 text-slate-300 hover:border-cyan-500/60"
                    }`}
                  >
                    Drag and drop image here, or click to select
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLocalImage(e.target.files?.[0])}
                  />
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
                    <div className="mb-4">
                      <img src={imagePreview} alt="Attachment preview" className="max-h-52 rounded-lg border border-slate-700 object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveSelectedImage}
                        className="mt-2 rounded-md border border-red-400/50 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Remove selected image
                      </button>
                    </div>
                  ) : null}
                </>
              ) : showAttachmentUpload && ticketIsTerminal ? (
                <p className="mb-4 text-sm text-slate-400">
                  This ticket is {ticket.status}. No further image evidence can be added.
                </p>
              ) : (
                <p className="mb-4 text-sm text-slate-400">Uploading additional images is limited to the ticket reporter or an administrator.</p>
              )}
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

            <div className="flex justify-end">
              <Link
                to={ticketsHubPath(role)}
                className="rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                End / back to list
              </Link>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
