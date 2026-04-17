import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const topics = [
  {
    title: "Report an issue",
    description:
      "Log faulty equipment, HVAC problems, lighting, or access issues so the facilities team can triage and assign work.",
    image:
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Track requests",
    description:
      "Follow the status of tickets you have submitted once the maintenance API is connected to SMART CAMPUS.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Emergency",
    description:
      "For urgent safety hazards, use your campus emergency line or security desk. This portal is for routine maintenance.",
    image:
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function MaintenancePage() {
  const fallbackImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='400'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='%230b1220'/><stop offset='100%' stop-color='%2316485f'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='52%' fill='%23a5f3fc' font-family='Arial' font-size='40' text-anchor='middle'>Smart Campus Maintenance</text></svg>";
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
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
              item.title === "Report an issue" || item.title === "Emergency" ? (
                <Link
                  key={item.title}
                  to={item.title === "Emergency" ? "/student/maintenance" : "/tickets"}
                  className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/80 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-cyan-200">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
                  </div>
                </Link>
              ) : (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/80 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-cyan-200">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
                  </div>
                </article>
              )
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
              to="/tickets"
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
