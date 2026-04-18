import { useCallback, useEffect, useMemo, useState } from "react";
import BookingModal from "../../../components/student-bookings/BookingModal.jsx";
import MeetingRoomCard from "../../../components/student-bookings/MeetingRoomCard.jsx";
import { fetchBookableResources } from "../api/lecturerBookingsApi.js";
import * as lecturerBookingsApi from "../api/lecturerBookingsApi.js";
import * as studentBookingsApi from "../../../services/bookingsApi.js";
import {
  categoryIdForResource,
  LECTURER_BOOKING_TABS,
  LECTURER_SPACE_BOOKING_TABS,
  TECHNICIAN_BOOKING_TABS,
  isLecturerSpaceResource,
} from "./lecturer/lecturerResourceCategories.js";
import ManagedBookingsListSection from "./ManagedBookingsListSection.jsx";
import StudentFloorBlockBrowser from "../../../components/student-bookings/StudentFloorBlockBrowser.jsx";
import { canViewResourceForRole } from "../../../components/facilities/facilityBrowseCore.js";

const COPY = {
  student: (
    <>
      Browse <strong className="text-cyan-200/90">meeting rooms</strong> and{" "}
      <strong className="text-cyan-200/90">library workspaces</strong> you are allowed to book, by category, and submit
      a request. New bookings start as <strong className="text-amber-200/90">PENDING</strong> until staff approve or
      reject them. Overlapping times for the same resource are blocked by the server.
    </>
  ),
  lecturer: (
    <>
      This page is for{" "}
      <strong className="text-violet-200/90">
        lecture halls, computer labs, meeting rooms, and library workspaces
      </strong>{" "}
      only. Every new booking starts as <strong className="text-amber-200/90">PENDING</strong> until an
      administrator approves or rejects it. The server blocks overlapping reservations for the same resource. Use your
      dashboard <strong className="text-slate-200">Equipment booking</strong> tile for kit requests.
    </>
  ),
  technician: (
    <>
      This page lists <strong className="text-cyan-200/90">equipment</strong> you are allowed to book as a technician
      — the same catalogue as on <strong className="text-slate-200">Facilities</strong>. New requests are{" "}
      <strong className="text-amber-200/90">PENDING</strong> until an administrator approves or rejects them. The
      server blocks overlapping reservations for the same resource.
    </>
  ),
};

const TAB_SKIN = {
  student: {
    active: "bg-cyan-500 text-slate-950 shadow",
    idle: "border border-slate-600 text-slate-300 hover:border-cyan-400/50 hover:text-white",
  },
  lecturer: {
    active: "bg-violet-500 text-white shadow",
    idle: "border border-slate-600 text-slate-300 hover:border-violet-400/50 hover:text-white",
  },
  technician: {
    active: "bg-cyan-500 text-slate-950 shadow",
    idle: "border border-slate-600 text-slate-300 hover:border-cyan-400/50 hover:text-white",
  },
};

/**
 * @param {object} props
 * @param {'student'|'lecturer'|'technician'} props.audience
 * @param {Record<string, unknown>} props.user
 * @param {string} [props.defaultTabId]
 */
function normalizeDefaultTab(audience, tab) {
  const t = String(tab || "all").trim() || "all";
  if (audience === "lecturer" && t === "equipment") return "all";
  return t;
}

