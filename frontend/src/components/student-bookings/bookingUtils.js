/** @param {string|undefined} type */
export function isMeetingRoomType(type) {
  return String(type ?? "")
    .trim()
    .toLowerCase()
    .includes("meeting");
}

/**
 * Maximum capacity for attendee validation (single number when possible).
 * @param {Record<string, unknown>} resource
 * @returns {number|null}
 */
export function getResourceCapacityMax(resource) {
  if (!resource) return null;
  const cap = resource.capacity;
  if (cap != null && !Number.isNaN(Number(cap))) {
    return Number(cap);
  }
  const max = resource.maxCapacity;
  if (max != null && !Number.isNaN(Number(max))) {
    return Number(max);
  }
  const min = resource.minCapacity;
  if (min != null && max == null && !Number.isNaN(Number(min))) {
    return Number(min);
  }
  const audience = String(resource.audience ?? "")
    .trim()
    .toLowerCase();
  if (isMeetingRoomType(resource.type) && audience === "student") return 8;
  if (isMeetingRoomType(resource.type) && audience === "lecturer") return 8;
  return null;
}

export function formatTimeRange(resource) {
  if (!resource?.availableFrom && !resource?.availableTo) return "";
  const from = resource.availableFrom ? String(resource.availableFrom).slice(0, 5) : "";
  const to = resource.availableTo ? String(resource.availableTo).slice(0, 5) : "";
  if (from && to) return `${from} – ${to}`;
  return from || to || "";
}

/**
 * @typedef {object} RoomSummary
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {string} capacityLabel
 * @property {number|null} capacityMax
 * @property {string} availabilityLabel
 * @property {string} status
 */

/** @param {Record<string, unknown>} resource @returns {RoomSummary} */
export function resourceToRoomSummary(resource) {
  const id = String(resource?.id ?? "");
  const name = String(resource?.name ?? resource?.type ?? "Meeting room");
  const location = String(resource?.location ?? "—");
  const max = getResourceCapacityMax(resource);
  let capacityLabel = "N/A";
  if (resource?.capacity != null && !Number.isNaN(Number(resource.capacity))) {
    capacityLabel = String(resource.capacity);
  } else if (resource?.minCapacity != null && resource?.maxCapacity != null) {
    capacityLabel = `${resource.minCapacity}-${resource.maxCapacity}`;
  } else if (max != null) {
    capacityLabel = String(max);
  }
  const availabilityLabel = formatTimeRange(resource) || "—";
  return {
    id,
    name,
    location,
    capacityLabel,
    capacityMax: max,
    availabilityLabel,
    status: String(resource?.status ?? ""),
  };
}

/**
 * @param {string} bookingDate YYYY-MM-DD
 * @param {string} startTime HH:mm
 * @param {string} endTime HH:mm
 */
export function toLocalIsoDateTime(bookingDate, time) {
  if (!bookingDate || !time) return "";
  return `${bookingDate}T${time}:00`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Today's date in local YYYY-MM-DD */
export function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Current local time HH:mm for min on same-day bookings */
export function nowTimeString() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Same campus window as admin facility availability (see AdminDashboardPage). */
const CAMPUS_OPEN_MINUTES = 8 * 60; // 08:00
const CAMPUS_CLOSE_MINUTES = 20 * 60; // 20:00
const MIN_BOOKING_DURATION_MINUTES = 30;
const PURPOSE_MIN_LENGTH = 3;
const PURPOSE_MAX_LENGTH = 500;

/**
 * @param {string} value HH:mm from controlled inputs (usually zero-padded)
 * @returns {number|null} minutes from midnight
 */
function bookingTimeToMinutes(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  const [hh, mm] = s.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm) || mm < 0 || mm > 59 || hh > 23) return null;
  return hh * 60 + mm;
}

/**
 * Parses times from API / admin (may be "9:00:00" or "14:00").
 * @returns {number|null}
 */
function parseResourceTimeToMinutes(value) {
  if (value == null || value === "") return null;
  const m = String(value).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || mm < 0 || mm > 59 || hh > 23) return null;
  return hh * 60 + mm;
}

