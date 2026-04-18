import { useEffect, useState } from "react";
import {
  getExpectedAttendeeBoundsForBooking,
  isMeetingRoomType,
  PURPOSE_MAX_LENGTH,
  PURPOSE_MIN_LENGTH,
  resourceToRoomSummary,
  todayDateString,
  validateBookingFields,
} from "./bookingUtils.js";

/** defaultExpectedAttendeesValue. */
function defaultExpectedAttendeesValue(resource, bookerRole) {
  const bounds = getExpectedAttendeeBoundsForBooking(resource, bookerRole ?? "student");
  if (isMeetingRoomType(resource?.type)) {
    return String(bounds.min);
  }
  const cap = bounds.max;
  if (cap != null) {
    return String(Math.min(4, Math.max(bounds.min, cap)));
  }
  return "4";
}

/** UI: BookingForm. */
export default function BookingForm({
  resource,
  bookerRole,
  onSubmit,
  submitState,
  onCancel,
  initialSnapshot,
  initialPurpose,
  initialExpectedAttendees,
}) {
  const roleForBooking = String(bookerRole ?? "student").trim().toLowerCase() || "student";
  const summary = resourceToRoomSummary(resource);
  const attendeeBounds = getExpectedAttendeeBoundsForBooking(resource, roleForBooking);

  const [bookingDate, setBookingDate] = useState(todayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState(() =>
    defaultExpectedAttendeesValue(resource, roleForBooking),
  );
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalError("");
    if (initialSnapshot?.bookingDate) {
      setBookingDate(initialSnapshot.bookingDate);
      setStartTime(initialSnapshot.startTime || "09:00");
      setEndTime(initialSnapshot.endTime || "10:00");
    } else {
      setBookingDate(todayDateString());
      setStartTime("09:00");
      setEndTime("10:00");
    }
    if (initialPurpose !== undefined && initialPurpose !== null) {
      setPurpose(String(initialPurpose));
    } else {
      setPurpose("");
    }
    if (initialExpectedAttendees !== undefined && initialExpectedAttendees !== null) {
      setExpectedAttendees(String(initialExpectedAttendees));
    } else {
      setExpectedAttendees(defaultExpectedAttendeesValue(resource, roleForBooking));
    }
  }, [resource?.id, initialSnapshot, initialPurpose, initialExpectedAttendees, roleForBooking]);

  /** Helper: handleSubmit. */
  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");
    const v = validateBookingFields(
      { bookingDate, startTime, endTime, purpose, expectedAttendees },
      resource,
      roleForBooking,
    );
    if (!v.ok) {
      setLocalError(v.message);
      return;
    }
    onSubmit?.({
      bookingDate,
      startTime,
      endTime,
      purpose: purpose.trim(),
      expectedAttendees: Number(expectedAttendees),
    });
  }

  const busy = submitState === "loading";
  const purposeTrimLen = purpose.trim().length;
  const purposeTooShort = purpose.length > 0 && purposeTrimLen < PURPOSE_MIN_LENGTH;
  const purposeNearLimit = purpose.length > PURPOSE_MAX_LENGTH - 40;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-cyan-500/20 bg-slate-950/60 p-4 text-sm text-slate-300">
        <p className="font-heading text-base font-semibold text-white">{summary.name}</p>
        <dl className="mt-2 grid gap-1 text-xs">
          <div>
            <span className="text-slate-500">Location:</span> {summary.location}
          </div>
          <div>
            <span className="text-slate-500">Capacity:</span> {summary.capacityLabel}
          </div>
          <div>
            <span className="text-slate-500">Typical availability:</span> {summary.availabilityLabel}
          </div>
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-400">Booking date</span>
          <input
            type="date"
            required
            min={todayDateString()}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
          />
        </label>
        <div />
        <label className="block text-sm">
          <span className="text-slate-400">Start time</span>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">End time</span>
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-slate-400">
          Purpose <span className="text-amber-200/90">*</span>
          <span className="ml-2 text-xs font-normal text-slate-500">
            (min {PURPOSE_MIN_LENGTH} · max {PURPOSE_MAX_LENGTH} characters after trimming spaces)
          </span>
        </span>
        <textarea
          required
          minLength={PURPOSE_MIN_LENGTH}
          maxLength={PURPOSE_MAX_LENGTH}
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          disabled={busy}
          placeholder={`At least ${PURPOSE_MIN_LENGTH} characters, e.g. group project meeting`}
          aria-describedby="booking-purpose-hint"
          className={`mt-1 w-full rounded-lg border bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2 ${
            purposeTooShort ? "border-amber-500/50" : "border-slate-600/80"
          }`}
        />
        <p id="booking-purpose-hint" className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={purposeTooShort ? "text-amber-200/90" : "text-slate-500"}>
            {purposeTrimLen === 0
              ? "Required — describe why you need the space."
              : purposeTooShort
                ? `${PURPOSE_MIN_LENGTH - purposeTrimLen} more character(s) needed (leading/trailing spaces do not count).`
                : purposeTrimLen >= PURPOSE_MIN_LENGTH
                  ? "Meets minimum length (trimmed)."
                  : ""}
          </span>
          <span className={purposeNearLimit ? "text-amber-200/80" : "text-slate-500"}>
            {purpose.length} / {PURPOSE_MAX_LENGTH}
          </span>
        </p>
      </label>

      <label className="block text-sm">
        <span className="text-slate-400">Expected attendees</span>
        {attendeeBounds.max != null ? (
          <span className="ml-2 text-xs text-slate-500">
            (min {attendeeBounds.min} · max {attendeeBounds.max}
            {isMeetingRoomType(resource?.type) ? " · meeting room policy" : ""})
          </span>
        ) : (
          <span className="ml-2 text-xs text-slate-500">(min {attendeeBounds.min})</span>
        )}
        <input
          type="number"
          min={attendeeBounds.min}
          max={attendeeBounds.max ?? undefined}
          required
          value={expectedAttendees}
          onChange={(e) => setExpectedAttendees(e.target.value)}
          disabled={busy}
          className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
        />
      </label>

      {localError ? <p className="text-sm text-red-300">{localError}</p> : null}

      <p className="text-xs text-slate-500">
        Your request is sent for review. Status will be <strong className="text-amber-200/90">PENDING</strong> until
        staff approve or reject it. Conflicts with existing bookings are blocked by the server.
      </p>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit request"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Close
        </button>
      </div>
    </form>
  );
}
