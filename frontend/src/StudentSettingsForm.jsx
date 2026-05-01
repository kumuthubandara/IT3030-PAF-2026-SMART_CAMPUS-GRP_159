/**
 * Account summary + notification preference toggles (GET/PATCH /api/notification-preferences).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiGet, apiPatch } from "./api";

const PREFS_KEYS = [
  {
    key: "bookingUpdates",
    title: "Booking decisions",
    description: "When an administrator approves or rejects your facility booking requests.",
  },
  {
    key: "ticketStatusUpdates",
    title: "Ticket status",
    description: "When maintenance ticket status changes (e.g. open → in progress → resolved).",
  },
  {
    key: "ticketCommentUpdates",
    title: "Ticket comments",
    description: "When someone comments on a ticket you reported or when staff reply to your ticket.",
  },
  {
    key: "accountUpdates",
    title: "Account & role updates",
    description: "Account approval, role changes, and similar administrative updates.",
  },
];

function formatSignInMethod(provider) {
  const s = String(provider ?? "local").toLowerCase();
  if (s === "google") return "Google";
  if (s === "microsoft") return "Microsoft";
  return "Email & password";
}

function formatRoleLabel(role) {
  return String(role ?? "student")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StudentSettingsForm() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const headers = {
      "X-User-Email": user.email,
      "X-User-Role": String(user.role || "student").toUpperCase(),
    };
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiGet("/api/notification-preferences", headers);
        if (!cancelled) setPrefs(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load notification preferences.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!saveOk) return;
    const t = window.setTimeout(() => setSaveOk(false), 2500);
    return () => window.clearTimeout(t);
  }, [saveOk]);

  async function savePrefs(next) {
    const headers = {
      "X-User-Email": user.email,
      "X-User-Role": String(user.role || "student").toUpperCase(),
    };
    try {
      setSaving(true);
      setError("");
      const data = await apiPatch("/api/notification-preferences", headers, next);
      setPrefs(data);
      setSaveOk(true);
    } catch (e) {
      setError(e?.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void savePrefs(next);
  }

  const accountPending =
    String(user?.accountStatus ?? "active").toLowerCase() === "pending";

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-600/40 bg-slate-950/40 p-5">
        <h3 className="text-sm font-semibold text-cyan-300">Account</h3>
        <p className="mt-1 text-xs text-slate-500">
          Read-only summary from your current session. Updates when you sign in again after admin changes.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-0.5 font-medium text-slate-100">{user?.name || "—"}</dd>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-0.5 font-medium text-slate-100">{user?.email || "—"}</dd>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Role</dt>
            <dd className="mt-0.5 font-medium text-slate-100">{formatRoleLabel(user?.role)}</dd>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Sign-in method</dt>
            <dd className="mt-0.5 font-medium text-slate-100">
              {formatSignInMethod(user?.authProvider)}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Account status</dt>
            <dd className="mt-0.5">
              {accountPending ? (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                  Pending approval
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                  Active
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-cyan-300">Notification preferences</h3>
          <Link
            to="/notifications"
            className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Open notification inbox →
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Choose which automated notifications are stored for your account. Turning off a category stops{" "}
          <strong className="text-slate-400">new</strong> notifications of that type; existing items remain in
          your inbox.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {saveOk ? (
          <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            Preferences saved.
          </p>
        ) : null}
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading preferences…</p>
        ) : prefs ? (
          <ul className="mt-4 space-y-4">
            {PREFS_KEYS.map(({ key, title, description }) => (
              <li
                key={key}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-600/50 bg-slate-950/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <span className="sr-only">{title}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(prefs[key])}
                    disabled={saving}
                    onChange={() => toggle(key)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 disabled:opacity-50"
                  />
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Sign in to manage preferences.</p>
        )}
        {saving ? <p className="mt-2 text-xs text-cyan-400/90">Saving…</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-600/40 bg-slate-950/40 p-5">
        <h3 className="text-sm font-semibold text-cyan-300">Security</h3>
        <p className="mt-2 text-sm text-slate-400">
          {String(user?.authProvider ?? "local").toLowerCase() === "local" ? (
            <>
              You use a <strong className="text-slate-300">campus password</strong>. To change it, an
              administrator can reset your account or you can use a future password-change API when enabled.
            </>
          ) : (
            <>
              You sign in with <strong className="text-slate-300">{formatSignInMethod(user?.authProvider)}</strong>
              . Password and two-factor settings are managed in your Google or Microsoft account.
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            Sign-in help
          </Link>
        </div>
      </section>
    </div>
  );
}
