import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/** Default campus view for guests/other roles not covered by student/lecturer/admin/technician filters. */
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

/** Admin and technician see the union of lecturer + student facility sets. */
const adminTechnicianFacilities = [...lecturerFacilities, ...studentFacilities].filter(
  (facility, index, list) =>
    list.findIndex((item) => item.name.trim().toLowerCase() === facility.name.trim().toLowerCase()) ===
    index,
);

const lectureHallBuildings = [
  {
    name: "Main building",
    description: "Primary lecture complex with large-capacity halls and central access.",
    availability: "12 halls",
  },
  {
    name: "New building",
    description: "Modern lecture block with smart boards, hybrid classrooms, and accessibility support.",
    availability: "12 halls",
  },
];

/** Same Main / New layout as lecture halls, with lab-focused copy (computer labs popup). */
const computerLabBuildings = [
  {
    name: "Main building",
    description:
      "Teaching labs with standard software images, instructor podiums, and dual-monitor benches.",
    availability: "12 labs",
  },
  {
    name: "New building",
    description:
      "High-density lab clusters, virtualisation hosts, and hybrid-ready capture for practicals.",
    availability: "12 labs",
  },
];

/** Floors shown as cards when Main building is selected in the lecture halls popup. */
const mainBuildingFloors = [
  { label: "Floor 3", detail: "Lecture halls A–C" },
  { label: "Floor 4", detail: "Lecture halls D–F" },
  { label: "Floor 5", detail: "Lecture halls G–I" },
  { label: "Floor 6", detail: "Lecture halls J–L" },
];

/** New building: floors 2–13 (inclusive). */
const newBuildingFloors = Array.from({ length: 12 }, (_, i) => {
  const level = i + 2;
  return {
    label: `Floor ${level}`,
    detail: "Smart classrooms, hybrid-ready rooms, and accessible circulation on this level.",
  };
});

/** Main building floors for computer labs (same levels as lecture halls, lab wording). */
const labMainBuildingFloors = [
  { label: "Floor 3", detail: "Teaching labs and shared practical clusters." },
  { label: "Floor 4", detail: "Imaged workstations and software lab suites." },
  { label: "Floor 5", detail: "Project labs with bench power and network drops." },
  { label: "Floor 6", detail: "Capstone / project rooms with flexible layouts." },
];

const labNewBuildingFloors = newBuildingFloors.map((f) => ({
  ...f,
  detail: "Lab bays, storage for kit, and quick-deploy benches on this level.",
}));

/** Block tabs inside the floor-level popup for Main building. */
const mainBuildingBlockTabs = [
  { label: "A block", detail: "North wing lecture halls — tiered seating and corridor access." },
  { label: "B block", detail: "South wing parallel rooms — hybrid-ready spaces and breakout areas." },
];

/** Block tabs inside the floor-level popup for New building. */
const newBuildingBlockTabs = [
  { label: "F block", detail: "East stack — lecture theatres and collaboration bays." },
  { label: "G block", detail: "West stack — seminar suites and writable-wall classrooms." },
];

function floorBlockPanelCopy(floorLabel, blockLabel, buildingKey, spaceKind = "lecture") {
  const tabs = buildingKey === "new" ? newBuildingBlockTabs : mainBuildingBlockTabs;
  const tab = tabs.find((b) => b.label === blockLabel) ?? tabs[0];
  const isLab = spaceKind === "lab";
  const unit = isLab ? "labs" : "halls";
  const availability =
    buildingKey === "new" ? (isLab ? `4 ${unit}` : `5 ${unit}`) : `6 ${unit}`;

  return {
    title: tab.label,
    description: isLab
      ? `Computer lab · ${floorLabel} · ${tab.detail}`
      : `${floorLabel} · ${tab.detail}`,
    availability,
  };
}

function generateRoomNumbers(floorLabel, blockLabel, spaceKind = "lecture") {
  const floorNumber = floorLabel.replace("Floor ", "");
  const prefix = blockLabel.charAt(0).toUpperCase();

  return Array.from({ length: 4 }, (_, i) => {
    const roomCode = `${prefix}${floorNumber}${String(i + 1).padStart(2, "0")}`;
    return {
      code: roomCode,
      label: spaceKind === "lab" ? "Computer Lab" : "Lecture Hall",
    };
  });
}

