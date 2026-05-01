import { useEffect, useState } from "react";
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

export default function StudentSettingsForm() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-cyan-300">Notification preferences</h3>
        <p className="mt-2 text-xs text-slate-500">
          Choose which Smart Campus notifications are created for your account (assignment innovation:
          category opt-in). Turning off a category stops{" "}
          <strong className="text-slate-400">new</strong> notifications of that type — existing items stay
          in your inbox.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
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
      </div>

      <div>
        <h3 className="text-sm font-semibold text-cyan-300">Security</h3>
        <p className="mt-2 text-sm text-slate-400">
          Password change and two-factor authentication can be wired to your identity provider in a future
          iteration.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Change password
          </button>
        </div>
      </div>
    </div>
  );
}
