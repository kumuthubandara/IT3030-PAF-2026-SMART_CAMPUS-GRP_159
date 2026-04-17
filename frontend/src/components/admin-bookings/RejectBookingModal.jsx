import { useEffect, useId, useState } from "react";

export default function RejectBookingModal({ open, booking, onClose, onConfirm, isSubmitting }) {
  const labelId = useId();
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setLocalError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (!isSubmitting) onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, isSubmitting, onClose]);

  if (!open || !booking) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setLocalError("Please enter a reason.");
      return;
    }
    setLocalError("");
    onConfirm(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="w-full max-w-md rounded-2xl border border-red-500/25 bg-slate-900 p-5 shadow-2xl sm:p-6"
      >
        <h3 id={labelId} className="text-lg font-semibold text-white">
          Reject booking
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          {booking.roomName || "Meeting room"} ·{" "}
          <span className="font-mono text-xs text-slate-500">{booking.id}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">
              Reason <span className="text-red-300">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (localError) setLocalError("");
              }}
              disabled={isSubmitting}
              rows={3}
              placeholder="e.g. Room already booked for another event"
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-red-400/70 disabled:opacity-60"
            />
          </label>
          {localError ? <p className="text-xs font-medium text-red-300">{localError}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting ? "Rejecting…" : "Confirm reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
