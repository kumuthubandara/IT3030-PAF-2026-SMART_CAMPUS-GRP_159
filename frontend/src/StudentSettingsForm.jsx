export default function StudentSettingsForm() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-cyan-300">Notifications</h3>
        <ul className="mt-4 space-y-4">
          <li className="flex items-start justify-between gap-4 rounded-xl border border-slate-600/50 bg-slate-950/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Booking confirmations</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Email when a reservation is approved or changed.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="sr-only">Booking confirmations email</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40"
              />
            </label>
          </li>
          <li className="flex items-start justify-between gap-4 rounded-xl border border-slate-600/50 bg-slate-950/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Maintenance updates</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Alerts for tickets you reported or follow.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="sr-only">Maintenance updates email</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40"
              />
            </label>
          </li>
          <li className="flex items-start justify-between gap-4 rounded-xl border border-slate-600/50 bg-slate-950/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Campus announcements</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Important notices from administration.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <span className="sr-only">Campus announcements</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40"
              />
            </label>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-cyan-300">Preferences</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-lang"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Language
            </label>
            <select
              id="settings-lang"
              defaultValue="en"
              className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="settings-tz"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Time zone
            </label>
            <select
              id="settings-tz"
              defaultValue="Asia/Colombo"
              className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-cyan-500/30 focus:ring-2"
            >
              <option value="Asia/Colombo">Asia/Colombo (SLST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-cyan-300">Security</h3>
        <p className="mt-2 text-sm text-slate-400">
          Password and two-factor authentication will use your identity provider once
          connected.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-500"
            title="Connect API to enable"
          >
            Change password
          </button>
          <button
            type="button"
            disabled
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-500"
            title="Connect API to enable"
          >
            Set up 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
