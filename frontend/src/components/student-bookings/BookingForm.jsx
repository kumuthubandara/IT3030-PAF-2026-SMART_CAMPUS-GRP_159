import { useEffect, useState } from "react";
import {
  getResourceCapacityMax,
  resourceToRoomSummary,
  todayDateString,
  validateBookingFields,
} from "./bookingUtils.js";

export default function BookingForm({
  resource,
  onSubmit,
  submitState,
  onCancel,
  initialSnapshot,
  initialPurpose,
  initialExpectedAttendees,
}) {
  const summary = resourceToRoomSummary(resource);
  const capacityMax = getResourceCapacityMax(resource);

  const [bookingDate, setBookingDate] = useState(todayDateString());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState(
    capacityMax != null ? String(Math.min(4, capacityMax)) : "4",
  );
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalError("");
    const max = getResourceCapacityMax(resource);
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
      setExpectedAttendees(max != null ? String(Math.min(4, max)) : "4");
    }
  }, [resource?.id, initialSnapshot, initialPurpose, initialExpectedAttendees]);

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");
    const v = validateBookingFields(
      { bookingDate, startTime, endTime, purpose, expectedAttendees },
      capacityMax,
      resource,
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
        <span className="text-slate-400">Purpose</span>
        <textarea
          required
          minLength={3}
          maxLength={500}
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          disabled={busy}
          placeholder="e.g. group project meeting"
          className="mt-1 w-full rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
        />
      </label>

      <label className="block text-sm">
        <span className="text-slate-400">Expected attendees</span>
        {capacityMax != null ? (
          <span className="ml-2 text-xs text-slate-500">(max {capacityMax})</span>
        ) : null}
        <input
          type="number"
          min={1}
          max={capacityMax ?? undefined}
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
