import { useState } from "react";
import { useToast } from "../ToastProvider.jsx";
import { cancelBooking, deleteMyBooking } from "../../services/bookingsApi.js";
import { canCancelApprovedBookingNow } from "../../features/bookings/utils/bookingActionPolicy.js";

/**
 * @param {object} props
 * @param {string} props.bookingId
 * @param {string} props.status
 * @param {string|undefined} [props.bookingStartIso] — ISO start time for APPROVED cancel window
 * @param {Record<string, unknown>} props.user
 * @param {() => void} [props.onDone]
 */
export default function UserBookingRowActions({ bookingId, status, bookingStartIso, user, onDone }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const s = String(status ?? "")
    .trim()
    .toUpperCase();

  /** Helper: handleWithdraw. */
  async function handleWithdraw() {
    if (!window.confirm("Withdraw this pending request? It will be removed.")) return;
    setError("");
    setLoading(true);
    try {
      await deleteMyBooking(bookingId, user);
      showToast("Pending request withdrawn.", { variant: "success" });
      onDone?.();
    } catch (e) {
      const msg = e?.message || "Could not withdraw";
      setError(msg);
      showToast(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  /** Helper: handleCancelApproved. */
  async function handleCancelApproved() {
    if (!window.confirm("Cancel this approved booking?")) return;
    setError("");
    setLoading(true);
    try {
      await cancelBooking(bookingId, user, {});
      showToast("Booking cancelled.", { variant: "success" });
      onDone?.();
    } catch (e) {
      const msg = e?.message || "Could not cancel";
      setError(msg);
      showToast(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (s === "PENDING") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleWithdraw()}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {loading ? "Working…" : "Withdraw request"}
        </button>
        {error ? <p className="w-full text-xs text-red-300">{error}</p> : null}
      </div>
    );
  }

  if (s === "APPROVED") {
    if (!canCancelApprovedBookingNow(status, bookingStartIso)) {
      return null;
    }
    return (
      <div className="mt-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleCancelApproved()}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-50"
        >
          {loading ? "Cancelling…" : "Cancel booking"}
        </button>
        {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
      </div>
    );
  }

  return null;
}
