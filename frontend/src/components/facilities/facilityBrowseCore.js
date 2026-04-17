/** Shared building / floor / block model + resource helpers for Facilities and student booking browser. */

export const lectureHallBuildings = [
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

export const computerLabBuildings = [
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

export const mainBuildingFloors = [
  { label: "Floor 3", detail: "Lecture halls A–C" },
  { label: "Floor 4", detail: "Lecture halls D–F" },
  { label: "Floor 5", detail: "Lecture halls G–I" },
  { label: "Floor 6", detail: "Lecture halls J–L" },
];

export const newBuildingFloors = Array.from({ length: 12 }, (_, i) => {
  const level = i + 2;
  return {
    label: `Floor ${level}`,
    detail: "Smart classrooms, hybrid-ready rooms, and accessible circulation on this level.",
  };
});

export const labMainBuildingFloors = [
  { label: "Floor 3", detail: "Teaching labs and shared practical clusters." },
  { label: "Floor 4", detail: "Imaged workstations and software lab suites." },
  { label: "Floor 5", detail: "Project labs with bench power and network drops." },
  { label: "Floor 6", detail: "Capstone / project rooms with flexible layouts." },
];

export const labNewBuildingFloors = newBuildingFloors.map((f) => ({
  ...f,
  detail: "Lab bays, storage for kit, and quick-deploy benches on this level.",
}));

export const mainBuildingBlockTabs = [
  { label: "A block", detail: "North wing lecture halls — tiered seating and corridor access." },
  { label: "B block", detail: "South wing parallel rooms — hybrid-ready spaces and breakout areas." },
];

export const newBuildingBlockTabs = [
  { label: "F block", detail: "East stack — lecture theatres and collaboration bays." },
  { label: "G block", detail: "West stack — seminar suites and writable-wall classrooms." },
];

export function floorBlockPanelCopy(floorLabel, blockLabel, buildingKey, spaceKind = "lecture") {
  const tabs = buildingKey === "new" ? newBuildingBlockTabs : mainBuildingBlockTabs;
  const tab = tabs.find((b) => b.label === blockLabel) ?? tabs[0];
  const isLab = spaceKind === "lab";
  const unit = isLab ? "labs" : "halls";
  const availability = buildingKey === "new" ? (isLab ? `4 ${unit}` : `5 ${unit}`) : `6 ${unit}`;

  return {
    title: tab.label,
    description: isLab ? `Computer lab · ${floorLabel} · ${tab.detail}` : `${floorLabel} · ${tab.detail}`,
    availability,
  };
}

export function normalizeBuildingName(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function extractFloorNumber(floorLabel) {
  return String(floorLabel ?? "").replace("Floor ", "").trim();
}

export function extractCodeFromResource(resource) {
  const nameMatch = String(resource?.name ?? "").match(/([A-Z]\d{3,4})/);
  if (nameMatch) return nameMatch[1];
  if (resource?.block && resource?.floor && resource?.hallNumber) {
    return `${String(resource.block).trim().charAt(0).toUpperCase()}${String(resource.floor).trim()}${String(
      Number(resource.hallNumber),
    ).padStart(2, "0")}`;
  }
  return null;
}

export function getResourceKind(type) {
  const normalized = String(type ?? "").trim().toLowerCase();
  if (normalized === "lecture hall" || normalized === "lecture_hall") return "lecture";
  if (normalized === "computer lab" || normalized === "computer_lab") return "lab";
  if (normalized === "equipment" || normalized === "equipments") return "equipment";
  if (normalized === "meeting room" || normalized === "meeting_room") return "meeting";
  if (normalized === "library workspace" || normalized === "library_workspace") return "library";
  return "other";
}

export function formatAvailableCount(count) {
  return `${count} available`;
}

export function formatUnitCount(count, unit) {
  return `${count} ${unit}`;
}

export function formatTimeValue(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const parts = text.split(":");
  if (parts.length < 2) return text;
  const hh = parts[0].padStart(2, "0");
  const mm = parts[1].padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatTimeRange(resource) {
  if (!resource?.availableFrom || !resource?.availableTo) return null;
  return `${formatTimeValue(resource.availableFrom)} - ${formatTimeValue(resource.availableTo)}`;
}

export function canViewResourceForRole(resource, role) {
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

export function getCapacityDisplayValue(resource) {
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

export function getResourceDetailRows(resource) {
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

export function getComparableCapacityValue(resource) {
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

export function getStatusMeta(status) {
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
