import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Link, Navigate } from "react-router-dom";
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
const technicianFacilities = lecturerFacilities.filter(
  (facility) => facility.name.trim().toLowerCase() === "equipment",
).map((facility) => ({
  ...facility,
  description:
    "Maintenance and support equipment for technical operations, repairs, and campus service tasks.",
}));

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

const mainBuildingFloors = [
  { label: "Floor 3", detail: "Lecture halls A–C" },
  { label: "Floor 4", detail: "Lecture halls D–F" },
  { label: "Floor 5", detail: "Lecture halls G–I" },
  { label: "Floor 6", detail: "Lecture halls J–L" },
];

const newBuildingFloors = Array.from({ length: 12 }, (_, i) => {
  const level = i + 2;
  return {
    label: `Floor ${level}`,
    detail: "Smart classrooms, hybrid-ready rooms, and accessible circulation on this level.",
  };
});

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

const mainBuildingBlockTabs = [
  { label: "A block", detail: "North wing lecture halls — tiered seating and corridor access." },
  { label: "B block", detail: "South wing parallel rooms — hybrid-ready spaces and breakout areas." },
];

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

function normalizeBuildingName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function extractFloorNumber(floorLabel) {
  return String(floorLabel ?? "").replace("Floor ", "").trim();
}

function extractCodeFromResource(resource) {
  const nameMatch = String(resource?.name ?? "").match(/([A-Z]\d{3,4})/);
  if (nameMatch) return nameMatch[1];
  if (resource?.block && resource?.floor && resource?.hallNumber) {
    return `${String(resource.block).trim().charAt(0).toUpperCase()}${String(resource.floor).trim()}${String(
      Number(resource.hallNumber),
    ).padStart(2, "0")}`;
  }
  return null;
}

function getResourceKind(type) {
  const normalized = String(type ?? "").trim().toLowerCase();
  if (normalized === "lecture hall" || normalized === "lecture_hall") return "lecture";
  if (normalized === "computer lab" || normalized === "computer_lab") return "lab";
  if (normalized === "equipment" || normalized === "equipments") return "equipment";
  if (normalized === "meeting room" || normalized === "meeting_room") return "meeting";
  if (normalized === "library workspace" || normalized === "library_workspace") return "library";
  return "other";
}

function formatAvailableCount(count) {
  return `${count} available`;
}

function formatUnitCount(count, unit) {
  return `${count} ${unit}`;
}