/**
 * @param {Record<string, unknown>|null|undefined} resource
 * @returns {{ from: number, to: number } | null}
 */
function getTypicalAvailabilityMinutes(resource) {
  if (!resource?.availableFrom || !resource?.availableTo) return null;
  const from = parseResourceTimeToMinutes(String(resource.availableFrom));
  const to = parseResourceTimeToMinutes(String(resource.availableTo));
  if (from == null || to == null || from >= to) return null;
  return { from, to };
}

/**
 * @param {object} fields
 * @param {number|null} capacityMax
 * @param {Record<string, unknown>|null|undefined} [resource] — used for typical availability (availableFrom / availableTo)
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateBookingFields(fields, capacityMax, resource) {
  const { bookingDate, startTime, endTime, purpose, expectedAttendees } = fields;
  if (!bookingDate?.trim()) return { ok: false, message: "Booking date is required." };
  if (!startTime?.trim()) return { ok: false, message: "Start time is required." };
  if (!endTime?.trim()) return { ok: false, message: "End time is required." };

  const purposeTrimmed = String(purpose ?? "").trim();
  if (!purposeTrimmed) return { ok: false, message: "Purpose is required." };
  if (purposeTrimmed.length < PURPOSE_MIN_LENGTH) {
    return { ok: false, message: `Purpose must be at least ${PURPOSE_MIN_LENGTH} characters.` };
  }
  if (purposeTrimmed.length > PURPOSE_MAX_LENGTH) {
    return { ok: false, message: `Purpose must be at most ${PURPOSE_MAX_LENGTH} characters.` };
  }

  if (expectedAttendees === "" || expectedAttendees == null || Number.isNaN(Number(expectedAttendees))) {
    return { ok: false, message: "Expected attendees is required." };
  }
  const attendees = Number(expectedAttendees);
  if (!Number.isFinite(attendees) || !Number.isInteger(attendees)) {
    return { ok: false, message: "Expected attendees must be a whole number." };
  }
  if (attendees < 1) return { ok: false, message: "Expected attendees must be at least 1." };

  const startMin = bookingTimeToMinutes(startTime);
  const endMin = bookingTimeToMinutes(endTime);
  if (startMin == null) return { ok: false, message: "Start time is not valid." };
  if (endMin == null) return { ok: false, message: "End time is not valid." };

  if (endMin <= startMin) {
    return { ok: false, message: "End time must be after start time." };
  }

  if (endMin - startMin < MIN_BOOKING_DURATION_MINUTES) {
    return {
      ok: false,
      message: `Booking must be at least ${MIN_BOOKING_DURATION_MINUTES} minutes long.`,
    };
  }

  if (startMin < CAMPUS_OPEN_MINUTES || startMin > CAMPUS_CLOSE_MINUTES) {
    return { ok: false, message: "Start time must be between 08:00 and 20:00." };
  }
  if (endMin < CAMPUS_OPEN_MINUTES || endMin > CAMPUS_CLOSE_MINUTES) {
    return { ok: false, message: "End time must be between 08:00 and 20:00." };
  }

  const typical = getTypicalAvailabilityMinutes(resource);
  if (typical) {
    const label = formatTimeRange(resource) || "the typical hours shown for this resource";
    if (startMin < typical.from || endMin > typical.to) {
      return {
        ok: false,
        message: `Booking must fall within typical availability for this resource (${label}).`,
      };
    }
  }

  const today = todayDateString();
  if (bookingDate < today) {
    return { ok: false, message: "Booking date cannot be in the past." };
  }
  if (bookingDate === today) {
    const nowT = nowTimeString();
    const nowMin = parseResourceTimeToMinutes(nowT);
    if (nowMin != null && startMin < nowMin) {
      return { ok: false, message: "Start time cannot be in the past for today." };
    }
  }

  if (capacityMax != null && attendees > capacityMax) {
    return {
      ok: false,
      message: `Expected attendees cannot exceed room capacity (${capacityMax}).`,
    };
  }

  return { ok: true };
}
