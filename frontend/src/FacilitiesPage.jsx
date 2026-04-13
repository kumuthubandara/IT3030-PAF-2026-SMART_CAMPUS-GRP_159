import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Default campus view for visitors and non-admin roles (e.g. technician). Admins use the `admin` variant—read-only, no booking. */
const defaultFacilities = [
  {
    name: "Lecture Halls",
    description: "Large-capacity halls for lectures, seminars, and guest sessions.",
    availability: "24 available",
  },
  {
    name: "Laboratories",
    description: "Specialized labs for computing, engineering, and science sessions.",
    availability: "12 available",
  },
  {
    name: "Meeting Rooms",
    description: "Small and medium rooms for department meetings and team reviews.",
    availability: "18 available",
  },
  {
    name: "Sports Facilities",
    description: "Indoor and outdoor spaces for training, events, and competitions.",
    availability: "8 available",
  },
];

/** Students only see spaces they are allowed to self-book in this demo. */
const studentFacilities = [
  {
    name: "Meeting rooms",
    description:
      "Small and medium rooms for group projects, society meet-ups, and supervised study sessions.",
    availability: "18 available",
  },
  {
    name: "Library workspaces",
    description: "Bookable desks, group study rooms, and quiet zones in the library building.",
    availability: "10 available",
  },
];

/** Lecturers only see bookable teaching and support resources relevant to their role. */
const lecturerFacilities = [
  {
    name: "Lecture halls",
    description:
      "Large-capacity halls for lectures, seminars, and assessments you can request for teaching.",
    availability: "24 available",
  },
  {
    name: "Meeting rooms",
    description: "Department and project meetings, vivas, and small-group sessions on campus.",
    availability: "18 available",
  },
  {
    name: "Computer labs",
    description: "Scheduled computing sessions, software images, and lab practicals.",
    availability: "12 available",
  },
  {
    name: "Library workspaces",
    description: "Bookable desks, group study rooms, and quiet zones in the library.",
    availability: "10 available",
  },
  {
    name: "Equipment",
    description: "Portable teaching kit—laptops, projectors, clickers, and lab loan bundles.",
    availability: "Catalog (demo)",
  },
];

export default function FacilitiesPage() {
  const { user } = useAuth();
  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  const isLecturer = role === "lecturer";
  const isStudent = role === "student";
  const isAdmin = role === "administrator" || role === "admin";

  const facilities = isLecturer
    ? lecturerFacilities
    : isStudent
      ? studentFacilities
      : defaultFacilities;

  const variant = isLecturer ? "lecturer" : isStudent ? "student" : isAdmin ? "admin" : "default";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Facilities
            </p>
            <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              {variant === "lecturer"
                ? "Teaching & support resources"
                : variant === "student"
                  ? "Your bookable spaces"
                  : variant === "admin"
                    ? "Campus facilities (reference)"
                    : "Manage campus spaces with confidence"}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              {variant === "lecturer" ? (
                <>
                  Signed in as a <strong className="text-violet-300">lecturer</strong>, you only see
                  lecture halls, meeting rooms, computer labs, library workspaces, and equipment—
                  the categories you can book for teaching and related work.
                </>
              ) : variant === "student" ? (
                <>
                  Signed in as a <strong className="text-emerald-300">student</strong>, you only see{" "}
                  <strong className="text-emerald-200">meeting rooms</strong> and{" "}
                  <strong className="text-emerald-200">library workspaces</strong>—the spaces enabled
                  for student self-booking in this demo.
                </>
              ) : variant === "admin" ? (
                <>
                  <strong className="text-amber-200">Administrators cannot book facilities</strong> in
                  this app—only <strong className="text-slate-200">students</strong> and{" "}
                  <strong className="text-slate-200">lecturers</strong> can place bookings. Below is a
                  read-only catalogue for oversight; use <strong className="text-slate-200">Manage Bookings</strong>{" "}
                  on your admin dashboard to approve or reject requests.
                </>
              ) : (
                <>
                  View available resources, track usage, and plan bookings across lecture halls,
                  labs, and shared university spaces.
                </>
              )}
            </p>
            {variant === "admin" ? (
              <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
                Booking is disabled for your role. Students and lecturers see their own bookable
                categories on this page when they sign in.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {facilities.map((facility) => (
              <article
                key={facility.name}
                className={`rounded-2xl border bg-slate-900/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  variant === "lecturer"
                    ? "border-violet-500/25 hover:border-violet-400/40 hover:shadow-violet-500/10"
                    : variant === "student"
                      ? "border-emerald-500/25 hover:border-emerald-400/40 hover:shadow-emerald-500/10"
                      : variant === "admin"
                        ? "border-amber-500/25 hover:border-amber-400/35 hover:shadow-amber-500/10"
                        : "border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-cyan-500/10"
                }`}
              >
                <h3
                  className={`font-heading text-xl font-semibold ${
                    variant === "lecturer"
                      ? "text-violet-200"
                      : variant === "student"
                        ? "text-emerald-200"
                        : variant === "admin"
                          ? "text-amber-100"
                          : "text-cyan-200"
                  }`}
                >
                  {facility.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{facility.description}</p>
                <p
                  className={`mt-4 text-xs font-semibold uppercase tracking-wide ${
                    variant === "lecturer"
                      ? "text-violet-300/90"
                      : variant === "student"
                        ? "text-emerald-300/90"
                        : variant === "admin"
                          ? "text-amber-200/90"
                          : "text-cyan-400"
                  }`}
                >
                  {variant === "admin" ? "Reference only · no booking" : facility.availability}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
