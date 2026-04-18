import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const values = [
  {
    title: "Clarity first",
    text: "We design screens and flows so staff and students know what to do next, without jargon or clutter.",
  },
  {
    title: "Trust & accountability",
    text: "Bookings, tickets, and approvals leave a clear trail so teams can resolve issues with confidence.",
  },
  {
    title: "Built for real campuses",
    text: "From labs and halls to maintenance crews, SMART CAMPUS reflects how universities actually run day to day.",
  },
  {
    title: "Always improving",
    text: "We listen to feedback from admins and technicians and keep refining the experience.",
  },
];

/** UI: AboutUsPage. */
export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
          <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                About us
              </p>
              <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                Supporting universities behind the scenes
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
                SMART CAMPUS exists to make campus operations calmer and more
                predictable. We help teams manage spaces, assets, and maintenance
                in one place, so students and staff get the service they expect.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <h3 className="font-heading text-2xl font-bold text-cyan-400 sm:text-3xl">
                  Our mission
                </h3>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Universities juggle countless moving parts: timetables, shared
                  rooms, broken equipment, and urgent fixes. Our mission is to
                  give operations teams a single, dependable hub where requests
                  are easy to submit, easy to track, and easy to close out, with
                  everyone kept in the loop.
                </p>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  We believe good software should feel invisible when it works:
                  fewer phone calls, fewer spreadsheets, and less guesswork about
                  who is doing what.
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-lg sm:p-8">
                <h3 className="font-heading text-xl font-bold text-cyan-200">
                  Who we serve
                </h3>
                <ul className="mt-4 space-y-3 text-slate-400">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span>
                      <strong className="text-white">Students & staff</strong>{" "}
                      who need simple booking and clear status on their requests.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span>
                      <strong className="text-white">Administrators</strong> who
                      coordinate approvals, policies, and campus-wide visibility.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span>
                      <strong className="text-white">Technicians</strong> who
                      need prioritized tickets, context, and updates in the field.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-y border-cyan-500/10 bg-slate-900/50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <h3 className="font-heading text-center text-2xl font-bold text-cyan-400 sm:text-3xl">
                What we stand for
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-center text-slate-300">
                Principles that guide how we build SMART CAMPUS for your
                institution.
              </p>
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {values.map((v) => (
                  <article
                    key={v.title}
                    className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <h4 className="font-heading text-lg font-semibold text-cyan-200">
                      {v.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {v.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-cyan-500/10 bg-slate-950 px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
            <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Want to know more?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Head back to the homepage to explore features or get in touch with
              the team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="inline-flex rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Back to Home
              </Link>
              <Link
                to="/contact"
                className="inline-flex rounded-full border border-cyan-400/50 px-7 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
              >
                Contact
              </Link>
            </div>
          </section>
        </main>
      <SiteFooter />
    </div>
  );
}
