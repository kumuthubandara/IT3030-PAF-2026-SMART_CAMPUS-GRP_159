import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
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
const CONTACT_MESSAGES_KEY = "smart-campus-contact-messages";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function readContactMessages() {
  try {
    const raw = sessionStorage.getItem(CONTACT_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    sessionStorage.removeItem(CONTACT_MESSAGES_KEY);
    return [];
  }
}

function validateForm(values) {
  const errors = {};

  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = "Name can contain letters and spaces only.";
  } else if (name.length < 3) {
    errors.name = "Name should be at least 3 characters long.";
  } else if (name.length > 50) {
    errors.name = "Name should not exceed 50 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?\d+$/.test(phone)) {
    errors.phone = "Phone number must contain digits only, with optional + at the beginning.";
  } else {
    const localPattern = /^\d{10}$/;
    const internationalPattern = /^\+[1-9]\d{7,14}$/;
    if (!localPattern.test(phone) && !internationalPattern.test(phone)) {
      errors.phone =
        "Phone number must be 10 digits (local) or a valid international format starting with +.";
    }
  }

  if (subject.length < 5) {
    errors.subject = "Subject should be at least 5 characters long.";
  }

  if (message.length < 15) {
    errors.message = "Message should be at least 15 characters long.";
  }

  return errors;
}

export default function ContactUsPage() {
  const { user } = useAuth();
  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  const isBlockedRole = role === "administrator" || role === "admin" || role === "technician" || role === "tech";
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
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
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isBlockedRole) {
      setErrors((prev) => ({
        ...prev,
        form: "Administrators and technicians cannot send contact messages.",
      }));
      return;
    }
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to save contact message.");
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: "Could not send to backend. Ensure the backend is running and try again.",
      }));
      return;
    }
    const existing = readContactMessages();
    const localPayload = {
      id: `msg-${Date.now()}`,
      ...payload,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify([localPayload, ...existing]));
    setErrors({});
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
              {isBlockedRole ? (
                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
                  Administrators and technicians cannot send contact messages. Only students,
                  lecturers, or guests (not logged in) can send this form.
                </p>
              ) : null}

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
                  noValidate
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
                      aria-invalid={Boolean(errors.name)}
                      className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Your full name"
                    />
                    {errors.name ? (
                      <p className="mt-2 text-xs text-red-300">{errors.name}</p>
                    ) : null}
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
                        aria-invalid={Boolean(errors.email)}
                        className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="you@university.edu"
                      />
                      {errors.email ? (
                        <p className="mt-2 text-xs text-red-300">{errors.email}</p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-slate-200"
                      >
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.phone)}
                        className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="+94 …"
                      />
                      {errors.phone ? (
                        <p className="mt-2 text-xs text-red-300">{errors.phone}</p>
                      ) : null}
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
                      aria-invalid={Boolean(errors.subject)}
                      className="mt-2 w-full rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="e.g. Demo request"
                    />
                    {errors.subject ? (
                      <p className="mt-2 text-xs text-red-300">{errors.subject}</p>
                    ) : null}
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
                      aria-invalid={Boolean(errors.message)}
                      className="mt-2 w-full resize-y rounded-xl border border-slate-500/50 bg-slate-800/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Tell us how we can help…"
                    />
                    {errors.message ? (
                      <p className="mt-2 text-xs text-red-300">{errors.message}</p>
                    ) : null}
                  </div>
                  {errors.form ? <p className="text-xs text-red-300">{errors.form}</p> : null}
                  <div
                    className={`flex w-full items-center gap-3 ${
                      !user ? "justify-between" : "justify-start"
                    }`}
                  >
                    {!user ? (
                      <Link
                        to="/login?redirect=/contact"
                        className="inline-flex justify-center rounded-full border border-cyan-400/50 px-6 py-3.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                      >
                        Login
                      </Link>
                    ) : null}
                    <button
                      type="submit"
                      disabled={isBlockedRole}
                      className={`rounded-full bg-cyan-400 px-10 py-3.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none ${
                        !user ? "ml-auto" : ""
                      }`}
                    >
                      Send message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </main>
      <SiteFooter />
    </div>
  );
}
