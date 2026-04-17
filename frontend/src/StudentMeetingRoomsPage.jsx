import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentBookingsShell from "./features/bookings/components/student/StudentBookingsShell.jsx";

export default function StudentMeetingRoomsPage() {
  const { user } = useAuth();
  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();

  if (!user) {
    return <Navigate to="/login?redirect=/student/meeting-rooms" replace />;
  }
  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/90">Student · Bookings</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Book a resource</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Request <strong className="text-slate-200">meeting rooms</strong> and{" "}
          <strong className="text-slate-200">library workspaces</strong> marked for student use — the same visibility as
          on <strong className="text-slate-200">Facilities</strong>. On the dashboard,{" "}
          <strong className="text-slate-200">My Booking</strong> on the dashboard lists only meeting-room and library-workspace
          bookings. <strong className="text-slate-200">My bookings</strong> below shows your full account history.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/facilities"
            className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
          >
            All facilities
          </Link>
        </div>

        <div className="mt-10">
          <StudentBookingsShell user={user} defaultTabId="all" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
