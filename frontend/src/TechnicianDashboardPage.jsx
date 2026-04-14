import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";

const tiles = [
  {
    id: "profile",
    title: "My Profile",
    description: "View your personal information and account details.",
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
    id: "settings",
    title: "Settings",
    description: "Edit profile, notifications, and security preferences.",
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
  {
    id: "assigned-tickets",
    title: "Assigned Tickets",
    description: "View and manage maintenance tickets assigned to you.",
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
    id: "update-status",
    title: "Update Status",
    description: "Change ticket progress (OPEN ? IN_PROGRESS ? RESOLVED).",
    iconBg: "bg-violet-500/20 text-violet-300",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    ),
  },
];

const assignedTickets = [
  { id: "TK-4821", location: "Block C", title: "Faulty projector", status: "OPEN", priority: "High" },
  { id: "TK-4816", location: "Admin wing", title: "AC not cooling", status: "IN_PROGRESS", priority: "Medium" },
  { id: "TK-4809", location: "Lab 3", title: "Broken door lock", status: "RESOLVED", priority: "Low" },
];

function priorityClass(priority) {
  if (priority === "High") return "text-red-300 bg-red-500/15";
  if (priority === "Medium") return "text-amber-200 bg-amber-500/15";
  return "text-slate-300 bg-slate-500/20";
}

function statusClass(status) {
  if (status === "OPEN") return "text-cyan-200 bg-cyan-500/15";
  if (status === "IN_PROGRESS") return "text-amber-200 bg-amber-500/15";
  return "text-emerald-200 bg-emerald-500/15";
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Technician";
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
          SMART CAMPUS • TECHNICIAN
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Welcome back, <span className="text-cyan-400">{displayName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Technician workspace for assigned incidents and updates. Use the cards below to
              review tickets, update progress, and manage your account settings.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/maintenance"
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
            >
              Maintenance
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
            { label: "Campus Role", value: "Technician" },
            { label: "Assigned Today", value: "6 tickets" },
            { label: "Status", value: "Active", highlight: true },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 shadow-lg shadow-black/40"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.highlight ? "text-cyan-400" : "text-white"}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-lg font-semibold text-white">Your tools</h2>
          <p className="mt-1 text-sm text-slate-400">Tap a card to open details in a popup.</p>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => setModal(tile.id)}
              className="group w-full rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 text-left shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tile.iconBg}`}>
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
            aria-labelledby="technician-modal-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl ${
              modal === "settings" ? "max-w-2xl" : "max-w-lg"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-cyan-500/15 pb-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeTile.iconBg}`}>
                  {activeTile.icon}
                </span>
                <h2 id="technician-modal-title" className="font-heading text-xl font-semibold text-white sm:text-2xl">
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
                    You are signed in as <span className="text-slate-200">{user?.email || "—"}</span> with the{" "}
                    <span className="text-cyan-400">Technician</span> role.
                  </p>
                  <dl className="grid gap-4 border-t border-cyan-500/15 pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Display name</dt>
                      <dd className="mt-1 text-slate-200">{displayName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Campus email</dt>
                      <dd className="mt-1 text-slate-200">{user?.email || "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {modal === "settings" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Demo controls only — wire these fields to your API when ready.</p>
                  <StudentSettingsForm />
                </div>
              )}

              {modal === "assigned-tickets" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>Tickets currently assigned to you.</p>
                  <ul className="space-y-3">
                    {assignedTickets.map((ticket) => (
                      <li key={ticket.id} className="rounded-xl border border-slate-600/50 bg-slate-950/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs text-slate-500">{ticket.id}</p>
                            <p className="mt-1 font-medium text-slate-200">{ticket.title}</p>
                            <p className="text-xs text-slate-500">{ticket.location}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {modal === "update-status" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>Change ticket progress using this sequence:</p>
                  <ol className="space-y-3 rounded-xl border border-slate-600/50 bg-slate-950/50 p-4">
                    <li>
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-semibold text-cyan-200">OPEN</span>
                      <p className="mt-1 text-xs text-slate-500">Ticket received and waiting to be worked on.</p>
                    </li>
                    <li>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200">IN_PROGRESS</span>
                      <p className="mt-1 text-xs text-slate-500">You are actively diagnosing or fixing the issue.</p>
                    </li>
                    <li>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">RESOLVED</span>
                      <p className="mt-1 text-xs text-slate-500">Work completed and ready for confirmation/closure.</p>
                    </li>
                  </ol>
                  <p className="text-xs text-slate-500">
                    In production, these updates should sync with the <Link to="/maintenance" className="text-cyan-400 hover:text-cyan-300">Maintenance</Link> workflow and audit log.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
