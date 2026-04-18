import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";
import ManagedBookingsListSection from "./features/bookings/components/ManagedBookingsListSection.jsx";
import * as lecturerBookingsApi from "./features/bookings/api/lecturerBookingsApi.js";
import { isLecturerSpaceBookingResourceType } from "./features/bookings/components/lecturer/lecturerResourceCategories.js";
import BookingStatusBadge from "./components/student-bookings/BookingStatusBadge.jsx";
import { normalizeBookingRow } from "./components/student-bookings/MyBookings.jsx";
import { compareMyBookingsPendingFirstThenStart } from "./features/bookings/utils/bookingListSort.js";
import { recentActivitiesListUrl } from "./services/recentActivitiesApi.js";

const tiles = [
  {
    id: "profile",
    title: "Profile",
    description: "View your campus identity, email, and account details.",
    iconBg: "bg-cyan-600/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: "schedule",
    title: "My Teaching schedule",
    description: "View your upcoming lectures, labs, and assigned venues.",
    iconBg: "bg-violet-500/20 text-violet-300",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "rooms",
    title: "Space booking",
    description: "Request or review spaces for lectures, labs, and assessments.",
    iconBg: "bg-cyan-500/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: "equipment",
    title: "Equipment booking",
    description:
      "View kit bookings here; the bookings page lists halls, labs, rooms, and workspaces only.",
    iconBg: "bg-sky-500/20 text-sky-300",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    id: "maintenance",
    title: "Classroom & facility issues",
    description: "Open maintenance tickets for your teaching spaces—submit and track issues.",
    iconBg: "bg-amber-500/20 text-amber-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    title: "Settings",
    description: "Notifications and preferences for your lecturer account.",
    iconBg: "bg-red-500/20 text-red-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    ),
  },
];

