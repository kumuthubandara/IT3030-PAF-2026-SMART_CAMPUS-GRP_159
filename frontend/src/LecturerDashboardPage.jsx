import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

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
    title: "Teaching schedule",
    description: "This week’s sessions, rooms, and cohorts in one glance.",
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
    title: "Lecture halls, computer labs, meeting rooms & library working spaces booking",
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
      "Reserve laptops, projectors, portable lab kits, and other teaching kit for sessions.",
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
    description: "Log problems in your teaching spaces and track fixes.",
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

const weekSessions = [
  { day: "Mon", module: "IT3030 — PAF", room: "Lab A", time: "08:30 – 11:30" },
  { day: "Tue", module: "CS2010 — Data Structures", room: "Hall 2B", time: "13:00 – 15:00" },
  { day: "Wed", module: "IT3030 — PAF (tutorial)", room: "Lab A", time: "10:00 – 12:00" },
  { day: "Thu", module: "Office hours", room: "Block C — 204", time: "14:00 – 16:00" },
  { day: "Fri", module: "CS2010 — Lab", room: "Lab B", time: "09:00 – 11:00" },
];

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

export default function LecturerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "Lecturer";
  const [modal, setModal] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  async function loadRecentActivities() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/activities?limit=10`);
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
  }, []);

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
              Demo view · Sample schedule · Wire to your timetable API when ready
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/facilities"
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
            >
              Facilities
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
            >
              Home
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
            Open a card for details. This layout is separate from the student and operations
            dashboards.
          </p>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => {
                if (tile.id === "maintenance") {
                  navigate("/lecturer/maintenance");
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
            View your latest bookings, ticket updates, and actions.
          </p>
          {recentActivities.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/50 p-6 text-sm text-slate-500">
              No recent activity yet.
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
              modal === "settings" ? "max-w-2xl" : "max-w-lg"
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
                  <p>Sample teaching week — replace with data from your academic system.</p>
                  <ul className="divide-y divide-slate-600/40 rounded-xl border border-slate-600/50">
                    {weekSessions.map((row) => (
                      <li
                        key={`${row.day}-${row.module}`}
                        className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-200">{row.module}</p>
                          <p className="text-xs text-slate-500">{row.room}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          <span className="font-semibold text-violet-300">{row.day}</span>
                          <span className="mx-1 text-slate-600">·</span>
                          {row.time}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {modal === "rooms" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Book or adjust teaching spaces on the{" "}
                    <Link to="/facilities" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Facilities
                    </Link>{" "}
                    page. Pending approvals will appear here when APIs are connected.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No pending room requests (demo).
                  </div>
                </div>
              )}

              {modal === "equipment" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Request portable equipment for labs and lectures—pickup windows, quantities,
                    and returns will show here once your asset catalogue API is connected. For
                    shared campus spaces, use{" "}
                    <Link to="/facilities" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Facilities
                    </Link>{" "}
                    alongside this view.
                  </p>
                  <ul className="rounded-xl border border-slate-600/50 bg-slate-950/40 px-4 py-3 text-xs text-slate-500">
                    <li className="py-1">Typical items: laptops, projectors, clickers, lab sensor kits</li>
                    <li className="py-1">Link bookings to your teaching schedule when integrated</li>
                  </ul>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No active equipment reservations (demo).
                  </div>
                </div>
              )}

              {modal === "maintenance" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Report projector, seating, or climate issues in your teaching rooms. Link to
                    the full{" "}
                    <Link to="/maintenance" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Maintenance
                    </Link>{" "}
                    area for campus-wide context.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No open lecturer tickets (demo).
                  </div>
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
