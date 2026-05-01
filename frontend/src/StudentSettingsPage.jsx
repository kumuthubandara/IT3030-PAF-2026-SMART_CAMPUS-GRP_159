/** Settings shell wrapping StudentSettingsForm. Route: /settings (all logged-in roles). */
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";

export default function StudentSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/90">
          SMART CAMPUS • ACCOUNT
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Signed in as <span className="text-slate-200">{user?.email}</span>
              {user?.role ? (
                <>
                  {" "}
                  · Role <span className="text-slate-300">{String(user.role)}</span>
                </>
              ) : null}
              . Notification toggles are saved to the server; account details reflect your current browser session.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/notifications"
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              Notifications
            </Link>
            <Link
              to="/dashboard"
              className="rounded-lg border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 shadow-lg sm:p-8">
          <StudentSettingsForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
