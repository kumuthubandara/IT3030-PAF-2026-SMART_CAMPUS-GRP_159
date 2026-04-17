import { useCallback, useEffect, useState } from "react";
import { fetchMyBookings } from "../../services/bookingsApi.js";
import BookingStatusBadge from "./BookingStatusBadge.jsx";
import UserBookingRowActions from "./UserBookingRowActions.jsx";

function firstDefined(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function formatDateLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const opts = { hour: "2-digit", minute: "2-digit" };
  return `${s.toLocaleTimeString(undefined, opts)} – ${e.toLocaleTimeString(undefined, opts)}`;
}

export function normalizeBookingRow(raw) {
  const id = String(firstDefined(raw, ["id", "_id"]) ?? "");
  const start =
    firstDefined(raw, ["startDateTime", "start", "startTime", "start_at"]) ?? "";
  const end = firstDefined(raw, ["endDateTime", "end", "endTime", "end_at"]) ?? "";
  const status = String(firstDefined(raw, ["status"]) ?? "PENDING")
    .trim()
    .toUpperCase();
  return {
    id,
    roomName:
      firstDefined(raw, ["roomName", "resourceName", "resource_name", "name", "title"]) ||
      "Meeting room",
    dateLabel: formatDateLabel(start),
    timeRangeLabel: formatTimeRange(start, end),
    purpose: firstDefined(raw, ["purpose", "description"]) || "—",
    attendees:
      firstDefined(raw, ["expectedAttendees", "expected_attendees", "attendees"]) ?? "—",
    status,
    rejectionReason:
      firstDefined(raw, ["rejectionReason", "rejection_reason", "reviewComment", "adminNote"]) ||
      "",
    resourceId: String(firstDefined(raw, ["resourceId", "resource_id"]) ?? ""),
    resourceType: String(firstDefined(raw, ["resourceType", "resource_type"]) ?? ""),
    rawStart: start,
    rawEnd: end,
  };
}

export default function MyBookings({ user, compact }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyBookings(user);
      setRows(Array.isArray(data) ? data.map(normalizeBookingRow) : []);
    } catch (e) {
      setError(e?.message || "Failed to load bookings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className={`text-sm text-slate-400 ${compact ? "py-4" : "py-10 text-center"}`}>
        Loading your bookings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}{" "}
          <span className="text-slate-400">
            (If the backend is not running yet, start the API or add the bookings endpoints.)
          </span>
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        You have no booking requests yet. Open <strong className="text-slate-300">Book resources</strong> from your
        dashboard or the student bookings page to submit one.
      </p>
    );
  }

  return (
    <ul className={`space-y-3 ${compact ? "" : "max-w-3xl"}`}>
      {rows.map((row) => (
        <li
          key={row.id}
          className="rounded-xl border border-cyan-500/15 bg-slate-950/60 p-4 text-sm text-slate-300"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-heading text-base font-semibold text-white">{row.roomName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {row.dateLabel} · {row.timeRangeLabel}
              </p>
            </div>
            <BookingStatusBadge status={row.status} />
          </div>
          <dl className="mt-3 grid gap-1 text-xs">
            {row.resourceType ? (
              <div>
                <span className="text-slate-500">Type:</span> {row.resourceType}
              </div>
            ) : null}
            <div>
              <span className="text-slate-500">Purpose:</span> {row.purpose}
            </div>
            <div>
              <span className="text-slate-500">Attendees:</span> {row.attendees}
            </div>
            {row.status === "REJECTED" && row.rejectionReason ? (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-1.5 text-red-200">
                <span className="font-medium text-red-300/90">Reason: </span>
                {row.rejectionReason}
              </div>
            ) : null}
          </dl>
          <UserBookingRowActions bookingId={row.id} status={row.status} user={user} onDone={() => void load()} />
        </li>
      ))}
      <li className="list-none">
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          Refresh list
        </button>
      </li>
    </ul>
  );
}
