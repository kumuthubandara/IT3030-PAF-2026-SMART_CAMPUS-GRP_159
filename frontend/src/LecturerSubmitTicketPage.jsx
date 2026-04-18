/**
 * Lecturer-facing issue report: same ticket pipeline as students, with teaching-space defaults.
 * Preferred time and free-text notes are stored as ticket comments after creation.
 */
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteFooter from "./SiteFooter";
import { ticketsApi } from "./api/ticketsApi";
import {
  validateImageFiles,
  validateOptionalLongText,
  validateTicketDescription,
  validateTicketTitle,
} from "./ticketFormValidation";

const CATEGORIES = ["Electrical", "Network", "Hardware", "Plumbing", "Audio/Visual", "Other"];
const LOCATIONS = ["Lecture Hall 1", "Lecture Hall 2", "Lecture Hall 3", "Lab A", "Lab B", "Main Building"];

/** previewKey. */
function previewKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/** UI: LecturerSubmitTicketPage. */
export default function LecturerSubmitTicketPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const role = String(user?.role ?? "").trim().toLowerCase();
  const isLecturer = role === "lecturer";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [priority, setPriority] = useState("HIGH");
  const [location, setLocation] = useState("Lecture Hall 3");
  const [description, setDescription] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [previewSlots, setPreviewSlots] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewSlotsRef = useRef(previewSlots);
  previewSlotsRef.current = previewSlots;
  useEffect(
    () => () => {
      previewSlotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    },
    []
  );

  if (!user) {
    return <Navigate to="/login?redirect=/lecturer/submit-ticket" replace />;
  }
  if (!isLecturer) {
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

  /** removePreview. */
  function removePreview(idx) {
    setPreviewSlots((prev) => {
      const slot = prev[idx];
      if (slot) URL.revokeObjectURL(slot.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  /** collectValidationErrors. */
  function collectValidationErrors() {
    return [
      validateTicketTitle(title),
      validateTicketDescription(description),
      validateOptionalLongText(additionalComment, "Additional notes"),
    ].filter(Boolean);
  }

  /** Helper: handleSubmit. */
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
      const created = await ticketsApi.createTicket(
        { title: title.trim(), category, priority, location, description: description.trim() },
        user
      );

      if (previewSlots.length > 0) {
        const imageUrls = previewSlots.map((s) => s.url);
        await ticketsApi.addAttachments(created.id, imageUrls, user);
      }

      if (preferredTime) {
        await ticketsApi.addComment(created.id, `Preferred time: ${new Date(preferredTime).toLocaleString()}`, user);
      }

      if (additionalComment.trim()) {
        await ticketsApi.addComment(created.id, additionalComment.trim(), user);
      }

      navigate(`/tickets/${created.id}`);
    } catch (err) {
      setError(err.message || "Failed to submit lecturer issue.");
    } finally {
      setSubmitting(false);
    }
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
              👤
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-700/50 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <Link to="/" className="text-slate-400 hover:text-cyan-300">
            Home
          </Link>
          <Link to="/lecturer/maintenance" className="text-slate-400 hover:text-cyan-300">
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-heading mb-6 border-b border-cyan-500/20 pb-4 text-3xl font-bold text-red-300">🚨 Report Issue</h1>
        {error ? <p className="mb-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5">
            <div className="space-y-3">
              <label className="grid items-center gap-2 sm:grid-cols-[170px_1fr]">
                <span className="text-sm text-slate-300">Title:</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
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
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                  <option>HIGH</option>
                  <option>MEDIUM</option>
                  <option>LOW</option>
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

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5">
            <p className="mb-2 text-sm text-slate-300">Description:</p>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5">
            <p className="mb-2 text-sm text-slate-300">Upload Images (Max 3):</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="w-full rounded-xl border-2 border-dashed border-cyan-500/40 bg-slate-950/70 px-4 py-8 text-sm text-slate-300"
            >
              Drag & Drop files here
              <br />
              or
              <br />
              <span className="mt-2 inline-block rounded-md bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950">Choose File</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <div className="mt-3 flex flex-wrap gap-3">
              {previewSlots.map((slot, idx) => (
                <div key={slot.key} className="relative">
                  <img src={slot.url} alt={slot.file.name} className="h-20 w-20 rounded-lg border border-slate-700 object-cover" />
                  <button type="button" onClick={() => removePreview(idx)} className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">
                    x
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5">
            <label className="grid items-center gap-2 sm:grid-cols-[190px_1fr]">
              <span className="text-sm text-slate-300">Preferred Time (Optional):</span>
              <input type="datetime-local" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
          </section>

          <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5">
            <p className="mb-2 text-sm text-slate-300">Additional notes (optional):</p>
            <textarea rows={4} value={additionalComment} onChange={(e) => setAdditionalComment(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Scheduling constraints, access instructions, etc." />
          </section>

          <div className="flex items-center justify-center gap-3">
            <button disabled={submitting} type="submit" className="rounded-xl bg-red-500 px-8 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button type="button" onClick={() => navigate("/lecturer/maintenance")} className="rounded-xl border border-slate-600 px-8 py-3 font-semibold text-slate-200 hover:border-cyan-400">
              Cancel
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