function shortWeekdayFromIso(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

/** Monday–Sunday week range in local time, e.g. "14 Apr 2026 - 20 Apr 2026". */
function formatTeachingWeekRangeLabel() {
  const now = new Date();
  const dow = now.getDay();
  const offsetMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + offsetMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts = { day: "numeric", month: "short", year: "numeric" };
  return `${monday.toLocaleDateString(undefined, opts)} - ${sunday.toLocaleDateString(undefined, opts)}`;
}

function formatAccountCreated(iso) {
  if (!iso || typeof iso !== "string") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString();
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function scheduleListIdentityKey(user) {
  if (!user) return "";
  const email = String(user.email ?? "").trim().toLowerCase();
  return email || "_no_email_";
}

export default function LecturerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "Lecturer";
  const [modal, setModal] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [facilityScheduleRows, setFacilityScheduleRows] = useState([]);
  const [facilityScheduleLoading, setFacilityScheduleLoading] = useState(false);
  const lastScheduleListIdentityRef = useRef("");
  const scheduleListIdentity = scheduleListIdentityKey(user);

  async function loadRecentActivities() {
    try {
      const res = await fetch(recentActivitiesListUrl(10, user));
      if (!res.ok) {
        throw new Error("Failed to load recent activity");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentActivities(data);
      }
    } catch {
      // Keep previous data if API is unavailable.
    }
  }

  useEffect(() => {
    if (!modal) return;
    function onKey(e) {
      if (e.key === "Escape") setModal(null);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal]);

  useEffect(() => {
    void loadRecentActivities();
    const id = setInterval(() => {
      void loadRecentActivities();
    }, 10000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (modal !== "schedule" || !user) {
      return;
    }
    let cancelled = false;
    async function loadFacilitySchedule() {
      if (lastScheduleListIdentityRef.current !== scheduleListIdentity) {
        lastScheduleListIdentityRef.current = scheduleListIdentity;
        setFacilityScheduleRows([]);
      }
      setFacilityScheduleLoading(true);
      try {
        const data = await lecturerBookingsApi.fetchMyBookings(user);
        if (cancelled) return;
        const rawList = Array.isArray(data) ? data : [];
        const spaceRows = rawList
          .filter((raw) => isLecturerSpaceBookingResourceType(normalizeBookingRow(raw).resourceType))
          .map(normalizeBookingRow)
          .sort(compareMyBookingsPendingFirstThenStart);
        setFacilityScheduleRows(spaceRows);
      } catch {
        if (!cancelled) setFacilityScheduleRows([]);
      } finally {
        if (!cancelled) setFacilityScheduleLoading(false);
      }
    }
    void loadFacilitySchedule();
    return () => {
      cancelled = true;
    };
  }, [modal, scheduleListIdentity, user]);

  const activeTile = tiles.find((t) => t.id === modal);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/90">
          SMART CAMPUS • LECTURER
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Welcome,{" "}
              <span className="text-cyan-400">{displayName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Your campus role is <strong className="text-violet-300">Lecturer</strong> — manage
              teaching spaces, sessions, and facility requests without the full operations
              console.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Open <strong className="text-slate-400">My Teaching schedule</strong> for this week&apos;s bookings —
              synced from Smart Campus facility requests.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
            >
              Contact
            </Link>
            <Link
              to="/lecturer/bookings"
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/60 hover:text-white"
            >
              Book resources
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Campus role", value: "Lecturer", highlight: true },
            {
              label: "Account created",
              value: formatAccountCreated(user?.createdAt),
              valueClass: "text-lg sm:text-xl",
            },
            { label: "Status", value: "Active", highlight: false },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-violet-500/20 bg-slate-900/80 p-6 shadow-lg shadow-black/40"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p
                className={`mt-2 font-bold ${card.valueClass ?? "text-2xl"} ${
                  card.highlight ? "text-violet-300" : "text-white"
                }`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-lg font-semibold text-white">Lecturer tools</h2>
          <p className="mt-1 text-sm text-slate-400">
            Open a card for details. Maintenance opens the ticket flow in a full page.
          </p>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => {
                if (tile.id === "maintenance") {
                  navigate("/tickets");
                  return;
                }
                setModal(tile.id);
              }}
              className="group w-full rounded-2xl border border-violet-500/15 bg-slate-900/80 p-6 text-left shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:shadow-violet-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tile.iconBg}`}
              >
                {tile.icon}
              </div>
              <h2
                className={`mt-4 font-heading font-semibold text-white group-hover:text-violet-200 ${
                  tile.id === "rooms" ? "text-base sm:text-lg" : "text-xl"
                }`}
              >
                {tile.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{tile.description}</p>
            </button>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-violet-300">Recent Activity</h2>
            <span className="text-xs text-slate-500">Auto refreshes every 10s</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Shows <strong className="text-slate-300">your approved bookings</strong> only — pending requests and other
            noise are hidden. Use <strong className="text-slate-300">My bookings</strong> or the bookings page for the
            full list.
          </p>
          {recentActivities.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/50 p-6 text-sm text-slate-500">
              No approved bookings to show yet. When staff approve a request you submitted, it will appear here.
            </div>
          ) : (
            <ul className="mt-4 space-y-3 rounded-2xl border border-violet-500/15 bg-slate-900/70 p-4">
              {recentActivities.map((activity) => (
                <li
                  key={`${activity.id ?? activity.createdAt}-${activity.message}`}
                  className="rounded-xl border border-slate-600/40 bg-slate-800/70 px-3 py-2.5"
                >
                  <p className="text-sm text-slate-200">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.category || "SYSTEM"} • {formatDateTime(activity.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />

      {modal && activeTile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lecturer-modal-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-violet-500/25 bg-slate-900 p-6 shadow-2xl ${
              modal === "settings" || modal === "rooms" || modal === "equipment" || modal === "schedule"
                ? "max-w-2xl"
                : "max-w-lg"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-violet-500/15 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeTile.iconBg}`}
                >
                  {activeTile.icon}
                </span>
                <h2
                  id="lecturer-modal-title"
                  className={`font-heading font-semibold text-white ${
                    activeTile.id === "rooms"
                      ? "text-base leading-snug sm:text-lg"
                      : activeTile.id === "schedule"
                        ? "text-lg leading-tight sm:text-xl"
                        : "text-xl sm:text-2xl"
                  }`}
                >
                  {activeTile.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close dialog"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="pt-5">
              {modal === "profile" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    You are signed in as{" "}
                    <span className="text-slate-200">{user?.email || "—"}</span> with the{" "}
                    <span className="text-violet-300">Lecturer</span> campus role.
                  </p>
                  <dl className="grid gap-4 border-t border-violet-500/15 pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Display name
                      </dt>
                      <dd className="mt-1 text-slate-200">{displayName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Campus email
                      </dt>
                      <dd className="mt-1 text-slate-200">{user?.email || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Account created
                      </dt>
                      <dd className="mt-1 text-slate-200">
                        {formatAccountCreated(user?.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {modal === "schedule" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <header className="border-b border-slate-600/50 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/90">
                      {formatTeachingWeekRangeLabel()}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      View your upcoming lectures, labs, and assigned venues. Rows below are your{" "}
                      <strong className="text-slate-200">Smart Campus</strong> space bookings (purpose as session title,
                      venue as location).{" "}
                      <Link to="/lecturer/bookings" className="font-medium text-cyan-400 hover:text-cyan-300">
                        Manage bookings
                      </Link>
                      .
                    </p>
                  </header>
                  {facilityScheduleLoading ? (
                    <p className="text-xs text-slate-500">Loading…</p>
                  ) : facilityScheduleRows.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-600/50 bg-slate-950/50 px-4 py-8 text-center text-slate-500">
                      No bookings in this view yet.{" "}
                      <Link to="/facilities" className="text-cyan-400 hover:text-cyan-300">
                        Facilities
                      </Link>{" "}
                      ·{" "}
                      <Link to="/lecturer/bookings" className="text-cyan-400 hover:text-cyan-300">
                        My bookings
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-600/40 rounded-xl border border-slate-600/50">
                      {facilityScheduleRows.map((row) => {
                        const purposeLine =
                          row.purpose && row.purpose !== "—" ? String(row.purpose).trim() : "";
                        const titleLine = purposeLine || row.roomName;
                        const venueLine = purposeLine
                          ? row.roomName
                          : row.resourceType && String(row.resourceType) !== "—"
                            ? row.resourceType
                            : "—";
                        return (
                          <li key={row.id} className="px-4 py-4">
                            <p className="font-heading text-base font-semibold text-white">{titleLine}</p>
                            <p className="mt-0.5 text-sm text-slate-400">{venueLine}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/40 pt-3">
                              <p className="text-sm text-slate-300">
                                <span className="font-semibold text-violet-300">
                                  {shortWeekdayFromIso(row.rawStart)}
                                </span>
                                <span className="mx-1.5 text-slate-600">•</span>
                                <span className="tabular-nums text-slate-300">
                                  {String(row.timeRangeLabel).replace(/\u2013/g, "-")}
                                </span>
                              </p>
                              <BookingStatusBadge status={row.status} variant="schedule" />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {modal === "rooms" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    This panel lists <strong className="text-violet-200">only your bookings</strong> for lecture
                    halls, computer labs, meeting rooms, and library workspaces. To browse resources and submit a new
                    request, open the{" "}
                    <Link to="/lecturer/bookings" className="font-medium text-cyan-400 hover:text-cyan-300">
                      full bookings page
                    </Link>
                    .
                  </p>
                  <ManagedBookingsListSection
                    embedded
                    bookingScope="lecturerSpaces"
                    audience="lecturer"
                    user={user}
                    fetchMyBookings={lecturerBookingsApi.fetchMyBookings}
                    deleteBooking={lecturerBookingsApi.deleteBooking}
                    cancelBooking={lecturerBookingsApi.cancelApprovedBooking}
                    updateBooking={lecturerBookingsApi.updateBooking}
                    fetchResourceById={lecturerBookingsApi.fetchResourceById}
                  />
                </div>
              )}

              {modal === "equipment" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    This panel lists <strong className="text-violet-200">only your equipment bookings</strong>. The{" "}
                    <Link to="/lecturer/bookings" className="font-medium text-cyan-400 hover:text-cyan-300">
                      bookings page
                    </Link>{" "}
                    covers halls, labs, meeting rooms, and library workspaces only — use the{" "}
                    <Link to="/facilities" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Facilities
                    </Link>{" "}
                    catalogue (read-only) as a reference for campus kit, then follow your local process to reserve
                    equipment (demo).
                  </p>
                  <ManagedBookingsListSection
                    embedded
                    bookingScope="equipment"
                    embeddedEmptyHint="No equipment bookings yet. When your campus connects equipment booking here, new requests will appear in this list."
                    audience="lecturer"
                    user={user}
                    fetchMyBookings={lecturerBookingsApi.fetchMyBookings}
                    deleteBooking={lecturerBookingsApi.deleteBooking}
                    cancelBooking={lecturerBookingsApi.cancelApprovedBooking}
                    updateBooking={lecturerBookingsApi.updateBooking}
                    fetchResourceById={lecturerBookingsApi.fetchResourceById}
                  />
                </div>
              )}

              {modal === "settings" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Demo preferences — same controls as students; extend for staff policies when
                    you integrate your backend.
                  </p>
                  <StudentSettingsForm />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
