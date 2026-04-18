/**
 * Student-only maintenance ticket submission.
 * Creates a ticket via REST, optionally uploads image attachments and follow-up comments.
 */
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";
import {
  validateImageFiles,
  validateOptionalLongText,
  validateOptionalPhone,
  validateOptionalEmail,
  validateTicketDescription,
  validateTicketTitle,
} from "./ticketFormValidation";

const CATEGORIES = ["Electrical", "Network", "Hardware", "Plumbing", "Other"];
const LOCATIONS = ["Lab A", "Lab B", "Room 101", "Room 202", "Library", "Main Building"];

/** Stable React key for an image preview slot derived from file metadata. */
function previewKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/** UI: StudentSubmitTicketPage. */
export default function StudentSubmitTicketPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role ?? "").trim().toLowerCase();
  const isStudent = role === "student";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [priority, setPriority] = useState("LOW");
  const [location, setLocation] = useState("Lab A");
  const [description, setDescription] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [isEmergency, setIsEmergency] = useState(false);
  /** Each slot keeps a stable object URL so we do not leak blobs on every render. */
  const [previewSlots, setPreviewSlots] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Keep contact email in sync if the logged-in user loads after first paint.
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user?.email, email]);

  const previewSlotsRef = useRef(previewSlots);
  previewSlotsRef.current = previewSlots;
  // Revoke blob URLs only on unmount (not on every preview change).
  useEffect(
    () => () => {
      previewSlotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    },
    []
  );

  if (!user) {
    return <Navigate to="/login?redirect=/student/submit-ticket" replace />;
  }
  if (!isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  /** addFiles. */
  function addFiles(fileList) {
    const files = Array.from(fileList ?? []);
    const { error: vErr, accepted } = validateImageFiles(files, previewSlots.length);
    if (vErr) setError(vErr);
    else setError("");
    if (accepted.length === 0) return;

    setPreviewSlots((prev) => {
      const next = [...prev];
      for (const file of accepted) {
        next.push({ key: previewKey(file), file, url: URL.createObjectURL(file) });
      }
      return next.slice(0, 3);
    });
  }

  /** Revokes the blob URL for one preview and removes it from state. */
  function removePreview(idx) {
    setPreviewSlots((prev) => {
      const slot = prev[idx];
      if (slot) URL.revokeObjectURL(slot.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  /** Runs field validators and returns a list of user-facing error strings (empty if valid). */
  function collectValidationErrors() {
    return [
      validateTicketTitle(title),
      validateTicketDescription(description),
      validateOptionalPhone(phone),
      validateOptionalEmail(email),
      validateOptionalLongText(additionalComment, "Additional comment"),
    ].filter(Boolean);
  }

  /** Form submit: validates, creates ticket, uploads previews as attachments, adds optional comments, then navigates. */
  async function handleSubmit(e) {
    e.preventDefault();
    const msgs = collectValidationErrors();
    if (msgs.length) {
      setError(msgs[0]);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const effectivePriority = isEmergency ? "HIGH" : priority;
      const created = await ticketsApi.createTicket(
        {
          title: title.trim(),
          category,
          priority: effectivePriority,
          location,
          description: description.trim(),
        },
        user
      );

      if (previewSlots.length > 0) {
        const imageUrls = previewSlots.map((s) => s.url);
        await ticketsApi.addAttachments(created.id, imageUrls, user);
      }

      const contactBits = [];
      if (phone.trim()) contactBits.push(`Phone: ${phone.trim()}`);
      if (email.trim()) contactBits.push(`Email: ${email.trim()}`);
      if (contactBits.length) {
        await ticketsApi.addComment(created.id, `Contact:\n${contactBits.join("\n")}`, user);
      }

      if (additionalComment.trim()) {
        await ticketsApi.addComment(created.id, additionalComment.trim(), user);
      }

      navigate(`/tickets/${created.id}`);
    } catch (err) {
      setError(err.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      {/* App chrome: matches other student-facing pages */}
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
              👤
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-700/50 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <Link to="/" className="text-slate-400 hover:text-cyan-300">
            Home
          </Link>
          <Link to="/student/maintenance" className="text-slate-400 hover:text-cyan-300">
            My Tickets
          </Link>
          <span className="font-semibold text-cyan-400">Report Issue</span>
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-heading mb-6 border-b border-cyan-500/20 pb-4 text-center text-3xl font-bold text-red-300">
          🚨 SUBMIT MAINTENANCE TICKET
        </h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-cyan-300">📝 Basic Information</h2>
            <div className="mt-4 space-y-3">
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Title:</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="_____________________________" />
              </label>
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Category:</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Priority:</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={isEmergency} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 disabled:opacity-60">
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                </select>
              </label>
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Location:</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-cyan-300">📄 Description</h2>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Type the issue details here..." />
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-cyan-300">📎 Image Upload (Dropbox Style)</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-cyan-500/40 bg-slate-950/70 px-4 py-8 text-sm text-slate-300"
            >
              Drag & Drop files here
              <br />
              or
              <br />
              <span className="mt-2 inline-block rounded-md bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950">Choose Files</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <p className="mt-3 text-sm text-slate-400">Preview:</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {previewSlots.map((slot, idx) => (
                <div key={slot.key} className="relative">
                  <img src={slot.url} alt={slot.file.name} className="h-20 w-20 rounded-lg border border-slate-700 object-cover" />
                  <button type="button" onClick={() => removePreview(idx)} className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">
                    x
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">(Max 3 images allowed)</p>
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-cyan-300">💬 Additional Comments (Optional)</h2>
            <textarea rows={4} value={additionalComment} onChange={(e) => setAdditionalComment(e.target.value)} className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Add extra notes or urgency details..." />
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-cyan-300">📞 Contact Information</h2>
            <div className="mt-4 space-y-3">
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Phone:</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="________________" />
              </label>
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Email:</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="________________" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-red-200">⚡ Emergency Tag</h2>
            <label className="flex items-center gap-3 text-sm text-red-200">
              <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
              Mark as Emergency Ticket (HIGH PRIORITY ALERT)
            </label>
          </section>

          <div className="text-center">
            <button disabled={submitting} type="submit" className="rounded-xl bg-red-500 px-8 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-400 disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
