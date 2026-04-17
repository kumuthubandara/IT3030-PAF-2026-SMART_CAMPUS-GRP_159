import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import LecturerBookingsShell from "./features/bookings/components/lecturer/LecturerBookingsShell.jsx";

function isLecturerRole(role) {
  const r = String(role ?? "")
    .trim()
    .toLowerCase();
  return r === "lecturer";
}

export default function LecturerBookingsPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const tab = String(params.get("tab") || "all").trim() || "all";

  if (!user) {
    return <Navigate to="/login?redirect=/lecturer/bookings" replace />;
  }
  if (!isLecturerRole(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300/90">Lecturer · Bookings</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Resource bookings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Request lecture halls, computer labs, meeting rooms, and library workspaces. Track status and manage pending
          requests below. Equipment is handled from your dashboard Equipment tile.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-violet-400/50 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/facilities"
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
          >
            Facilities (read-only)
          </Link>
        </div>

        <div className="mt-10">
          <LecturerBookingsShell user={user} defaultTabId={tab} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
