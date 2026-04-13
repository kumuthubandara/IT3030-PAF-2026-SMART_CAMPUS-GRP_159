import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const topics = [
  {
    title: "Report an issue",
    description:
      "Log faulty equipment, HVAC problems, lighting, or access issues so the facilities team can triage and assign work.",
  },
  {
    title: "Track requests",
    description:
      "Follow the status of tickets you have submitted once the maintenance API is connected to SMART CAMPUS.",
  },
  {
    title: "Emergency",
    description:
      "For urgent safety hazards, use your campus emergency line or security desk. This portal is for routine maintenance.",
  },
];

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
              Maintenance
            </p>
            <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              Keep the campus running smoothly
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Report facility issues, follow up on repairs, and help your team prioritise work
              across buildings and shared spaces.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {topics.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <h3 className="font-heading text-lg font-semibold text-cyan-200">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/50 p-10 text-center">
            <p className="text-sm text-slate-400">
              Maintenance ticketing will appear here when your backend is wired. Students can
              also use the{" "}
              <Link to="/dashboard" className="font-medium text-cyan-400 underline-offset-2 hover:underline">
                dashboard
              </Link>{" "}
              for quick access after sign-in.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:bg-cyan-300"
            >
              Contact support
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
