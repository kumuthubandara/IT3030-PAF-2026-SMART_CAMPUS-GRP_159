import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";

const tiles = [
  {
    id: "users",
    title: "Manage Users",
    description: "View and manage all system users and roles.",
    iconBg: "bg-cyan-600/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    id: "facilities",
    title: "Manage Facilities",
    description: "Add, update, or remove campus resources and assets.",
    iconBg: "bg-emerald-500/20 text-emerald-400",
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
    id: "manage-bookings",
    title: "Manage Bookings",
    description: "Review, approve, or reject booking requests.",
    iconBg: "bg-cyan-500/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm3-7h1m4 0h1m-6 4h1m4 0h1m-6 4h8"
        />
      </svg>
    ),
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Track and manage all maintenance and incident tickets.",
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
    id: "notifications",
    title: "Notifications",
    description: "Monitor system alerts and user notifications.",
    iconBg: "bg-violet-500/20 text-violet-300",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure system settings and access controls.",
    iconBg: "bg-red-500/20 text-red-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Administrator";
  const [modal, setModal] = useState(null);

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

  const activeTile = tiles.find((t) => t.id === modal);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/90">
          SMART CAMPUS • ADMIN DASHBOARD
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="text-cyan-400">{displayName}!</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Manage users, facilities, bookings, maintenance, notifications, and system settings
              from the tools below. This is a front-end demo—connect your APIs when ready.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Academic year 2025/26 · Sample data for demonstration
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
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Campus Role", value: "Administrator" },
            { label: "Access Valid Through", value: "April 2026" },
            { label: "Status", value: "Active", highlight: true },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 shadow-lg shadow-black/40"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  card.highlight ? "text-cyan-400" : "text-white"
                }`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-lg font-semibold text-white">Your tools</h2>
          <p className="mt-1 text-sm text-slate-400">
            Tap a card to open details in a popup.
          </p>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => setModal(tile.id)}
              className="group w-full rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 text-left shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tile.iconBg}`}
              >
                {tile.icon}
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-white group-hover:text-cyan-300">
                {tile.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{tile.description}</p>
            </button>
          ))}
        </div>
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
            aria-labelledby="admin-dashboard-modal-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl ${
              modal === "settings" ? "max-w-2xl" : "max-w-lg"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-cyan-500/15 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeTile.iconBg}`}
                >
                  {activeTile.icon}
                </span>
                <h2
                  id="admin-dashboard-modal-title"
                  className="font-heading text-xl font-semibold text-white sm:text-2xl"
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
              {modal === "users" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Search, filter, and edit campus accounts and role assignments. In this demo,
                    users exist only in your browser session—no server list yet.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No user directory connected (demo).
                  </div>
                </div>
              )}

              {modal === "facilities" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Maintain the catalogue of rooms, labs, and assets. The{" "}
                    <Link to="/facilities" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Facilities
                    </Link>{" "}
                    page is <strong className="text-amber-200/90">read-only for admins</strong>—only{" "}
                    <strong className="text-slate-200">students</strong> and{" "}
                    <strong className="text-slate-200">lecturers</strong> can book from there. Use{" "}
                    <strong className="text-slate-200">Manage Bookings</strong> to approve or reject
                    requests.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No facility editor connected (demo).
                  </div>
                </div>
              )}

              {modal === "manage-bookings" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Approve or reject booking requests, resolve conflicts, and enforce policy. Wire
                    this panel to your scheduling service when APIs are available.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No pending approvals (demo).
                  </div>
                </div>
              )}

              {modal === "maintenance" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Oversee all maintenance and incident tickets across campus. Open the{" "}
                    <Link to="/maintenance" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Maintenance
                    </Link>{" "}
                    page for the shared campus view used by technicians and reporters.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No tickets in this panel (demo).
                  </div>
                </div>
              )}

              {modal === "notifications" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    System alerts, booking outcomes, and ticket updates can be centralized here.
                    The header bell links to the same{" "}
                    <Link
                      to="/notifications#notifications"
                      className="font-medium text-cyan-400 hover:text-cyan-300"
                    >
                      Notifications
                    </Link>{" "}
                    hub for everyone.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No admin-wide feed connected (demo).
                  </div>
                </div>
              )}

              {modal === "settings" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Demo: personal notification toggles below. In production, add system-wide access
                    controls and policy settings here.
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
