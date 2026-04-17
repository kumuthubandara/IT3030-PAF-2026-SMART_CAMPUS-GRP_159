import { useEffect, useState } from "react";
import { useToast } from "../../../components/ToastProvider.jsx";
import BookingForm from "../../../components/student-bookings/BookingForm.jsx";
import { toLocalIsoDateTime } from "../../../components/student-bookings/bookingUtils.js";
import { splitInstantToLocalDateAndTimes } from "../utils/bookingPayload.js";

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const SKIN = {
  lecturer: {
    dialog: "border-violet-500/25",
    headerBorder: "border-violet-500/15",
    successBtn: "bg-violet-500 hover:bg-violet-400",
  },
  student: {
    dialog: "border-cyan-500/25",
    headerBorder: "border-cyan-500/15",
    successBtn: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
  },
  technician: {
    dialog: "border-cyan-500/25",
    headerBorder: "border-cyan-500/15",
    successBtn: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
  },
};

/**
 * @param {object} props
 * @param {'student'|'lecturer'|'technician'} props.audience
 * @param {(id: string, user: object) => Promise<object>} props.fetchResourceById
 * @param {(bookingId: string, payload: object, user: object) => Promise<object>} props.updateBooking
 */
export default function EditBookingModal({
  open,
  booking,
  user,
  onClose,
  onSaved,
  audience,
  fetchResourceById,
  updateBooking,
}) {
  const { showToast } = useToast();
  const skin = SKIN[audience] || SKIN.student;
  const [resource, setResource] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || !booking?.resourceId) {
      setResource(null);
      setLoadError("");
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadError("");
      try {
        const r = await fetchResourceById(String(booking.resourceId), user);
        if (!cancelled) setResource(r);
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || "Could not load resource");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, booking?.resourceId, user, fetchResourceById]);

  useEffect(() => {
    if (!open) {
      setSubmitState("idle");
      setErrorMessage("");
    }
  }, [open]);

  if (!open || !booking) return null;

  const initialSnapshot = splitInstantToLocalDateAndTimes(
    String(booking.startDateTime ?? ""),
    String(booking.endDateTime ?? ""),
  );

  async function handleSubmit(fields) {
    setErrorMessage("");
    setSubmitState("loading");
    try {
      const startDateTime = toLocalIsoDateTime(fields.bookingDate, fields.startTime);
      const endDateTime = toLocalIsoDateTime(fields.bookingDate, fields.endTime);
      await updateBooking(
        String(booking.id),
        {
          resourceId: String(resource.id),
          startDateTime,
          endDateTime,
          purpose: fields.purpose,
          expectedAttendees: fields.expectedAttendees,
        },
        user,
      );
      onSaved?.();
      setSubmitState("success");
      showToast("Booking updated. It stays pending until an administrator reviews it.", { variant: "success" });
    } catch (err) {
      const msg = err?.message || "Update failed";
      setSubmitState("error");
      setErrorMessage(msg);
      showToast(msg, { variant: "error" });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && submitState !== "loading") onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-booking-title"
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-slate-900 p-6 shadow-2xl ${skin.dialog}`}
      >
        <div className={`flex items-start justify-between gap-3 border-b pb-4 ${skin.headerBorder}`}>
          <h2 id="edit-booking-title" className="font-heading text-xl font-semibold text-white">
            Edit booking
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
          {loadError ? (
            <p className="text-sm text-red-300">{loadError}</p>
          ) : !resource || !initialSnapshot ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : submitState === "success" ? (
            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-emerald-300/90">
                Booking updated. It stays <strong>PENDING</strong> until an administrator reviews it.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${skin.successBtn}`}
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
                key={String(booking.id)}
                resource={resource}
                submitState={submitState}
                initialSnapshot={initialSnapshot}
                initialPurpose={String(booking.purpose ?? "")}
                initialExpectedAttendees={String(booking.expectedAttendees ?? "1")}
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