/** UI: ResourceBookingsShell. */
export default function ResourceBookingsShell({ audience, user, defaultTabId = "all" }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabId, setTabId] = useState(() => normalizeDefaultTab(audience, defaultTabId));
  const bookingTabs =
    audience === "lecturer"
      ? LECTURER_SPACE_BOOKING_TABS
      : audience === "technician"
        ? TECHNICIAN_BOOKING_TABS
        : LECTURER_BOOKING_TABS;
  const [bookingResource, setBookingResource] = useState(null);
  const [myBookingsRefreshKey, setMyBookingsRefreshKey] = useState(0);
  const tabSkin = TAB_SKIN[audience] || TAB_SKIN.student;

  const listApi =
    audience === "student"
      ? {
          fetchMyBookings: studentBookingsApi.fetchMyBookings,
          deleteBooking: studentBookingsApi.deleteMyBooking,
          cancelBooking: (id, u) => studentBookingsApi.cancelBooking(id, u, {}),
          updateBooking: studentBookingsApi.updateBooking,
          fetchResourceById: studentBookingsApi.fetchResourceById,
        }
      : audience === "technician"
        ? {
            fetchMyBookings: studentBookingsApi.fetchMyBookings,
            deleteBooking: studentBookingsApi.deleteMyBooking,
            cancelBooking: (id, u) => studentBookingsApi.cancelBooking(id, u, {}),
            updateBooking: studentBookingsApi.updateBooking,
            fetchResourceById: studentBookingsApi.fetchResourceById,
          }
        : {
            fetchMyBookings: lecturerBookingsApi.fetchMyBookings,
            deleteBooking: lecturerBookingsApi.deleteBooking,
            cancelBooking: lecturerBookingsApi.cancelApprovedBooking,
            updateBooking: lecturerBookingsApi.updateBooking,
            fetchResourceById: lecturerBookingsApi.fetchResourceById,
          };

  /** Loads bookable resources from the API and filters by dashboard audience. */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let list = await fetchBookableResources(user);
      if (audience === "lecturer") {
        // Same visibility rules as Facilities (lecturer): halls/labs always; meeting & library only if not student-only; no equipment on this page.
        list = list.filter(
          (r) => isLecturerSpaceResource(r) && canViewResourceForRole(r, "lecturer"),
        );
      } else if (audience === "student") {
        list = list.filter((r) => canViewResourceForRole(r, "student"));
      } else if (audience === "technician") {
        list = list.filter((r) => canViewResourceForRole(r, "technician"));
      }
      setResources(list);
    } catch (e) {
      setError(e?.message || "Could not load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [user, audience]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    const want = normalizeDefaultTab(audience, defaultTabId);
    const hasCategory = resources.some((r) => categoryIdForResource(r) === want);
    if (want !== "all" && !hasCategory) {
      setTabId("all");
    } else {
      setTabId(want);
    }
  }, [defaultTabId, loading, resources, audience]);

  /** Tab labels that still have at least one bookable resource in the loaded list. */
  const visibleTabs = useMemo(() => {
    const counts = new Map();
    for (const r of resources) {
      const c = categoryIdForResource(r);
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return bookingTabs.filter((t) => {
      if (t.id === "all") return resources.length > 0;
      return (counts.get(t.id) || 0) > 0;
    });
  }, [resources, bookingTabs]);

  /** Resources filtered by the active category tab. */
  const filtered = useMemo(() => {
    if (tabId === "all") return resources;
    return resources.filter((r) => categoryIdForResource(r) === tabId);
  }, [resources, tabId]);

  const lecturerStructuredView = audience === "lecturer" && (tabId === "lecture" || tabId === "lab");
  const studentStructuredView = audience === "student" && (tabId === "lecture" || tabId === "lab");

  return (
    <div className="space-y-6 text-sm text-slate-400">
      <p>{COPY[audience] ?? COPY.student}</p>

      {loading ? <p className="text-slate-500">Loading resources…</p> : null}
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-3 text-xs font-semibold text-red-100 underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && resources.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTabId(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  tabId === t.id ? tabSkin.active : tabSkin.idle
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {studentStructuredView || lecturerStructuredView ? (
            <StudentFloorBlockBrowser
              resources={filtered}
              spaceKind={tabId === "lab" ? "lab" : "lecture"}
              onBookNow={(r) => setBookingResource(r)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <MeetingRoomCard
                  key={String(r.id)}
                  resource={r}
                  isBookable
                  onBookNow={() => setBookingResource(r)}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      {!loading && !error && resources.length === 0 ? (
        <p className="text-slate-500">
          {audience === "technician"
            ? "No equipment resources are available for your technician account yet. They must match what you see on Facilities (ACTIVE equipment for technicians). Add or tag items from the admin dashboard."
            : "No bookable resources found. Add facilities from the admin dashboard."}
        </p>
      ) : null}

      <BookingModal
        open={bookingResource != null}
        resource={bookingResource}
        user={user}
        onClose={() => setBookingResource(null)}
        onSuccess={() => {
          void load();
          setMyBookingsRefreshKey((k) => k + 1);
        }}
      />

      <ManagedBookingsListSection
        audience={audience}
        user={user}
        refreshKey={myBookingsRefreshKey}
        bookingScope={
          audience === "lecturer"
            ? "lecturerSpaces"
            : audience === "technician"
              ? "equipment"
              : tabId === "equipment"
                ? "equipment"
                : undefined
        }
        fetchMyBookings={listApi.fetchMyBookings}
        deleteBooking={listApi.deleteBooking}
        cancelBooking={listApi.cancelBooking}
        updateBooking={listApi.updateBooking}
        fetchResourceById={listApi.fetchResourceById}
      />
    </div>
  );
}
