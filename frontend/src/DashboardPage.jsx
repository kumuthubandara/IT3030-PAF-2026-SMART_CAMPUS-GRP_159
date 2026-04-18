import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const summaryStats = [
  { label: "Today’s bookings", value: "26", hint: "+4 vs yesterday" },
  { label: "Open tickets", value: "14", hint: "3 high priority" },
  { label: "Pending approvals", value: "8", hint: "Facilities team" },
  { label: "Active users", value: "312", hint: "On campus today" },
];

const recentBookings = [
  { resource: "Engineering Lab A", time: "10:00 – 12:00", requester: "Dr. Perera", status: "Confirmed" },
  { resource: "Seminar Hall B", time: "14:00 – 16:00", requester: "Student Union", status: "Pending" },
  { resource: "Sports Pavilion", time: "17:00 – 19:00", requester: "Athletics Dept.", status: "Confirmed" },
];

const openTickets = [
  { id: "TK-4821", title: "Faulty projector – Block C", priority: "High", owner: "Tech team A" },
  { id: "TK-4816", title: "AC not cooling – Admin wing", priority: "Medium", owner: "HVAC" },
  { id: "TK-4809", title: "Broken door lock – Lab 3", priority: "Low", owner: "Facilities" },
];

const notifications = [
  "Booking approved: Engineering Lab A (10:00 AM).",
  "Ticket TK-4821 assigned to technician.",
  "Reminder: 3 approvals waiting for Facilities.",
];

/** priorityClass. */
function priorityClass(priority) {
  if (priority === "High") return "text-red-300 bg-red-500/15";
  if (priority === "Medium") return "text-cyan-200 bg-cyan-400/10";
  return "text-slate-300 bg-slate-500/20";
}

/** UI: DashboardPage. */
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90">
                Operations overview
              </p>
              <h2 className="font-heading mt-1 text-3xl font-bold text-white sm:text-4xl">
                Dashboard
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                Snapshot of bookings, maintenance tickets, and activity across
                campus. Connect this view to your backend when APIs are ready.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
              >
                View site
              </Link>
              <button
                type="button"
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:bg-cyan-300"
              >
                Refresh data
              </button>
            </div>
          </div>

          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryStats.map((s) => (
              <article
                key={s.label}
                className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="font-heading mt-2 text-3xl font-bold text-cyan-200">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
              </article>
            ))}
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold text-cyan-400">
                  Recent bookings
                </h3>
                <span className="text-xs text-slate-400">Sample data</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-500/15 bg-slate-900/80 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-600/50 bg-slate-800/80 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Resource</th>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Requester</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600/40">
                      {recentBookings.map((row) => (
                        <tr key={row.resource} className="hover:bg-slate-800/60">
                          <td className="px-4 py-3 font-medium text-white">
                            {row.resource}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{row.time}</td>
                          <td className="px-4 py-3 text-slate-300">{row.requester}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                row.status === "Confirmed"
                                  ? "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-200"
                                  : "rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-xs font-medium text-cyan-200"
                              }
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-heading text-lg font-semibold text-cyan-400">
                Notifications
              </h3>
              <ul className="mt-4 space-y-3 rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-4">
                {notifications.map((n) => (
                  <li
                    key={n}
                    className="rounded-xl border border-slate-600/40 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-200"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold text-cyan-400">
                Open maintenance tickets
              </h3>
              <span className="text-xs text-slate-400">Sample data</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {openTickets.map((t) => (
                <article
                  key={t.id}
                  className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-cyan-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-mono text-slate-400">{t.id}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityClass(t.priority)}`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-white">{t.title}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Owner: <span className="text-slate-300">{t.owner}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      <SiteFooter />
    </div>
  );
}
