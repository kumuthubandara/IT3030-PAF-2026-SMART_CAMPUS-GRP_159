import { useCallback, useEffect, useState } from "react";
import { useToast } from "../ToastProvider.jsx";
import {
  approveAdminBooking,
  fetchAdminBookings,
  rejectAdminBooking,
} from "../../features/bookings/api/adminBookingsApi.js";
import { sortRawBookingsPendingFirstThenStart } from "../../features/bookings/utils/bookingListSort.js";
import AdminBookingFilters from "./AdminBookingFilters.jsx";
import PendingBookingCard from "./PendingBookingCard.jsx";
import RejectBookingModal from "./RejectBookingModal.jsx";

const EMPTY_FILTERS = { status: "", resourceType: "", date: "", requester: "", location: "" };

function equipmentInitialFilters() {
  return { ...EMPTY_FILTERS, resourceType: "equipment" };
}

function LoadingBlock({ equipmentOnly }) {
  const ring = equipmentOnly
    ? "border-violet-500/30 border-t-violet-400"
    : "border-cyan-500/30 border-t-cyan-400";
  const box = equipmentOnly ? "border-violet-500/20" : "border-slate-700/60";
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border bg-slate-950/50 py-14 ${box}`}
    >
      <div className={`h-10 w-10 animate-spin rounded-full border-2 ${ring}`} aria-hidden />
      <p className="text-sm text-slate-400">
        {equipmentOnly ? "Loading equipment bookings…" : "Loading bookings…"}
      </p>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.user
 */
export default function AdminManageBookings({ user }) {
  const { showToast } = useToast();
  const [queueScope, setQueueScope] = useState("all");
  const equipmentOnly = queueScope === "equipment";
  const studentsMode = queueScope === "students";

  const [bookings, setBookings] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [listError, setListError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    if (queueScope === "equipment") {
      setDraftFilters(equipmentInitialFilters());
      setActiveFilters(equipmentInitialFilters());
    } else {
      setDraftFilters(EMPTY_FILTERS);
      setActiveFilters(EMPTY_FILTERS);
    }
  }, [queueScope]);

  const loadList = useCallback(async () => {
    setLoadState("loading");
    setListError("");
    try {
      const resourceTypeFilter = equipmentOnly ? "equipment" : activeFilters.resourceType || undefined;
      const rows = await fetchAdminBookings(user, {
        status: activeFilters.status || undefined,
        resourceType: resourceTypeFilter,
        date: activeFilters.date || undefined,
        requester: activeFilters.requester || undefined,
        location: activeFilters.location || undefined,
        requesterRole: studentsMode ? "student" : undefined,
      });
      const list = Array.isArray(rows) ? rows : [];
      setBookings(sortRawBookingsPendingFirstThenStart(list));
      setLoadState("ready");
    } catch (e) {
      setListError(e.message || "Could not load bookings.");
      setBookings([]);
      setLoadState("error");
    }
  }, [user, activeFilters, equipmentOnly, studentsMode]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  async function handleApprove(booking) {
    setActingId(booking.id);
    try {
      await approveAdminBooking(booking.id, user);
      showToast("Booking approved.", { variant: "success" });
      await loadList();
    } catch (e) {
      showToast(e.message || "Approval failed.", { variant: "error" });
    } finally {
      setActingId(null);
    }
  }

  async function handleRejectConfirm(reason) {
    if (!rejectTarget) return;
    setRejectSubmitting(true);
    try {
      await rejectAdminBooking(rejectTarget.id, reason, user);
      setRejectTarget(null);
      showToast("Booking rejected.", { variant: "success" });
      await loadList();
    } catch (e) {
      showToast(e.message || "Rejection failed.", { variant: "error" });
    } finally {
      setRejectSubmitting(false);
    }
  }

  function handleApplyFilters() {
    setActiveFilters(equipmentOnly ? { ...draftFilters, resourceType: "equipment" } : { ...draftFilters });
  }

  function handleResetFilters() {
    const base = equipmentOnly ? equipmentInitialFilters() : EMPTY_FILTERS;
    setDraftFilters(base);
    setActiveFilters(base);
  }

  const pendingCount = bookings.filter((b) => String(b?.status).toUpperCase() === "PENDING").length;

  return (
    <div className="space-y-4 text-sm text-slate-400">
      <div className="flex flex-wrap gap-2 border-b border-cyan-500/10 pb-4">
        <button
          type="button"
          onClick={() => setQueueScope("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            queueScope === "all"
              ? "bg-cyan-600 text-slate-950 shadow"
              : "border border-slate-600 text-slate-300 hover:border-cyan-400/50 hover:text-white"
          }`}
        >
          All bookable types
        </button>
        <button
          type="button"
          onClick={() => setQueueScope("students")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            queueScope === "students"
              ? "bg-emerald-600 text-white shadow"
              : "border border-slate-600 text-slate-300 hover:border-emerald-400/50 hover:text-white"
          }`}
        >
          Students
        </button>
        <button
          type="button"
          onClick={() => setQueueScope("equipment")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            queueScope === "equipment"
              ? "bg-violet-600 text-white shadow"
              : "border border-slate-600 text-slate-300 hover:border-violet-400/50 hover:text-white"
          }`}
        >
          Equipment only
        </button>
      </div>

      <p>
        {studentsMode ? (
          <>
            This view lists booking requests where the submitter was recorded as a{" "}
            <strong className="text-emerald-200">student</strong> (new requests only — older rows may lack role data).
            Use filters below as usual. Switch tabs to see <strong className="text-slate-200">all roles</strong> or{" "}
            <strong className="text-slate-200">equipment only</strong>.
          </>
        ) : equipmentOnly ? (
          <>
            This view lists <strong className="text-violet-200">only equipment booking requests</strong> from
            lecturers and students. Expand <strong className="text-slate-200">Filters</strong> below to narrow by
            status, day overlap, requester, or location. Switch to <strong className="text-slate-200">All bookable</strong>{" "}
            types for halls, labs, meeting rooms, and library spaces in the same queue.
          </>
        ) : (
          <>
            This view lists <strong className="text-slate-200">all booking requests</strong> for lecture halls,
            computer labs, meeting rooms, library workspaces, and equipment. Use the filters below to narrow by status,
            resource type, a calendar day (bookings that overlap that day), requester, or location. For{" "}
            <strong className="text-slate-200">pending</strong> items, use{" "}
            <strong className="text-slate-200">Approve</strong> or <strong className="text-slate-200">Reject</strong> —{" "}
            rejecting requires a reason. Use <strong className="text-slate-200">Students</strong> or{" "}
            <strong className="text-slate-200">Equipment only</strong> to focus the queue.
          </>
        )}
      </p>

      {equipmentOnly ? (
        <details className="group rounded-xl border border-violet-500/20 bg-slate-950/40 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-300/90 transition hover:bg-violet-500/10">
            Filters
          </summary>
          <div className="border-t border-violet-500/15 px-3 pb-3 pt-1">
            <AdminBookingFilters
              variant="lecturerPanel"
              hideHeading
              embedded
              draft={draftFilters}
              onDraftChange={setDraftFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              disabled={actingId != null || rejectSubmitting}
              equipmentOnly={equipmentOnly}
            />
          </div>
        </details>
      ) : (
        <AdminBookingFilters
          draft={draftFilters}
          onDraftChange={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          disabled={actingId != null || rejectSubmitting}
          equipmentOnly={equipmentOnly}
        />
      )}

      {loadState === "loading" ? <LoadingBlock equipmentOnly={equipmentOnly} /> : null}

      {loadState === "error" ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
          <p className="font-medium text-red-200">{listError}</p>
          <button
            type="button"
            onClick={() => void loadList()}
            className="mt-3 rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loadState === "ready" && bookings.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">
          {studentsMode
            ? "No student-tagged bookings match the current filters. New student requests include a role tag; clear filters or switch tabs."
            : equipmentOnly
              ? "No equipment bookings match the current filters. Clear filters or adjust criteria to see more results."
              : "No bookings match the current filters. Clear filters or adjust criteria to see more results."}
        </p>
      ) : null}

      {loadState === "ready" && bookings.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-lg font-semibold text-white">
                {studentsMode ? "Student bookings" : equipmentOnly ? "Equipment bookings" : "All bookings"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                {pendingCount > 0 ? ` · ${pendingCount} pending` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadList()}
              disabled={actingId != null || rejectSubmitting}
              className={
                equipmentOnly
                  ? "text-xs font-medium text-violet-300 transition hover:text-violet-200 disabled:opacity-40"
                  : "text-xs font-medium text-cyan-300 transition hover:text-cyan-200 disabled:opacity-40"
              }
            >
              Refresh
            </button>
          </div>
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id}>
                <PendingBookingCard
                  booking={b}
                  appearance={equipmentOnly ? "lecturerPanel" : "default"}
                  showReviewActions={String(b?.status ?? "").toUpperCase() === "PENDING"}
                  disabled={actingId != null || rejectSubmitting}
                  onApprove={() => void handleApprove(b)}
                  onReject={() => setRejectTarget(b)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <RejectBookingModal
        open={rejectTarget != null}
        booking={rejectTarget}
        isSubmitting={rejectSubmitting}
        onClose={() => {
          if (!rejectSubmitting) setRejectTarget(null);
        }}
        onConfirm={(reason) => void handleRejectConfirm(reason)}
      />
    </div>
  );
}