function formatTimeValue(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const parts = text.split(":");
  if (parts.length < 2) return text;
  const hh = parts[0].padStart(2, "0");
  const mm = parts[1].padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatTimeRange(resource) {
  if (!resource?.availableFrom || !resource?.availableTo) return null;
  return `${formatTimeValue(resource.availableFrom)} - ${formatTimeValue(resource.availableTo)}`;
}

function canViewResourceForRole(resource, role) {
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  if (normalizedRole === "administrator" || normalizedRole === "admin") return true;

  const kind = getResourceKind(resource.type);
  const audience = String(resource.audience ?? "").trim().toLowerCase();

  if (normalizedRole === "technician" || normalizedRole === "tech") {
    if (kind !== "equipment") return false;
    return !audience || audience === "technician";
  }

  if (normalizedRole === "student") {
    if (kind !== "meeting" && kind !== "library") return false;
    return !audience || audience === "student";
  }

  if (normalizedRole === "lecturer") {
    if (kind === "lecture" || kind === "lab") return true;
    if (kind === "equipment") return !audience || audience === "lecturer";
    if (kind === "meeting" || kind === "library") return !audience || audience === "lecturer";
  }

  return true;
}

function getResourceDetailRows(resource) {
  const rows = [["Location", resource.location], ["Status", resource.status]];

  rows.push(["Capacity", getCapacityDisplayValue(resource)]);

  const availability = formatTimeRange(resource);
  if (availability) rows.push(["Availability", availability]);

  const kind = getResourceKind(resource.type);
  if (kind === "lab" && resource.hallNumber) {
    rows.push(["Lab Number", resource.hallNumber]);
  }
  if (kind === "library" && resource.workspaceNumber) {
    rows.push(["Workspace Number", resource.workspaceNumber]);
  }
  if (kind === "equipment" && resource.equipmentName) {
    rows.push(["Equipment Name", resource.equipmentName]);
  }

  return rows.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");
}

function getComparableCapacityValue(resource) {
  if (resource?.capacity != null && !Number.isNaN(Number(resource.capacity))) {
    return Number(resource.capacity);
  }
  if (resource?.minCapacity != null && !Number.isNaN(Number(resource.minCapacity))) {
    return Number(resource.minCapacity);
  }
  if (resource?.maxCapacity != null && !Number.isNaN(Number(resource.maxCapacity))) {
    return Number(resource.maxCapacity);
  }
  return null;
}

function getCapacityDisplayValue(resource) {
  if (resource?.capacity != null && !Number.isNaN(Number(resource.capacity))) {
    return String(resource.capacity);
  }
  if (resource?.minCapacity != null && resource?.maxCapacity != null) {
    return `${resource.minCapacity}-${resource.maxCapacity}`;
  }
  if (resource?.minCapacity != null) return String(resource.minCapacity);
  if (resource?.maxCapacity != null) return String(resource.maxCapacity);
  const kind = getResourceKind(resource?.type);
  if (kind === "meeting") {
    const audience = String(resource?.audience ?? "").trim().toLowerCase();
    if (audience === "student") return "5-8";
    if (audience === "lecturer") return "1-8";
  }
  return "N/A";
}

function getStatusMeta(status) {
  const normalized = String(status ?? "").trim().toUpperCase();
  if (normalized === "ACTIVE" || normalized === "AVAILABLE") {
    return {
      label: "Available",
      isBookable: true,
      badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
    };
  }
  return {
    label: "Out of Service",
    isBookable: false,
    badgeClass: "bg-red-500/15 text-red-300 border border-red-500/40",
  };
}

function getTypeFilterOptionsForRole(role) {
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  if (normalizedRole === "student") {
    return [
      { value: "", label: "All types" },
      { value: "meeting", label: "Meeting Room" },
      { value: "library", label: "Library Workspace" },
    ];
  }
  if (normalizedRole === "lecturer") {
    return [
      { value: "", label: "All types" },
      { value: "lecture", label: "Lecture Hall" },
      { value: "lab", label: "Computer Lab" },
      { value: "library", label: "Library Workspace" },
      { value: "meeting", label: "Meeting Room" },
      { value: "equipment", label: "Equipment" },
    ];
  }
  return [
    { value: "", label: "All types" },
    { value: "lecture", label: "Lecture Hall" },
    { value: "lab", label: "Computer Lab" },
    { value: "library", label: "Library Workspace" },
    { value: "meeting", label: "Meeting Room" },
    { value: "equipment", label: "Equipment" },
  ];
}

function getFacilityKindFromCardName(name) {
  const normalized = String(name ?? "").trim().toLowerCase();
  if (normalized === "lecture halls") return "lecture";
  if (normalized === "computer labs") return "lab";
  if (normalized === "meeting rooms") return "meeting";
  if (normalized === "library workspaces") return "library";
  if (normalized === "equipment") return "equipment";
  return "other";
}

function getRoleNotification(role) {
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  if (normalizedRole === "student") {
    return {
      title: "Student notice",
      message:
        "You can quickly check meeting rooms and library workspaces, then use View to open details before booking.",
    };
  }
  if (normalizedRole === "lecturer") {
    return {
      title: "Lecturer notice",
      message:
        "Use filters to find lecture halls, labs, meetings, and equipment faster. Active resources are ready for booking.",
    };
  }
  if (normalizedRole === "technician" || normalizedRole === "tech") {
    return {
      title: "Technician notice",
      message:
        "Monitor available equipment and open each item with View to check current status and availability window.",
    };
  }
  if (normalizedRole === "administrator" || normalizedRole === "admin") {
    return {
      title: "Administrator notice",
      message:
        "This page is for visibility and monitoring. Use filters to review resource status and usage readiness across facilities.",
    };
  }
  return {
    title: "Facilities notice",
    message: "Use filters to explore available resources and open previews for detailed information.",
  };
}

export default function FacilitiesPage() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login?redirect=/facilities" replace />;
  }
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
      : isTechnician
        ? technicianFacilities
        : isAdmin
        ? adminTechnicianFacilities
        : defaultFacilities;

  const canOpenDetailedFacilityCards = isLecturer || isAdmin || isTechnician;
  const isReadOnlyRole = isAdmin;

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
  const [statusFilter, setStatusFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const typeFilterOptions = getTypeFilterOptionsForRole(role);

  useEffect(() => {
    let active = true;

    async function loadResources() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"}/api/resources`);
        if (!res.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data = await res.json();
        if (!active) return;
        setApiResources(Array.isArray(data) ? data : []);
        setResourceError("");
      } catch (err) {
        console.error(err);
        if (!active) return;
        setResourceError("Could not load resources from backend");
      } finally {
        if (active) setLoadingResources(false);
      }
    }

    void loadResources();
    const intervalId = setInterval(() => {
      void loadResources();
    }, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
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

  const roomNumbers = [];

  const managedRoomNumbers =
    floorBlocksModalFloor && floorBlocksModalBuilding
      ? apiResources
          .filter((resource) => {
            const resourceType = String(resource.type ?? "").toLowerCase();
            const expectedType = facilitySpaceKind === "lab" ? "computer lab" : "lecture hall";
            if (resourceType !== expectedType) return false;

            const resourceBuilding = normalizeBuildingName(resource.building);
            const selectedBuilding = floorBlocksModalBuilding === "main" ? "main building" : "new building";
            if (resourceBuilding && resourceBuilding !== selectedBuilding) return false;

            const selectedFloor = extractFloorNumber(floorBlocksModalFloor);
            if (String(resource.floor ?? "").trim() !== selectedFloor) return false;

            const selectedBlockPrefix = activeFloorBlockTab.charAt(0).toUpperCase();
            if (String(resource.block ?? "").trim().toUpperCase() !== selectedBlockPrefix) return false;

            return true;
          })
          .map((resource) => {
            const code = extractCodeFromResource(resource);
            return code
              ? {
                  code,
                  label: resource.type,
                  managed: true,
                  resource,
                }
              : null;
          })
          .filter(Boolean)
      : [];

  const displayedRoomNumbers = [...managedRoomNumbers, ...roomNumbers].filter(
    (room, index, list) => list.findIndex((candidate) => candidate.code === room.code) === index,
  );

  const roleVisibleResources = apiResources.filter((resource) => canViewResourceForRole(resource, role));
  const roleVisibleEquipmentItems = roleVisibleResources.filter(
    (resource) => getResourceKind(resource.type) === "equipment",
  );
  const availableResources = roleVisibleResources.filter(
    (resource) => String(resource.status ?? "").trim().toUpperCase() === "ACTIVE",
  );
  const availableEquipmentResources = availableResources.filter(
    (resource) => getResourceKind(resource.type) === "equipment",
  );

  const resourceCounts = availableResources.reduce(
    (acc, resource) => {
      const kind = getResourceKind(resource.type);
      if (kind === "lecture") acc.lecture += 1;
      if (kind === "lab") acc.lab += 1;
      if (kind === "equipment") acc.equipment += 1;
      if (kind === "meeting") acc.meeting += 1;
      if (kind === "library") acc.library += 1;
      return acc;
    },
    { lecture: 0, lab: 0, equipment: 0, meeting: 0, library: 0 },
  );

  const facilityAvailabilityByName = {
    "lecture halls": formatAvailableCount(resourceCounts.lecture),
    "computer labs": formatAvailableCount(resourceCounts.lab),
    equipment: formatAvailableCount(resourceCounts.equipment),
    "meeting rooms": formatAvailableCount(resourceCounts.meeting),
    "library workspaces": formatAvailableCount(resourceCounts.library),
  };

  function getFacilityAvailabilityLabel(facilityName, fallback) {
    return facilityAvailabilityByName[String(facilityName ?? "").trim().toLowerCase()] ?? fallback;
  }

  function getFacilityPopupKey(facilityName) {
    const normalized = String(facilityName ?? "").trim().toLowerCase();
    if (normalized === "lecture halls") return "lecture-halls";
    if (normalized === "computer labs") return "computer-labs";
    if (normalized === "equipment") return "equipment";
    if (normalized === "meeting rooms") return "meeting-rooms";
    if (normalized === "library workspaces") return "library-workspaces";
    return null;
  }

  function openResourcePreview(resource) {
    const kind = getResourceKind(resource.type);
    if (kind === "meeting") {
      setOpenFacilityModal("meeting-rooms");
      return;
    }
    if (kind === "library") {
      setOpenFacilityModal("library-workspaces");
      return;
    }
    if (kind === "equipment") {
      setOpenFacilityModal("equipment");
      return;
    }
    if (kind === "lecture" || kind === "lab") {
      const isLab = kind === "lab";
      const buildingName =
        normalizeBuildingName(resource.building).includes("new") ? "New building" : "Main building";
      const buildingKey = buildingName === "New building" ? "new" : "main";
      const blockPrefix = String(resource.block ?? "").trim().toUpperCase();
      const blockLabel = `${blockPrefix || (buildingKey === "new" ? "F" : "A")} block`;
      const floorLabel = `Floor ${String(resource.floor ?? "").trim() || "3"}`;
      setOpenFacilityModal(isLab ? "computer-labs" : "lecture-halls");
      setActiveFacilityBuilding(buildingName);
      setFloorBlocksModalBuilding(buildingKey);
      setFloorBlocksModalFloor(floorLabel);
      setActiveFloorBlockTab(blockLabel);
    }
  }

  function getBuildingAvailabilityLabel(buildingName, spaceKind) {
    const normalizedBuilding = normalizeBuildingName(buildingName);
    const count = apiResources.filter((resource) => {
      const kind = getResourceKind(resource.type);
      if (spaceKind === "lecture" && kind !== "lecture") return false;
      if (spaceKind === "lab" && kind !== "lab") return false;
      return normalizeBuildingName(resource.building) === normalizedBuilding;
    }).length;
    return formatUnitCount(count, spaceKind === "lab" ? "labs" : "halls");
  }

  const selectedBlockResourceCount =
    floorBlocksModalFloor && floorBlocksModalBuilding
      ? apiResources.filter((resource) => {
          const kind = getResourceKind(resource.type);
          if (facilitySpaceKind === "lab" && kind !== "lab") return false;
          if (facilitySpaceKind === "lecture" && kind !== "lecture") return false;
          const selectedBuilding = floorBlocksModalBuilding === "main" ? "main building" : "new building";
          if (normalizeBuildingName(resource.building) !== selectedBuilding) return false;
          if (String(resource.floor ?? "").trim() !== extractFloorNumber(floorBlocksModalFloor)) return false;
          return (
            String(resource.block ?? "").trim().toUpperCase() === activeFloorBlockTab.charAt(0).toUpperCase()
          );
        }).length
      : 0;

  const filteredResources = apiResources.filter((resource) => {
    const kind = getResourceKind(resource.type);
    const matchesType = typeFilter ? kind === typeFilter : true;

    const matchesLocation =
      isStudent || !locationFilter
        ? true
        : resource.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const comparableCapacity = getComparableCapacityValue(resource);
    const matchesCapacity = capacityFilter
      ? comparableCapacity != null && comparableCapacity >= Number(capacityFilter)
      : true;

    const matchesStatus = statusFilter
      ? String(resource.status ?? "").trim().toLowerCase() === statusFilter.toLowerCase()
      : true;

    const normalizedBuilding = normalizeBuildingName(resource.building);
    const matchesBuilding = buildingFilter ? normalizedBuilding === buildingFilter : true;

    return matchesType && matchesLocation && matchesCapacity && matchesStatus && matchesBuilding;
  });

  const visibleResources = filteredResources.filter((resource) => canViewResourceForRole(resource, role));
  const meetingRoomResources = visibleResources.filter((resource) => getResourceKind(resource.type) === "meeting");
  const libraryWorkspaceResources = visibleResources.filter(
    (resource) => getResourceKind(resource.type) === "library",
  );
  const studentMeetingRoomResources = meetingRoomResources.filter(
    (resource) => String(resource.audience ?? "").trim().toLowerCase() === "student",
  );
  const lecturerMeetingRoomResources = meetingRoomResources.filter(
    (resource) => String(resource.audience ?? "").trim().toLowerCase() === "lecturer",
  );
  const studentLibraryWorkspaceResources = libraryWorkspaceResources.filter(
    (resource) => String(resource.audience ?? "").trim().toLowerCase() === "student",
  );
  const lecturerLibraryWorkspaceResources = libraryWorkspaceResources.filter(
    (resource) => String(resource.audience ?? "").trim().toLowerCase() === "lecturer",
  );
  const availableFacilityItems = visibleResources.map((resource) => ({
    id: resource.id,
    name: resource.name || resource.type || "Resource",
    resource,
  }));
  const hasAnyActiveFilter = Boolean(
    typeFilter || locationFilter || capacityFilter || statusFilter || buildingFilter,
  );
  const filteredKindCounts = visibleResources.reduce(
    (acc, resource) => {
      const kind = getResourceKind(resource.type);
      acc[kind] = (acc[kind] ?? 0) + 1;
      return acc;
    },
    { lecture: 0, lab: 0, meeting: 0, library: 0, equipment: 0 },
  );
  const displayedFacilities = hasAnyActiveFilter
    ? facilities.filter((facility) => {
        const kind = getFacilityKindFromCardName(facility.name);
        return (filteredKindCounts[kind] ?? 0) > 0;
      })
    : facilities;
  const roleNotification = getRoleNotification(role);
  const notificationItems = [
    {
      id: "role",
      tone: "info",
      title: roleNotification.title,
      message: roleNotification.message,
    },
    loadingResources
      ? {
          id: "loading",
          tone: "info",
          title: "Sync in progress",
          message: "Facility data is loading from the backend. Latest updates will appear shortly.",
        }
      : null,
    resourceError
      ? {
          id: "error",
          tone: "error",
          title: "Connection issue",
          message: resourceError,
        }
      : null,
    !loadingResources && !resourceError && visibleResources.length === 0
      ? {
          id: "empty",
          tone: "warn",
          title: "No facilities match",
          message: "No facilities match current filters. Try clearing filters to see all resources.",
        }
      : null,
  ].filter(Boolean);

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
          <div className="mb-6 grid gap-3">
            {notificationItems.map((notice) => (
              <article
                key={notice.id}
                className={`rounded-xl border px-4 py-3 ${
                  notice.tone === "error"
                    ? "border-red-500/35 bg-red-500/10"
                    : notice.tone === "warn"
                      ? "border-amber-500/35 bg-amber-500/10"
                      : "border-cyan-500/30 bg-cyan-500/10"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    notice.tone === "error"
                      ? "text-red-200"
                      : notice.tone === "warn"
                        ? "text-amber-200"
                        : "text-cyan-200"
                  }`}
                >
                  {notice.title}
                </p>
                <p className="mt-1 text-xs text-slate-200/90">{notice.message}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm">
            <h3 className="font-heading text-2xl font-semibold text-white">Search & Filter Resources</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {!isTechnician ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    {typeFilterOptions.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Capacity</label>
                <input
                  type="number"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              {(isLecturer || isStudent) && !isTechnician ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">All statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                  </select>
                </div>
              ) : null}

              {(isLecturer || isAdmin) && !isTechnician ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Building</label>
                  <select
                    value={buildingFilter}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">All buildings</option>
                    <option value="main building">Main Building</option>
                    <option value="new building">New Building</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("");
                  setLocationFilter("");
                  setCapacityFilter("");
                  setStatusFilter("");
                  setBuildingFilter("");
                }}
                className="rounded-full border border-cyan-500/40 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {displayedFacilities.map((facility) =>
              getFacilityPopupKey(facility.name) ? (
                <button
                  key={facility.name}
                  type="button"
                  onClick={() => {
                    const popupKey = getFacilityPopupKey(facility.name);
                    if (!popupKey) return;
                    setFloorBlocksModalFloor(null);
                    setFloorBlocksModalBuilding(null);
                    setActiveFacilityBuilding(
                      facility.name === "Computer labs"
                        ? computerLabBuildings[0].name
                        : lectureHallBuildings[0].name,
                    );
                    setOpenFacilityModal(popupKey);
                  }}
                  className="rounded-2xl border border-violet-500/25 bg-slate-900/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                >
                  <h3 className="font-heading text-xl font-semibold text-violet-200">{facility.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{facility.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-violet-300/90">
                    {getFacilityAvailabilityLabel(facility.name, facility.availability)}
                  </p>
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
                    {getFacilityAvailabilityLabel(facility.name, facility.availability)}
                  </p>
                </article>
              )
            )}
          </div>

          {isTechnician ? (
            <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm">
              <h3 className="font-heading text-xl font-semibold text-white">Available facilities</h3>
              <p className="mt-2 text-sm text-slate-400">
                Here are your available spaces. Click View to open and check each facility preview.
              </p>
              {loadingResources ? (
                <p className="mt-4 text-sm text-slate-400">Loading facilities...</p>
              ) : resourceError ? (
                <p className="mt-4 text-sm text-red-300">{resourceError}</p>
              ) : availableEquipmentResources.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No available facilities right now.</p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {availableEquipmentResources.map((item) => (
                    <article
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-cyan-200">
                        {item.equipmentName || item.name || "Equipment"}
                      </p>
                      <button
                        type="button"
                        onClick={() => openResourcePreview(item)}
                        className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {!isAdmin && !isTechnician ? (
            <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-sm">
              <h3 className="font-heading text-xl font-semibold text-white">Available facilities</h3>
              <p className="mt-2 text-sm text-slate-400">
                {isLecturer
                  ? "These facilities are updated automatically. Click View to quickly open each facility preview."
                  : isStudent
                    ? "Here are your available spaces. Click View to open and check each facility preview."
                    : "Facility names are updated automatically. Click View to open the relevant preview."}
              </p>
              {availableFacilityItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No available facilities found for current filters.</p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {availableFacilityItems.map((item) => (
                    <article
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-cyan-200">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => openResourcePreview(item.resource)}
                        className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {openFacilityModal ? (
            <>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl rounded-2xl border border-violet-500/25 bg-slate-900 shadow-2xl shadow-violet-900/40">
                  <div className="flex items-center justify-between border-b border-violet-500/20 px-5 py-4 sm:px-7">
                    <h3 className="font-heading text-2xl font-semibold text-white">
                      {openFacilityModal === "computer-labs"
                        ? "Computer labs"
                        : openFacilityModal === "meeting-rooms"
                          ? "Meeting rooms"
                          : openFacilityModal === "library-workspaces"
                            ? "Library workspaces"
                        : openFacilityModal === "equipment"
                          ? "Equipment Catalogue"
                          : "Lecture halls"}
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
                    {openFacilityModal === "equipment" ? (
                      <>
                        <p className="text-sm text-slate-400">
                          Browse equipment from the database.
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {roleVisibleEquipmentItems.length === 0 ? (
                            <p className="text-sm text-slate-400">
                              No equipments added yet.
                            </p>
                          ) : (
                            roleVisibleEquipmentItems.map((item) => (
                              <article
                                key={item.id}
                                className="rounded-xl border border-violet-500/25 bg-slate-950/70 p-5 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-heading text-lg font-semibold text-violet-200">
                                    {item.equipmentName || item.name || "Equipment"}
                                  </h4>
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                      getStatusMeta(item.status).badgeClass
                                    }`}
                                  >
                                    {getStatusMeta(item.status).label}
                                  </span>
                                </div>
                                <div className="mt-2 grid gap-1 text-xs text-slate-300">
                                  {getResourceDetailRows(item).map(([label, value]) => (
                                    <p key={`${item.id}-${label}`}>
                                      <span className="text-slate-400">{label}:</span> {String(value)}
                                    </p>
                                  ))}
                                </div>
                                {!isReadOnlyRole ? (
                                  <button
                                    type="button"
                                    disabled={!getStatusMeta(item.status).isBookable}
                                    className={`mt-4 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                      getStatusMeta(item.status).isBookable
                                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                                        : "cursor-not-allowed bg-slate-700 text-slate-400"
                                    }`}
                                  >
                                    Book Now
                                  </button>
                                ) : null}
                              </article>
                            ))
                          )}
                        </div>
                      </>
                    ) : openFacilityModal === "meeting-rooms" || openFacilityModal === "library-workspaces" ? (
                      <>
                        <p className="text-sm text-slate-400">
                          {openFacilityModal === "meeting-rooms"
                            ? "Browse added meeting rooms and their saved details."
                            : "Browse added library workspaces and their saved details."}
                        </p>
                        {isReadOnlyRole ? (
                          <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-xl border border-violet-500/20 bg-slate-950/60 p-4">
                              <h4 className="font-heading text-base font-semibold text-violet-200">
                                {openFacilityModal === "meeting-rooms"
                                  ? "Student meeting rooms"
                                  : "Student workspaces"}
                              </h4>
                              {(openFacilityModal === "meeting-rooms"
                                ? studentMeetingRoomResources
                                : studentLibraryWorkspaceResources
                              ).length === 0 ? (
                                <p className="mt-3 text-sm text-slate-400">
                                  {openFacilityModal === "meeting-rooms"
                                    ? "No student meeting rooms added yet."
                                    : "No student library workspaces added yet."}
                                </p>
                              ) : (
                                <div className="mt-4 grid gap-3">
                                  {(openFacilityModal === "meeting-rooms"
                                    ? studentMeetingRoomResources
                                    : studentLibraryWorkspaceResources
                                  ).map((item) => (
                                    <article
                                      key={item.id}
                                      className="rounded-xl border border-violet-500/25 bg-slate-950/70 p-4 shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <h5 className="font-heading text-base font-semibold text-violet-200">
                                          {item.name || item.type || "Resource"}
                                        </h5>
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                            getStatusMeta(item.status).badgeClass
                                          }`}
                                        >
                                          {getStatusMeta(item.status).label}
                                        </span>
                                      </div>
                                      <div className="mt-2 grid gap-1 text-xs text-slate-300">
                                        {getResourceDetailRows(item).map(([label, value]) => (
                                          <p key={`${item.id}-student-${label}`}>
                                            <span className="text-slate-400">{label}:</span> {String(value)}
                                          </p>
                                        ))}
                                      </div>
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>

                            <section className="rounded-xl border border-violet-500/20 bg-slate-950/60 p-4">
                              <h4 className="font-heading text-base font-semibold text-violet-200">
                                {openFacilityModal === "meeting-rooms"
                                  ? "Lecturer meeting rooms"
                                  : "Lecturer workspaces"}
                              </h4>
                              {(openFacilityModal === "meeting-rooms"
                                ? lecturerMeetingRoomResources
                                : lecturerLibraryWorkspaceResources
                              ).length === 0 ? (
                                <p className="mt-3 text-sm text-slate-400">
                                  {openFacilityModal === "meeting-rooms"
                                    ? "No lecturer meeting rooms added yet."
                                    : "No lecturer library workspaces added yet."}
                                </p>
                              ) : (
                                <div className="mt-4 grid gap-3">
                                  {(openFacilityModal === "meeting-rooms"
                                    ? lecturerMeetingRoomResources
                                    : lecturerLibraryWorkspaceResources
                                  ).map((item) => (
                                    <article
                                      key={item.id}
                                      className="rounded-xl border border-violet-500/25 bg-slate-950/70 p-4 shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <h5 className="font-heading text-base font-semibold text-violet-200">
                                          {item.name || item.type || "Resource"}
                                        </h5>
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                            getStatusMeta(item.status).badgeClass
                                          }`}
                                        >
                                          {getStatusMeta(item.status).label}
                                        </span>
                                      </div>
                                      <div className="mt-2 grid gap-1 text-xs text-slate-300">
                                        {getResourceDetailRows(item).map(([label, value]) => (
                                          <p key={`${item.id}-lecturer-${label}`}>
                                            <span className="text-slate-400">{label}:</span> {String(value)}
                                          </p>
                                        ))}
                                      </div>
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>
                          </div>
                        ) : (
                          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {(openFacilityModal === "meeting-rooms"
                              ? meetingRoomResources
                              : libraryWorkspaceResources
                            ).length === 0 ? (
                              <p className="text-sm text-slate-400">
                                {openFacilityModal === "meeting-rooms"
                                  ? "No meeting rooms added yet."
                                  : "No library workspaces added yet."}
                              </p>
                            ) : (
                              (openFacilityModal === "meeting-rooms"
                                ? meetingRoomResources
                                : libraryWorkspaceResources
                              ).map((item) => (
                                <article
                                  key={item.id}
                                  className="rounded-xl border border-violet-500/25 bg-slate-950/70 p-5 shadow-sm"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className="font-heading text-lg font-semibold text-violet-200">
                                      {item.name || item.type || "Resource"}
                                    </h4>
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                        getStatusMeta(item.status).badgeClass
                                      }`}
                                    >
                                      {getStatusMeta(item.status).label}
                                    </span>
                                  </div>
                                  <div className="mt-2 grid gap-1 text-xs text-slate-300">
                                    {getResourceDetailRows(item).map(([label, value]) => (
                                      <p key={`${item.id}-${label}`}>
                                        <span className="text-slate-400">{label}:</span> {String(value)}
                                      </p>
                                    ))}
                                  </div>
                                  {!isReadOnlyRole ? (
                                    <button
                                      type="button"
                                      disabled={!getStatusMeta(item.status).isBookable}
                                      className={`mt-4 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                        getStatusMeta(item.status).isBookable
                                          ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                                          : "cursor-not-allowed bg-slate-700 text-slate-400"
                                      }`}
                                    >
                                      Book Now
                                    </button>
                                  ) : null}
                                </article>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
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
                            {getBuildingAvailabilityLabel(selectedFacilityBuilding.name, facilitySpaceKind)}
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              {openFacilityModal !== "equipment" && floorBlocksModalFloor && floorBlocksModalBuilding ? (
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
                            {formatUnitCount(
                              selectedBlockResourceCount,
                              facilitySpaceKind === "lab" ? "labs" : "halls",
                            )}
                          </p>
                        </article>
                      ) : null}

                      {displayedRoomNumbers.length > 0 ? (
                        <div className="mt-5">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {facilitySpaceKind === "lab" ? "Lab Numbers" : "Lecture Hall Numbers"}
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                            {displayedRoomNumbers.map((room) => (
                              <div
                                key={room.code}
                                className="rounded-xl border border-violet-500/25 bg-slate-950/70 px-4 py-4 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-heading text-lg font-semibold text-violet-200">
                                    {room.code}
                                  </p>
                                  {room.resource ? (
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                        getStatusMeta(room.resource.status).badgeClass
                                      }`}
                                    >
                                      {getStatusMeta(room.resource.status).label}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{room.label}</p>
                                {room.resource ? (
                                  <div className="mt-2 grid gap-1 text-[11px] text-slate-300">
                                    {getResourceDetailRows(room.resource).map(([label, value]) => (
                                      <p key={`${room.code}-${label}`}>
                                        <span className="text-slate-400">{label}:</span> {String(value)}
                                      </p>
                                    ))}
                                  </div>
                                ) : null}
                                {!isReadOnlyRole && room.resource ? (
                                  <button
                                    type="button"
                                    disabled={!getStatusMeta(room.resource.status).isBookable}
                                    className={`mt-3 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                      getStatusMeta(room.resource.status).isBookable
                                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                                        : "cursor-not-allowed bg-slate-700 text-slate-400"
                                    }`}
                                  >
                                    Book Now
                                  </button>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-5 text-sm text-slate-400">
                          {facilitySpaceKind === "lab"
                            ? "No computer labs added yet."
                            : "No lecture halls added yet."}
                        </p>
                      )}
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