import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const contactCards = [
  {
    title: "General enquiries",
    detail: "support@smartcampus.edu.lk",
    hint: "We usually reply within one business day.",
  },
  {
    title: "Phone",
    detail: "+94 11 234 5678",
    hint: "Weekdays, 8:30 AM – 5:00 PM.",
  },
  {
    title: "ITSD",
    detail: "Sri Lanka Institute of Information Technology, Malabe",
    hint: "Drop-in visits by appointment.",
  },
];

const quickHelpLinks = [
  { to: "/about", label: "About SMART CAMPUS", hint: "Scope, roles, and how the demo fits together." },
  { to: "/facilities", label: "Facilities", hint: "Browse spaces and booking categories." },
  { to: "/maintenance", label: "Maintenance", hint: "See how incidents and tickets are surfaced." },
  { to: "/login", label: "Sign in", hint: "Open the student, lecturer, or staff dashboards." },
];

const responseTimes = [
  { title: "General questions", detail: "Within 1 business day for email." },
  { title: "Access or login issues", detail: "Same day where possible on weekdays." },
  { title: "Demo & rollout planning", detail: "2–3 days to schedule a walkthrough." },
];

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
          <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                Contact us
              </p>
              <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                We are here to help
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
                Whether you need a demo, technical support, or a question about
                rolling out SMART CAMPUS on your campus, send us a message and we
                will point you in the right direction.
              </p>
              <p className="mt-5 text-sm font-medium tracking-wide text-slate-500">
                2026 April
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-5 sm:grid-cols-3">
              {contactCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm transition hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <h3 className="font-heading text-lg font-semibold text-cyan-200">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium text-white">{card.detail}</p>
                  <p className="mt-2 text-xs text-slate-400">{card.hint}</p>
                </article>
              ))}
            </div>

            <div className="mt-16 border-t border-cyan-500/10 pt-16">
              <div className="mx-auto max-w-3xl text-center">
                <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                  Quick help
                </h3>
                <p className="mt-3 text-sm text-slate-400 sm:text-base">
                  Many answers are already in the app—try these shortcuts before you email.
                </p>
              </div>
              <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickHelpLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/45 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <p className="font-heading text-sm font-semibold text-cyan-200 group-hover:text-cyan-100">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.hint}</p>
                    <span className="mt-3 inline-block text-xs font-medium text-cyan-400/90 group-hover:text-cyan-300">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 sm:p-8">
                <h3 className="font-heading text-lg font-semibold text-cyan-300">
                  What to include in your message
                </h3>
                <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-400">
                  <li>Your role on campus (student, lecturer, admin, technician).</li>
                  <li>Whether the problem is booking, maintenance, login, or something else.</li>
                  <li>Browser and approximate time if something failed in the demo.</li>
                  <li>Any reference codes or screenshots if you have them.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 sm:p-8">
                <h3 className="font-heading text-lg font-semibold text-cyan-300">
                  Typical response times
                </h3>
                <ul className="mt-4 space-y-4">
                  {responseTimes.map((row) => (
                    <li key={row.title} className="border-b border-slate-600/40 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-white">{row.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{row.detail}</p>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sri+Lanka+Institute+of+Information+Technology+Malabe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                >
                  Open campus in Google Maps →
                </a>
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-2xl">
              <h3 className="font-heading text-2xl font-bold text-cyan-400">
                Send a message
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Fill in the form below. This is a front-end demo only; connect it
                to your API or email service when you are ready.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <p className="font-semibold text-emerald-200">
                    Thank you, {form.name || "there"}.
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Your message has been recorded on this page. In a live app,
                    we would email you a confirmation next.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Back to home
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 sm:p-8"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="you@university.edu"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Phone <span className="text-slate-500">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="+94 …"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="e.g. Demo request"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="mt-2 w-full resize-y rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Tell us how we can help…"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:bg-cyan-300 sm:w-auto sm:px-10"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>
      <SiteFooter />
    </div>
  );
}
