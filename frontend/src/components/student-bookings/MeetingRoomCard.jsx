import { resourceToRoomSummary } from "./bookingUtils.js";

/** UI: statusBadge. */
function statusBadge(isBookable) {
  if (isBookable) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40";
  }
  return "bg-red-500/15 text-red-300 border border-red-500/40";
}

/** UI: MeetingRoomCard. */
export default function MeetingRoomCard({ resource, onBookNow, isBookable }) {
  const summary = resourceToRoomSummary(resource);
  const bookable = isBookable !== false;

  return (
    <article className="flex h-full flex-col rounded-xl border border-violet-500/25 bg-slate-950/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold text-violet-200">{summary.name}</h3>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadge(bookable)}`}
        >
          {bookable ? "Available" : "Unavailable"}
        </span>
      </div>
      <dl className="mt-3 flex-1 space-y-1 text-xs text-slate-300">
        <div>
          <span className="text-slate-500">Location:</span> {summary.location}
        </div>
        <div>
          <span className="text-slate-500">Capacity:</span> {summary.capacityLabel}
        </div>
        <div>
          <span className="text-slate-500">Availability:</span> {summary.availabilityLabel}
        </div>
      </dl>
      <button
        type="button"
        disabled={!bookable}
        onClick={() => onBookNow?.(resource)}
        className={`mt-4 w-full rounded-full px-3 py-2 text-xs font-semibold transition ${
          bookable
            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            : "cursor-not-allowed bg-slate-700 text-slate-400"
        }`}
      >
        Book Now
      </button>
    </article>
  );
}
