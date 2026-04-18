/** @param {Record<string, unknown>} r */
export function categoryIdForResource(r) {
  const t = String(r?.type ?? "").trim();
  const lower = t.toLowerCase();
  if (t === "Lecture Hall") return "lecture";
  if (t === "Computer Lab") return "lab";
  if (lower.includes("library workspace")) return "workspace";
  if (lower.includes("meeting")) return "meeting";
  if (lower.includes("equipment")) return "equipment";
  return "other";
}

/** Lecturer /spaces/ page: halls, labs, meeting rooms, library workspaces only (no equipment, no "other"). */
export function isLecturerSpaceCategoryId(id) {
  return id === "lecture" || id === "lab" || id === "meeting" || id === "workspace";
}

/** @param {Record<string, unknown>} r */
export function isLecturerSpaceResource(r) {
  return isLecturerSpaceCategoryId(categoryIdForResource(r));
}

/** @param {string | null | undefined} resourceType from a booking row */
export function isLecturerSpaceBookingResourceType(resourceType) {
  return isLecturerSpaceCategoryId(categoryIdForResource({ type: String(resourceType ?? "").trim() }));
}

/** Student self-booking on Facilities: meeting rooms + library workspaces only (subset of lecturer spaces). */
export function isStudentSelfBookSpaceBookingResourceType(resourceType) {
  const id = categoryIdForResource({ type: String(resourceType ?? "").trim() });
  return id === "meeting" || id === "workspace";
}

/** Tabs on `/lecturer/bookings` — spaces only. */
export const LECTURER_SPACE_BOOKING_TABS = [
  { id: "all", label: "All" },
  { id: "lecture", label: "Lecture halls" },
  { id: "lab", label: "Computer labs" },
  { id: "meeting", label: "Meeting rooms" },
  { id: "workspace", label: "Library workspaces" },
];

/** Tabs on `/technician/bookings` — equipment only (matches Facilities technician view). */
export const TECHNICIAN_BOOKING_TABS = [{ id: "all", label: "All" }];

export const LECTURER_BOOKING_TABS = [
  { id: "all", label: "All" },
  { id: "lecture", label: "Lecture halls" },
  { id: "lab", label: "Computer labs" },
  { id: "meeting", label: "Meeting rooms" },
  { id: "workspace", label: "Library workspaces" },
  { id: "equipment", label: "Equipment" },
];