export default function FacilitiesPage() {
  const { user } = useAuth();
  const role = String(user?.role ?? "")
    .trim()
    .toLowerCase();

  const isLecturer = role === "lecturer";
  const isStudent = role === "student";
  const isAdmin = role === "administrator" || role === "admin";
  const isTechnician = role === "technician" || role === "tech";

  const facilities = isLecturer
    ? lecturerFacilities
    : isStudent
      ? studentFacilities
      : isAdmin || isTechnician
        ? adminTechnicianFacilities
        : defaultFacilities;

  const canOpenDetailedFacilityCards = isLecturer || isAdmin || isTechnician;
  const isReadOnlyRole = isAdmin || isTechnician;

  const variant = isLecturer ? "lecturer" : isStudent ? "student" : isAdmin ? "admin" : "default";

  const [openFacilityModal, setOpenFacilityModal] = useState(null);
  const [activeFacilityBuilding, setActiveFacilityBuilding] = useState(lectureHallBuildings[0].name);
  const [floorBlocksModalFloor, setFloorBlocksModalFloor] = useState(null);
  const [floorBlocksModalBuilding, setFloorBlocksModalBuilding] = useState(null);
  const [activeFloorBlockTab, setActiveFloorBlockTab] = useState(mainBuildingBlockTabs[0].label);

  const [apiResources, setApiResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/api/resources")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch resources");
        }
        return res.json();
      })
      .then((data) => {
        setApiResources(data);
        setLoadingResources(false);
      })
      .catch((err) => {
        console.error(err);
        setResourceError("Could not load resources from backend");
        setLoadingResources(false);
      });
  }, []);

  const facilityBuildings =
    openFacilityModal === "computer-labs" ? computerLabBuildings : lectureHallBuildings;

  const selectedFacilityBuilding =
    facilityBuildings.find((building) => building.name === activeFacilityBuilding) ??
    facilityBuildings[0];

  const facilitySpaceKind = openFacilityModal === "computer-labs" ? "lab" : "lecture";
  const mainFloorsForModal = facilitySpaceKind === "lab" ? labMainBuildingFloors : mainBuildingFloors;
  const newFloorsForModal = facilitySpaceKind === "lab" ? labNewBuildingFloors : newBuildingFloors;

  const floorBlockPanel =
    floorBlocksModalFloor != null && floorBlocksModalBuilding != null
      ? floorBlockPanelCopy(
          floorBlocksModalFloor,
          activeFloorBlockTab,
          floorBlocksModalBuilding,
          facilitySpaceKind,
        )
      : null;

  const floorModalBlockTabs =
    floorBlocksModalBuilding === "new" ? newBuildingBlockTabs : mainBuildingBlockTabs;

  const roomNumbers =
    floorBlocksModalFloor && floorBlocksModalBuilding
      ? generateRoomNumbers(floorBlocksModalFloor, activeFloorBlockTab, facilitySpaceKind)
      : [];

  const filteredResources = apiResources.filter((resource) => {
    const matchesType = typeFilter
      ? resource.type?.toLowerCase().includes(typeFilter.toLowerCase())
      : true;

    const matchesLocation = locationFilter
      ? resource.location?.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesCapacity = capacityFilter
      ? Number(resource.capacity) >= Number(capacityFilter)
      : true;

    return matchesType && matchesLocation && matchesCapacity;
  });

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
                    ? "Facilities overview"
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
                  Read-only facilities catalogue for <strong className="text-slate-200">admin oversight</strong>.
                  Students and lecturers submit booking requests; admins review them from the
                  dashboard workflow.
                </>
              ) : (
                <>
                  View available resources, track usage, and plan bookings across lecture halls,
                  labs, and shared university spaces.
                </>
              )}
            </p>

            {variant === "admin" ? (
              <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  Open admin dashboard
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-slate-600/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
                >
                  Contact messages source
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {facilities.map((facility) =>
              canOpenDetailedFacilityCards &&
              (facility.name === "Lecture halls" || facility.name === "Computer labs") ? (
                <button
                  key={facility.name}
                  type="button"
                  onClick={() => {
                    setFloorBlocksModalFloor(null);
                    setFloorBlocksModalBuilding(null);
                    setActiveFacilityBuilding(
                      facility.name === "Computer labs"
                        ? computerLabBuildings[0].name
                        : lectureHallBuildings[0].name,
                    );
                    setOpenFacilityModal(
                      facility.name === "Computer labs" ? "computer-labs" : "lecture-halls",
                    );
                  }}
                  className="rounded-2xl border border-violet-500/25 bg-slate-900/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                >
                  <h3 className="font-heading text-xl font-semibold text-violet-200">{facility.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{facility.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-violet-300/90">
                    {isReadOnlyRole ? "Reference only · no booking" : facility.availability}
                  </p>
                  <p className="mt-2 text-xs font-medium text-violet-300">Open popup →</p>
                </button>
              ) : (
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
                            ? "text-cyan-200"
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
                            ? "text-cyan-400"
                            : "text-cyan-400"
                    }`}
                  >
                    {isReadOnlyRole ? "Reference only · no booking" : facility.availability}
                  </p>
                </article>
              )
            )}
          </div>

          <div className="mt-12 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm">
            <h3 className="font-heading text-2xl font-semibold text-white">Search & Filter Resources</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Type</label>
                <input
                  type="text"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  placeholder="e.g. LAB / ROOM / EQUIPMENT"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="e.g. Building A"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Minimum Capacity</label>
                <input
                  type="number"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("");
                  setLocationFilter("");
                  setCapacityFilter("");
                }}
                className="rounded-full border border-cyan-500/40 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-heading text-2xl font-semibold text-white">
              Available Resources from Database
            </h3>

            {loadingResources && (
              <p className="mt-4 text-sm text-slate-400">Loading resources...</p>
            )}

            {resourceError && (
              <p className="mt-4 text-sm text-red-400">{resourceError}</p>
            )}

            {!loadingResources && !resourceError && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/10"
                    >
                      <h4 className="font-heading text-xl font-semibold text-cyan-200">
                        {resource.name}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        Type: {resource.type}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Capacity: {resource.capacity ?? "N/A"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Location: {resource.location}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Available: {resource.availableFrom ?? "N/A"} - {resource.availableTo ?? "N/A"}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-400">
                        {resource.status}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No matching resources found.</p>
                )}
              </div>
            )}
          </div>

          {openFacilityModal ? (
            <>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl rounded-2xl border border-violet-500/25 bg-slate-900 shadow-2xl shadow-violet-900/40">
                  <div className="flex items-center justify-between border-b border-violet-500/20 px-5 py-4 sm:px-7">
                    <h3 className="font-heading text-2xl font-semibold text-white">
                      {openFacilityModal === "computer-labs" ? "Computer labs" : "Lecture halls"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setFloorBlocksModalFloor(null);
                        setFloorBlocksModalBuilding(null);
                        setOpenFacilityModal(null);
                      }}
                      className="rounded-full border border-violet-500/30 px-3 py-1 text-sm font-semibold text-violet-200 transition hover:border-violet-400/60 hover:text-violet-100"
                    >
                      Close
                    </button>
                  </div>

                  <div className="px-5 py-5 sm:px-7 sm:py-6">
                    <p className="text-sm text-slate-400">
                      {isReadOnlyRole
                        ? openFacilityModal === "computer-labs"
                          ? "Read-only view for admins and technicians. Computer labs cannot be booked from this page."
                          : "Read-only view for admins and technicians. Lecture halls cannot be booked from this page."
                        : openFacilityModal === "computer-labs"
                          ? "Select a building to view computer lab availability for booking."
                          : "Select a building to view lecture hall availability for booking."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {facilityBuildings.map((building) => {
                        const isActive = building.name === activeFacilityBuilding;
                        return (
                          <button
                            key={building.name}
                            type="button"
                            onClick={() => {
                              setActiveFacilityBuilding(building.name);
                              setFloorBlocksModalFloor(null);
                              setFloorBlocksModalBuilding(null);
                            }}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              isActive
                                ? "border-violet-300/70 bg-violet-500/20 text-violet-100"
                                : "border-violet-500/30 text-violet-300 hover:border-violet-400/50 hover:text-violet-200"
                            }`}
                          >
                            {building.name}
                          </button>
                        );
                      })}
                    </div>

                    <article className="mt-5 rounded-xl border border-violet-500/20 bg-slate-950/70 p-6 shadow-sm">
                      <h4 className="font-heading text-lg font-semibold text-violet-200">
                        {selectedFacilityBuilding.name}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {selectedFacilityBuilding.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-violet-300/90">
                        {selectedFacilityBuilding.availability}
                      </p>

                      {activeFacilityBuilding === "Main building" ? (
                        <div className="mt-6">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Floors
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {mainFloorsForModal.map((floor) => (
                              <button
                                key={floor.label}
                                type="button"
                                onClick={() => {
                                  setFloorBlocksModalBuilding("main");
                                  setActiveFloorBlockTab(mainBuildingBlockTabs[0].label);
                                  setFloorBlocksModalFloor(floor.label);
                                }}
                                className="rounded-xl border border-violet-500/25 bg-slate-900/90 px-4 py-4 text-left shadow-sm transition hover:border-violet-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                              >
                                <p className="font-heading text-base font-semibold text-white">
                                  {floor.label}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">{floor.detail}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : activeFacilityBuilding === "New building" ? (
                        <div className="mt-6">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Floors (2–13)
                          </p>
                          <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {newFloorsForModal.map((floor) => (
                              <button
                                key={floor.label}
                                type="button"
                                onClick={() => {
                                  setFloorBlocksModalBuilding("new");
                                  setActiveFloorBlockTab(newBuildingBlockTabs[0].label);
                                  setFloorBlocksModalFloor(floor.label);
                                }}
                                className="rounded-xl border border-violet-500/25 bg-slate-900/90 px-4 py-4 text-left shadow-sm transition hover:border-violet-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                              >
                                <p className="font-heading text-base font-semibold text-white">
                                  {floor.label}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-400">{floor.detail}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  </div>
                </div>
              </div>

              {floorBlocksModalFloor && floorBlocksModalBuilding ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-4xl rounded-2xl border border-violet-500/25 bg-slate-900 shadow-2xl shadow-violet-900/40">
                    <div className="flex items-center justify-between border-b border-violet-500/20 px-5 py-4 sm:px-7">
                      <h3 className="font-heading text-2xl font-semibold text-white">{floorBlocksModalFloor}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setFloorBlocksModalFloor(null);
                          setFloorBlocksModalBuilding(null);
                        }}
                        className="rounded-full border border-violet-500/30 px-3 py-1 text-sm font-semibold text-violet-200 transition hover:border-violet-400/60 hover:text-violet-100"
                      >
                        Close
                      </button>
                    </div>

                    <div className="px-5 py-5 sm:px-7 sm:py-6">
                      <p className="text-sm text-slate-400">
                        {isReadOnlyRole
                          ? openFacilityModal === "computer-labs"
                            ? "Read-only details for computer labs. Booking is disabled for admins and technicians."
                            : "Read-only details for lecture halls. Booking is disabled for admins and technicians."
                          : openFacilityModal === "computer-labs"
                            ? "Select a block to view computer lab availability for booking."
                            : "Select a block to view lecture hall availability for booking."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {floorModalBlockTabs.map((block) => {
                          const isActive = block.label === activeFloorBlockTab;
                          return (
                            <button
                              key={block.label}
                              type="button"
                              onClick={() => setActiveFloorBlockTab(block.label)}
                              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                isActive
                                  ? "border-violet-300/70 bg-violet-500/20 text-violet-100"
                                  : "border-violet-500/30 text-violet-300 hover:border-violet-400/50 hover:text-violet-200"
                              }`}
                            >
                              {block.label}
                            </button>
                          );
                        })}
                      </div>

                      {floorBlockPanel ? (
                        <article className="mt-5 rounded-xl border border-violet-500/20 bg-slate-950/70 p-6 shadow-sm">
                          <h4 className="font-heading text-lg font-semibold text-violet-200">
                            {floorBlockPanel.title}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-slate-400">{floorBlockPanel.description}</p>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-violet-300/90">
                            {floorBlockPanel.availability}
                          </p>
                        </article>
                      ) : null}

                      {roomNumbers.length > 0 ? (
                        <div className="mt-5">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {facilitySpaceKind === "lab" ? "Lab Numbers" : "Lecture Hall Numbers"}
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                            {roomNumbers.map((room) => (
                              <div
                                key={room.code}
                                className="rounded-xl border border-violet-500/25 bg-slate-950/70 px-4 py-4 shadow-sm"
                              >
                                <p className="font-heading text-lg font-semibold text-violet-200">
                                  {room.code}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">{room.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}