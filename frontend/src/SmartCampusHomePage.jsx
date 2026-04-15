import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SmartCampusHomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash === "#features" ? "features" : hash === "#how-it-works" ? "how-it-works" : null;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const t = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [hash]);

  const features = [
    {
      title: "Facility & Asset Booking",
      to: "/facilities",
      description:
        "Book lecture halls, labs, and shared spaces in a few clicks with clear availability and no timetable clashes.",
    },
    {
      title: "Maintenance & Incident Tickets",
      to: "/maintenance",
      description:
        "Report issues quickly and follow every update until the job is resolved, with clear ownership at each step.",
    },
    {
      title: "Role-Based Access",
      to: "/login?redirect=/dashboard",
      linkText: "Sign in →",
      ariaLabel: "Role-Based Access — open sign in",
      description:
        "Give students, staff, admins, and technicians the right tools and permissions for their day-to-day tasks.",
    },
    {
      title: "Smart Notifications",
      to: "/notifications#notifications",
      description:
        "Get instant updates for approvals, ticket changes, and comments so everyone stays informed without extra follow-ups.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl lg:max-w-none">
              <p className="mb-4 inline-flex w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                Built for Campus Teams
              </p>
              <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                Keep campus operations simple, clear, and stress-free.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                SMART CAMPUS brings booking, maintenance, approvals, and updates
                into one place, so your team can spend less time chasing tasks
                and more time supporting students and staff.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/login?redirect=/dashboard"
                  className="inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Explore Platform
                </Link>
                <Link
                  to="/#features"
                  className="inline-flex rounded-full border border-cyan-500/35 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/50 hover:bg-slate-800"
                >
                  View core features
                </Link>
              </div>
            </div>

            <aside
              className="rounded-3xl border border-cyan-500/25 bg-slate-900/70 p-6 shadow-xl shadow-cyan-950/30 backdrop-blur-sm sm:p-8"
              aria-labelledby="hub-benefits-heading"
            >
              <h3
                id="hub-benefits-heading"
                className="font-heading text-lg font-semibold text-cyan-200"
              >
                One place, fewer handoffs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                This demo is front-end only—no server—but it shows how a real campus portal can
                feel when workflows are connected instead of scattered across email and forms.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-cyan-400" aria-hidden>
                    ●
                  </span>
                  <span>
                    <strong className="font-medium text-white">Shared context:</strong> bookings,
                    tickets, and approvals stay linked so nobody re-explains the same story.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-cyan-400" aria-hidden>
                    ●
                  </span>
                  <span>
                    <strong className="font-medium text-white">Role-aware views:</strong> students
                    see their world; operations and technicians see queues and assignments.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-cyan-400" aria-hidden>
                    ●
                  </span>
                  <span>
                    <strong className="font-medium text-white">Fewer follow-ups:</strong>{" "}
                    notifications nudge the right people when something changes—see{" "}
                    <Link to="/notifications#notifications" className="text-cyan-400 hover:text-cyan-300">
                      notifications
                    </Link>
                    .
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-cyan-500/15 pt-6">
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                >
                  Try signup →
                </Link>
                <Link
                  to="/#how-it-works"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-300"
                >
                  How it works ↓
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mb-10 max-w-2xl">
            <h3 className="font-heading text-3xl font-bold text-cyan-400">Core Features</h3>
            <p className="mt-3 text-slate-400">
              Everything your operations team needs to manage resources,
              requests, and service quality across campus.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.to}
                aria-label={feature.ariaLabel}
                className="group block rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              >
                <h4 className="font-heading text-lg font-semibold text-cyan-200 group-hover:text-cyan-100">
                  {feature.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
                <p className="mt-4 text-xs font-medium text-cyan-400/90 transition group-hover:text-cyan-300">
                  {feature.linkText ?? "Learn more →"}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-28 border-y border-cyan-500/10 bg-slate-900/50"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-12 max-w-2xl">
              <h3 className="font-heading text-3xl font-bold text-cyan-400">How it works</h3>
              <p className="mt-3 text-slate-400">
                Three simple stages from booking a space to closing the loop — designed for
                busy campus teams and students alike.
              </p>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              <li className="relative rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6 pt-10">
                <span className="absolute left-6 top-4 font-heading text-2xl font-bold text-cyan-500/40">
                  1
                </span>
                <h4 className="font-heading text-lg font-semibold text-white">Request and schedule</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Submit room or resource requests with time slots. Availability and conflicts
                  surface before anything is confirmed.
                </p>
              </li>
              <li className="relative rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6 pt-10">
                <span className="absolute left-6 top-4 font-heading text-2xl font-bold text-cyan-500/40">
                  2
                </span>
                <h4 className="font-heading text-lg font-semibold text-white">Approve and assign</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Staff review bookings; facilities and technicians pick up maintenance work
                  with clear ownership and priority.
                </p>
              </li>
              <li className="relative rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6 pt-10">
                <span className="absolute left-6 top-4 font-heading text-2xl font-bold text-cyan-500/40">
                  3
                </span>
                <h4 className="font-heading text-lg font-semibold text-white">Notify and complete</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Everyone gets updates in one channel until the booking is live or the ticket
                  is resolved — fewer follow-up emails.
                </p>
              </li>
            </ol>
            <p className="mt-10 text-sm text-slate-500">
              Want the full story?{" "}
              <Link to="/about" className="font-medium text-cyan-400 hover:text-cyan-300">
                Read about SMART CAMPUS
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="contact" className="bg-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
            <h3 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to make campus operations easier?
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Start with SMART CAMPUS to streamline bookings, maintenance, and
              communication across your university.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/login?redirect=/dashboard"
                className="inline-flex rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Launch Now
              </Link>
              <Link
                to="/contact"
                className="inline-flex rounded-full border border-cyan-400/50 px-7 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
              >
                Contact Team
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
