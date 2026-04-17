import { useState } from "react";
import { useToast } from "../ToastProvider.jsx";
import { cancelBooking } from "../../services/bookingsApi.js";

export default function CancelBookingButton({ bookingId, user, onDone, disabled, className = "" }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);
    try {
      await cancelBooking(bookingId, user, {});
      showToast("Booking cancelled.", { variant: "success" });
      onDone?.();
    } catch (e) {
      const msg = e?.message || "Cancel failed";
      setError(msg);
      showToast(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handleClick()}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Cancelling…" : "Cancel request"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
