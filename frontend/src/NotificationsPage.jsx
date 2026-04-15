import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const sampleItems = [
  {
    id: "1",
    title: "Booking approved",
    detail: "Engineering Lab A · Tomorrow 10:00 AM – 12:00 PM",
    time: "2 hours ago",
    tone: "emerald",
  },
  {
    id: "2",
    title: "Maintenance update",
    detail: "Ticket #TK-4821 — Technician assigned to Block C AC issue",
    time: "Yesterday",
    tone: "cyan",
  },
  {
    id: "3",
    title: "Approval needed",
    detail: "Seminar Hall B request is waiting for facilities sign-off",
    time: "2 days ago",
    tone: "amber",
  },
];

const toneRing = {
  emerald: "border-emerald-500/30 bg-emerald-500/10",
  cyan: "border-cyan-500/30 bg-cyan-500/10",
  amber: "border-amber-500/30 bg-amber-500/10",
};

export default function NotificationsPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== "#notifications") return;
    const el = document.getElementById("notifications");
    if (!el) return;
    const t = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [hash]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400/90">
              Smart notifications
            </p>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Your campus activity
            </h1>
            <p className="mt-4 text-sm text-slate-400 sm:text-base">
              Approvals, ticket updates, and comments will stream here when your backend is
              connected. The bell in the header always brings you back to this view.
            </p>
          </div>
        </section>

        <section
          id="notifications"
          className="mx-auto w-full max-w-2xl scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
        >
          <h2 className="sr-only">Recent notifications</h2>
          <ul className="space-y-3">
            {sampleItems.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border p-4 sm:p-5 ${toneRing[item.tone]}`}
              >
                <p className="font-medium text-slate-100">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                <p className="mt-2 text-xs text-slate-500">{item.time}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-sm text-slate-500">
            Prefer email? Adjust preferences on the{" "}
            <Link to="/settings" className="text-cyan-400 hover:text-cyan-300">
              settings
            </Link>{" "}
            page (students) or contact{" "}
            <Link to="/contact" className="text-cyan-400 hover:text-cyan-300">
              IT support
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
