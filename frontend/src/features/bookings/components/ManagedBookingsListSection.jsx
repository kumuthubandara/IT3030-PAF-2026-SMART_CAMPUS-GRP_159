import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../components/ToastProvider.jsx";
import { normalizeBookingRow } from "../../../components/student-bookings/MyBookings.jsx";
import BookingStatusBadge from "../../../components/student-bookings/BookingStatusBadge.jsx";
import {
  canCancelApprovedBookingNow,
  canDeleteBooking,
  canEditBooking,
} from "../utils/bookingActionPolicy.js";
import EditBookingModal from "./EditBookingModal.jsx";
import { isEquipmentResourceType } from "../utils/resourceTypeKind.js";
import {
  isLecturerSpaceBookingResourceType,
  isStudentSelfBookSpaceBookingResourceType,
} from "./lecturer/lecturerResourceCategories.js";
import ApprovedBookingCheckInQr from "../../../components/bookings/ApprovedBookingCheckInQr.jsx";
import { sortRawBookingsPendingFirstThenStart } from "../utils/bookingListSort.js";

const SKIN = {
  lecturer: {
    sectionBorder: "border-violet-500/15",
    cardBorder: "border-violet-500/20",
    title: "text-white",
    refresh: "text-violet-300 hover:text-violet-200",
    edit: "border-violet-500/40 text-violet-200 hover:bg-violet-500/10",
  },
  student: {
    sectionBorder: "border-cyan-500/15",
    cardBorder: "border-cyan-500/20",
    title: "text-white",
    refresh: "text-cyan-300 hover:text-cyan-200",
    edit: "border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10",
  },
  technician: {
    sectionBorder: "border-cyan-500/15",
    cardBorder: "border-cyan-500/20",
    title: "text-white",
    refresh: "text-cyan-300 hover:text-cyan-200",
    edit: "border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10",
  },
};

/**
 * @param {object} props
 * @param {'student'|'lecturer'|'technician'} props.audience
 * @param {Record<string, unknown>} props.user
 * @param {number} [props.refreshKey]
 * @param {(u: object) => Promise<object[]>} props.fetchMyBookings
 * @param {(id: string, u: object) => Promise<unknown>} props.deleteBooking
 * @param {(id: string, u: object) => Promise<unknown>} props.cancelBooking
 * @param {(id: string, payload: object, u: object) => Promise<unknown>} props.updateBooking
 * @param {(id: string, u: object) => Promise<object>} props.fetchResourceById
 * @param {boolean} [props.embedded] — tighter layout when nested inside a dashboard modal
 * @param {string} [props.embeddedEmptyHint] — optional line when embedded and list is empty
 * @param {'equipment'|'nonEquipment'|'lecturerSpaces'|'studentSpaces'} [props.bookingScope] — client-side filter on resourceType
 */
