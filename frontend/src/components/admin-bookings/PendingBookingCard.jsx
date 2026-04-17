import BookingStatusBadge from "../student-bookings/BookingStatusBadge.jsx";
import {
  formatBookingDate,
  formatBookingTime,
  parseBookingInstant,
} from "./bookingDisplayUtils.js";

/** @typedef {'default' | 'lecturerPanel'} Appearance */

/**
 * @param {object} props
 * @param {object} props.booking
 * @param {boolean} props.disabled
 * @param {() => void} props.onApprove
 * @param {() => void} props.onReject
 * @param {boolean} [props.showReviewActions]
 * @param {Appearance} [props.appearance] — lecturerPanel matches lecturer “My bookings” cards (violet border, Edit/Delete-style actions)
 */
export default function PendingBookingCard({
  booking,
  disabled,
  onApprove,
  onReject,
  showReviewActions = true,
  appearance = "default",
}) {
  const start = parseBookingInstant(booking.startDateTime);
  const end = parseBookingInstant(booking.endDateTime);
  const requester =
    [booking.requesterName, booking.requesterEmail].filter(Boolean).join(" · ") || "—";
  const location = booking.location?.trim();
  const room = booking.roomName?.trim() || "Resource";
  const rType = booking.resourceType?.trim();
  const dateLine =
    start && end
      ? `${formatBookingDate(start)} · ${formatBookingTime(start)} – ${formatBookingTime(end)}`
      : "—";

  const isLecturerPanel = appearance === "lecturerPanel";
  const cardBorder = isLecturerPanel ? "border-violet-500/20" : "border-cyan-500/20";
  const approveClass = isLecturerPanel
    ? "rounded-lg border border-violet-500/40 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50";
  const rejectClass =
    "rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";
  const actionsWrap = isLecturerPanel ? "mt-3 flex flex-wrap gap-2" : "mt-3 flex flex-wrap gap-2 border-t border-slate-800/80 pt-3";

  return (
    <article className={`rounded-xl border bg-slate-950/60 p-4 text-sm text-slate-300 ${cardBorder}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-white">{room}</p>
          <p className="mt-1 text-xs text-slate-500">{dateLine}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <dl className="mt-3 grid gap-1 text-xs">
        {rType ? (
          <div>
            <span className="text-slate-500">Type:</span> {rType}
          </div>
        ) : null}
        <div>
          <span className="text-slate-500">Purpose:</span>{" "}
          <span className="whitespace-pre-wrap text-slate-300">{booking.purpose?.trim() || "—"}</span>
        </div>
        <div>
          <span className="text-slate-500">Attendees:</span> {booking.expectedAttendees ?? "—"}
        </div>
        <div>
          <span className="text-slate-500">Requester:</span> {requester}
        </div>
        {booking.requesterRole ? (
          <div>
            <span className="text-slate-500">Role:</span>{" "}
            <span className="capitalize text-slate-300">{String(booking.requesterRole)}</span>
          </div>
        ) : null}
        {location ? (
          <div>
            <span className="text-slate-500">Location:</span> {location}
          </div>
        ) : null}
      </dl>

      {showReviewActions ? (
        <div className={actionsWrap}>
          <button type="button" disabled={disabled} onClick={onApprove} className={approveClass}>
            Approve
          </button>
          <button type="button" disabled={disabled} onClick={onReject} className={rejectClass}>
            Reject
          </button>
        </div>
      ) : null}

      {!showReviewActions && String(booking.status).toUpperCase() === "REJECTED" && booking.rejectionReason?.trim() ? (
        <div className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-1.5 text-xs text-red-200">
          <span className="font-medium text-red-300/90">Reason: </span>
          {booking.rejectionReason}
        </div>
      ) : null}
    </article>
  );
}
