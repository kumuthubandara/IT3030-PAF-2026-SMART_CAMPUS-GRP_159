import { useEffect, useState } from "react";
import { useToast } from "../ToastProvider.jsx";
import { createBookingRequest } from "../../services/bookingsApi.js";
import { toLocalIsoDateTime } from "./bookingUtils.js";
import BookingForm from "./BookingForm.jsx";

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {Record<string, unknown>|null} props.resource
 * @param {Record<string, unknown>} props.user
 * @param {() => void} [props.onSuccess]
 */
export default function BookingModal({ open, onClose, resource, user, onSuccess }) {
  const { showToast } = useToast();
  const [submitState, setSubmitState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setSubmitState("idle");
      setErrorMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && submitState !== "loading") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, submitState]);

  if (!open || !resource) return null;

  async function handleSubmit(fields) {
    setErrorMessage("");
    setSubmitState("loading");
    try {
      const startDateTime = toLocalIsoDateTime(fields.bookingDate, fields.startTime);
      const endDateTime = toLocalIsoDateTime(fields.bookingDate, fields.endTime);
      await createBookingRequest(
        {
          resourceId: String(resource.id),
          startDateTime,
          endDateTime,
          purpose: fields.purpose,
          expectedAttendees: fields.expectedAttendees,
        },
        user,
      );
      setSubmitState("success");
      showToast("Booking request submitted. Status is pending until staff review it.", { variant: "success" });
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || "Something went wrong";
      setSubmitState("error");
      setErrorMessage(msg);
      showToast(msg, { variant: "error" });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && submitState !== "loading") onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cyan-500/25 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-cyan-500/15 pb-4">
          <h2 id="booking-modal-title" className="font-heading text-xl font-semibold text-white">
            Request a booking
          </h2>
          <button
            type="button"
            disabled={submitState === "loading"}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="pt-5">
          {submitState === "success" ? (
            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-emerald-300/90">
                Request submitted. Your booking is <strong>PENDING</strong> until staff review it.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {submitState === "error" && errorMessage ? (
                <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </p>
              ) : null}
              <BookingForm
                resource={resource}
                submitState={submitState}
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