export default function ManagedBookingsListSection({
  audience,
  user,
  refreshKey = 0,
  fetchMyBookings,
  deleteBooking,
  cancelBooking,
  updateBooking,
  fetchResourceById,
  embedded = false,
  embeddedEmptyHint,
  bookingScope,
}) {
  const { showToast } = useToast();
  const skin = SKIN[audience] || SKIN.student;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editRaw, setEditRaw] = useState(null);
  /** @type {Record<string, unknown> | null} */
  const [qrPreviewRaw, setQrPreviewRaw] = useState(null);

  /** Loads bookings for the signed-in user and applies audience/scope filters. */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let data = await fetchMyBookings(user);
      if (!Array.isArray(data)) data = [];
      if (bookingScope === "equipment") {
        data = data.filter((raw) => isEquipmentResourceType(normalizeBookingRow(raw).resourceType));
      } else if (bookingScope === "nonEquipment") {
        data = data.filter((raw) => !isEquipmentResourceType(normalizeBookingRow(raw).resourceType));
      } else if (bookingScope === "lecturerSpaces") {
        data = data.filter((raw) =>
          isLecturerSpaceBookingResourceType(normalizeBookingRow(raw).resourceType),
        );
      } else if (bookingScope === "studentSpaces") {
        data = data.filter((raw) =>
          isStudentSelfBookSpaceBookingResourceType(normalizeBookingRow(raw).resourceType),
        );
      }
      setItems(sortRawBookingsPendingFirstThenStart(data));
    } catch (e) {
      setError(e?.message || "Failed to load bookings");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyBookings, bookingScope]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (!qrPreviewRaw) return;
    /** onKey. */
    function onKey(e) {
      if (e.key === "Escape") setQrPreviewRaw(null);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [qrPreviewRaw]);

  /** Helper: handleDelete. */
  async function handleDelete(raw) {
    if (!window.confirm("Delete this pending request?")) return;
    setBusyId(String(raw.id));
    try {
      await deleteBooking(String(raw.id), user);
      showToast("Booking request deleted.", { variant: "success" });
      await load();
    } catch (e) {
      const msg = e?.message || "Delete failed";
      setError(msg);
      showToast(msg, { variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  /** Helper: handleCancel. */
  async function handleCancel(raw) {
    if (!window.confirm("Cancel this approved booking?")) return;
    setBusyId(String(raw.id));
    try {
      await cancelBooking(String(raw.id), user);
      showToast("Booking cancelled.", { variant: "success" });
      await load();
    } catch (e) {
      const msg = e?.message || "Cancel failed";
      setError(msg);
      showToast(msg, { variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    const msg =
      bookingScope === "equipment"
        ? "Loading equipment bookings…"
        : bookingScope === "lecturerSpaces"
          ? "Loading your space bookings…"
          : bookingScope === "studentSpaces"
            ? "Loading your meeting and workspace bookings…"
            : "Loading your bookings…";
    return <p className={`text-sm text-slate-500 ${embedded ? "py-2" : ""}`}>{msg}</p>;
  }

  const sectionShell = embedded ? "mt-0 border-0 pt-0" : `mt-10 border-t pt-8 ${skin.sectionBorder}`;

  return (
    <section className={sectionShell}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-heading text-lg font-semibold ${skin.title}`}>My bookings</h2>
        <button
          type="button"
          onClick={() => void load()}
          className={`text-xs font-medium ${skin.refresh}`}
        >
          Refresh
        </button>
      </div>
      {error ? (
        <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          {embedded
            ? embeddedEmptyHint ||
              "No bookings yet. Use the bookings page to browse halls, labs, meeting rooms, and library workspaces."
            : "No bookings yet. Use Book Now on a resource above."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((raw) => {
            const row = normalizeBookingRow(raw);
            const disabled = busyId === row.id;
            return (
              <li
                key={row.id}
                className={`rounded-xl border bg-slate-950/60 p-4 text-sm text-slate-300 ${skin.cardBorder}`}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.status === "APPROVED" && row.id ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setQrPreviewRaw(raw)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        audience === "lecturer"
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                          : "border-cyan-500/50 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25"
                      }`}
                    >
                      View QR
                    </button>
                  ) : null}
                  {canEditBooking(row.status) ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setEditRaw(raw)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${skin.edit}`}
                    >
                      Edit
                    </button>
                  ) : null}
                  {canDeleteBooking(row.status) ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => void handleDelete(raw)}
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  ) : null}
                  {canCancelApprovedBookingNow(row.status, row.rawStart) ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => void handleCancel(raw)}
                      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {qrPreviewRaw ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQrPreviewRaw(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="check-in-qr-preview-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-600/50 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 pb-4">
              <h2 id="check-in-qr-preview-title" className="font-heading text-lg font-semibold text-white">
                Booking confirmation QR
              </h2>
              <button
                type="button"
                onClick={() => setQrPreviewRaw(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="pt-5">
              <ApprovedBookingCheckInQr bookingRaw={qrPreviewRaw} user={user} audience={audience} />
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                The code contains plain text only (no web link). Staff can scan with a phone camera to read the
                confirmation on screen.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <EditBookingModal
        open={editRaw != null}
        booking={editRaw}
        user={user}
        audience={audience}
        fetchResourceById={fetchResourceById}
        updateBooking={updateBooking}
        onClose={() => setEditRaw(null)}
        onSaved={() => void load()}
      />
    </section>
  );
}
