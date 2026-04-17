import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StudentSettingsForm from "./StudentSettingsForm";
import AdminManageBookings from "./components/admin-bookings/AdminManageBookings.jsx";
import { apiUrl } from "./apiBase.js";
import { recentActivitiesListUrl } from "./services/recentActivitiesApi.js";

const CONTACT_MESSAGES_KEY = "smart-campus-contact-messages";

function readContactMessages() {
  try {
    const raw = sessionStorage.getItem(CONTACT_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    sessionStorage.removeItem(CONTACT_MESSAGES_KEY);
    return [];
  }
}

function formatDateTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString();
}

const tiles = [
  {
    id: "users",
    title: "Manage Users",
    description: "View and manage all system users and roles.",
    iconBg: "bg-cyan-600/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    id: "facilities",
    title: "Manage Facilities",
    description: "Add, update, or remove campus resources and assets.",
    iconBg: "bg-emerald-500/20 text-emerald-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: "manage-bookings",
    title: "Manage Booking",
    description:
      "Spaces, rooms, library workspaces, and teaching equipment — approve or reject in one place (All / Students / Equipment tabs).",
    iconBg: "bg-cyan-500/20 text-cyan-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Track and manage all maintenance and incident tickets.",
    iconBg: "bg-amber-500/20 text-amber-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    id: "contact-messages",
    title: "Contact Messages",
    description: "View and manage messages sent through the Contact Us form.",
    iconBg: "bg-violet-500/20 text-violet-300",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h8m-8 4h5m-7 6h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure system settings and access controls.",
    iconBg: "bg-red-500/20 text-red-400",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const STRUCTURED_LOCATION_TYPES = new Set(["Lecture Hall", "Computer Lab"]);
const MAIN_BUILDING_FLOORS = ["3", "4", "5", "6"];
const NEW_BUILDING_FLOORS = Array.from({ length: 11 }, (_, i) => String(i + 3)); // 3-13

function isStructuredLocationType(type) {
  return STRUCTURED_LOCATION_TYPES.has(type);
}

function getCapacityLimit(type) {
  if (type === "Lecture Hall") return { min: 1, max: 500 };
  if (type === "Computer Lab") return { min: 1, max: 60 };
  return null;
}

function needsAudienceSelection(type) {
  return type === "Library Workspace" || type === "Meeting Room" || isEquipmentType(type);
}

function isLibraryWorkspaceType(type) {
  return type === "Library Workspace";
}

function isMeetingRoomType(type) {
  return type === "Meeting Room";
}

function isEquipmentType(type) {
  return type === "Equipment" || type === "Equipments";
}

function getAudienceOptionsForType(type) {
  if (isEquipmentType(type)) {
    return [
      { value: "Lecturer", label: "Lecturer" },
      { value: "Technician", label: "Technician" },
    ];
  }
  return [
    { value: "Student", label: "Student" },
    { value: "Lecturer", label: "Lecturer" },
  ];
}

function getDuplicateMessageForType(type) {
  if (type === "Lecture Hall") {
    return "This lecture hall already exists at this building, floor, and block";
  }
  if (type === "Computer Lab") {
    return "This computer lab already exists at this building, floor, and block";
  }
  if (type === "Library Workspace") {
    return "This workspace already exists at this building, floor, and block";
  }
  if (type === "Meeting Room") {
    return "This meeting room already exists at this building, floor, and block";
  }
  if (isEquipmentType(type)) return "This equipment already exists";
  return "This resource already exists";
}

/**
 * Duplicate key aligned with backend: same hall (or room/workspace) number is allowed in
 * different building/floor/block; not twice in the same place.
 */
function getFacilityDuplicateKey(resource) {
  if (!resource?.type) return "";
  const type = String(resource.type).trim();

  if (type === "Lecture Hall" || type === "Computer Lab") {
    const num = String(resource.hallNumber ?? "").trim().toLowerCase();
    if (!num) return "";
    return [
      normalizeText(type),
      normalizeText(resource.building),
      normalizeText(String(resource.floor ?? "")),
      normalizeText(String(resource.block ?? "")),
      num,
    ].join("|");
  }
  if (type === "Library Workspace") {
    const num = String(resource.workspaceNumber ?? "").trim().toLowerCase();
    if (!num) return "";
    return [
      normalizeText(type),
      normalizeText(resource.building),
      normalizeText(String(resource.floor ?? "")),
      normalizeText(String(resource.block ?? "")),
      num,
    ].join("|");
  }
  if (type === "Meeting Room") {
    const num = String(resource.meetingRoomNumber ?? "").trim().toLowerCase();
    if (!num) return "";
    return [
      normalizeText(type),
      normalizeText(resource.building),
      normalizeText(String(resource.floor ?? "")),
      normalizeText(String(resource.block ?? "")),
      num,
    ].join("|");
  }
  if (isEquipmentType(type)) {
    return normalizeText(resource.equipmentName);
  }
  return "";
}

function getMeetingRoomCapacityRange(audience) {
  if (audience === "Student") return { min: 5, max: 8, helper: "Allowed range: 5–8" };
  if (audience === "Lecturer") return { min: 1, max: 8, helper: "Allowed range: 1–8" };
  return null;
}

function validateMeetingRoomCapacity(form) {
  const minValue = String(form.minCapacity ?? "").trim();
  const maxValue = String(form.maxCapacity ?? "").trim();
  const validIntegerPattern = /^\d+$/;

  if (!minValue) {
    return { minCapacity: "Minimum capacity is required." };
  }
  if (!validIntegerPattern.test(minValue) || Number(minValue) < 1) {
    return { minCapacity: "Minimum capacity must be a positive integer." };
  }

  if (!maxValue) {
    return { maxCapacity: "Maximum capacity is required." };
  }
  if (!validIntegerPattern.test(maxValue) || Number(maxValue) < 1) {
    return { maxCapacity: "Maximum capacity must be a positive integer." };
  }

  const minCapacityNumber = Number(minValue);
  const maxCapacityNumber = Number(maxValue);
  if (minCapacityNumber > maxCapacityNumber) {
    return { maxCapacity: "Minimum capacity must be less than or equal to maximum capacity" };
  }

  const range = getMeetingRoomCapacityRange(form.audience);
  if (!range) return null;

  if (minCapacityNumber < range.min || maxCapacityNumber > range.max) {
    if (form.audience === "Student") {
      return {
        maxCapacity: "For students, meeting room capacity must be between 5 and 8",
      };
    }
    if (form.audience === "Lecturer") {
      return {
        maxCapacity: "For lecturers, meeting room capacity must be between 1 and 8",
      };
    }
  }

  return null;
}

function getAutoLocationForType(type) {
  if (type === "Meeting Room" || type === "Library Workspace") {
    return "New Building - Floor 1 - Library";
  }
  if (isEquipmentType(type)) {
    return "Main Building - 1st Floor Equipment Store";
  }
  return "";
}

const CAMPUS_OPEN_MINUTES = 8 * 60; // 08:00
const CAMPUS_CLOSE_MINUTES = 20 * 60; // 20:00

function timeToMinutes(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hh, mm] = value.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function getAvailabilityValidationErrors(availableFrom, availableTo, status) {
  const errors = {};
  if (status !== "ACTIVE") return errors;

  if (!availableFrom) {
    errors.availableFrom = "Availability start time is required";
  }
  if (!availableTo) {
    errors.availableTo = "Availability end time is required";
  }

  const startMinutes = timeToMinutes(availableFrom);
  const endMinutes = timeToMinutes(availableTo);
  if (startMinutes == null || endMinutes == null) {
    return errors;
  }

  if (startMinutes < CAMPUS_OPEN_MINUTES || startMinutes > CAMPUS_CLOSE_MINUTES) {
    errors.availableFrom = "Start time must be between 08:00 and 20:00";
  }
  if (endMinutes < CAMPUS_OPEN_MINUTES || endMinutes > CAMPUS_CLOSE_MINUTES) {
    errors.availableTo = "End time must be between 08:00 and 20:00";
  }
  if (errors.availableFrom || errors.availableTo) {
    return errors;
  }

  if (startMinutes === endMinutes) {
    errors.availableTo = "Start and end time cannot be the same";
    return errors;
  }
  if (startMinutes > endMinutes) {
    errors.availableTo = "Start time must be earlier than end time";
    return errors;
  }
  if (endMinutes - startMinutes < 30) {
    errors.availableTo = "Availability window must be at least 30 minutes";
  }

  return errors;
}

function validateFacilityForm(form) {
  const fieldErrors = {};
  const structuredLocation = isStructuredLocationType(form.type);
  const capacityLimit = getCapacityLimit(form.type);
  const isMeetingRoom = isMeetingRoomType(form.type);

  if (!form.type.trim()) {
    fieldErrors.type = "Type is required.";
  }

  const hasLocation = structuredLocation
    ? Boolean(form.building && form.floor && form.block && form.hallNumber.trim())
    : Boolean(form.location.trim());
  if (!hasLocation) {
    fieldErrors.location = structuredLocation
      ? "Please select building, floor, block, and hall number."
      : "Please fill Type and Location.";
  }

  if (needsAudienceSelection(form.type) && !form.audience) {
    fieldErrors.audience = isEquipmentType(form.type)
      ? "Please select Lecturer or Technician."
      : "Please select Student or Lecturer.";
  }

  if (structuredLocation && (Number.isNaN(Number(form.hallNumber)) || Number(form.hallNumber) < 1)) {
    fieldErrors.hallNumber = "Hall number must be a number greater than 0.";
  }

  const positiveIntegerPattern = /^\d+$/;
  if (isMeetingRoomType(form.type)) {
    if (!String(form.meetingRoomNumber ?? "").trim()) {
      fieldErrors.meetingRoomNumber = "Meeting Room Number is required.";
    } else if (
      !positiveIntegerPattern.test(String(form.meetingRoomNumber)) ||
      Number(form.meetingRoomNumber) < 1
    ) {
      fieldErrors.meetingRoomNumber = "Meeting Room Number must be a positive number.";
    }
  }

  if (isLibraryWorkspaceType(form.type)) {
    if (!String(form.workspaceNumber ?? "").trim()) {
      fieldErrors.workspaceNumber = "Workspace Number is required.";
    } else if (
      !positiveIntegerPattern.test(String(form.workspaceNumber)) ||
      Number(form.workspaceNumber) < 1
    ) {
      fieldErrors.workspaceNumber = "Workspace Number must be a positive number.";
    }
  }

  if (isEquipmentType(form.type) && !String(form.equipmentName ?? "").trim()) {
    fieldErrors.equipmentName = "Equipment Name is required.";
  }

  if (isMeetingRoom) {
    const meetingRoomCapacityErrors = validateMeetingRoomCapacity(form);
    if (meetingRoomCapacityErrors?.minCapacity) {
      fieldErrors.minCapacity = meetingRoomCapacityErrors.minCapacity;
    }
    if (meetingRoomCapacityErrors?.maxCapacity) {
      fieldErrors.maxCapacity = meetingRoomCapacityErrors.maxCapacity;
    }
  } else {
    const capacityValue = form.capacity ? Number(form.capacity) : null;
    if (
      capacityLimit &&
      (capacityValue === null ||
        Number.isNaN(capacityValue) ||
        capacityValue < capacityLimit.min ||
        capacityValue > capacityLimit.max)
    ) {
      fieldErrors.capacity = `${form.type} capacity must be between ${capacityLimit.min} and ${capacityLimit.max}.`;
    }
  }

  Object.assign(
    fieldErrors,
    getAvailabilityValidationErrors(form.availableFrom, form.availableTo, form.status),
  );

  return { fieldErrors };
}

function buildRoomCode(block, floor, hallNumber) {
  const safeBlock = String(block ?? "").trim().charAt(0).toUpperCase();
  const safeFloor = String(floor ?? "").trim();
  const number = Number(hallNumber);
  if (!safeBlock || !safeFloor || Number.isNaN(number)) return "";
  return `${safeBlock}${safeFloor}${String(number).padStart(2, "0")}`;
}

function buildResourceName(
  type,
  block,
  floor,
  hallNumber,
  location,
  meetingRoomNumber,
  workspaceNumber,
  equipmentName,
) {
  if (isStructuredLocationType(type)) {
    const code = buildRoomCode(block, floor, hallNumber);
    const prefix = type === "Computer Lab" ? "Computer Lab" : "Lecture Hall";
    return code ? `${prefix} ${code}` : prefix;
  }
  if (type === "Meeting Room") {
    return meetingRoomNumber ? `Meeting Room ${meetingRoomNumber}` : "Meeting Room";
  }
  if (type === "Library Workspace") {
    return workspaceNumber ? `Library Workspace ${workspaceNumber}` : "Library Workspace";
  }
  if (isEquipmentType(type)) {
    return equipmentName ? equipmentName : "Equipment";
  }
  return `${type} - ${location}`;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Administrator";
  const role = String(user?.role ?? "").trim().toLowerCase();
  const isAdmin = role === "administrator" || role === "admin";

  const [modal, setModal] = useState(null);
  const [contactMessages, setContactMessages] = useState(() => readContactMessages());
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isAddFacilityFormOpen, setIsAddFacilityFormOpen] = useState(false);
  const [facilitySaveMessage, setFacilitySaveMessage] = useState("");
  const [facilitySaveMessageType, setFacilitySaveMessageType] = useState("success");
  const [editingFacilityId, setEditingFacilityId] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [isFacilitiesLoading, setIsFacilitiesLoading] = useState(false);
  const [facilityFieldErrors, setFacilityFieldErrors] = useState({});
  const [facilityForm, setFacilityForm] = useState({
    type: "",
    capacity: "",
    minCapacity: "",
    maxCapacity: "",
    meetingRoomNumber: "",
    workspaceNumber: "",
    equipmentName: "",
    location: "",
    audience: "",
    building: "",
    floor: "",
    block: "",
    hallNumber: "",
    availableFrom: "",
    availableTo: "",
    status: "ACTIVE",
    imageUrl: "",
  });

  async function loadContactMessages() {
    try {
      const res = await fetch(apiUrl("/api/contact-messages"));
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.id ?? `db-${Math.random()}`,
          name: item.name ?? "Unknown",
          email: item.email ?? "Unknown",
          phone: item.phone ?? "Unknown",
          subject: item.subject ?? "(no subject)",
          message: item.message ?? "",
          status: item.status ?? "NEW",
          createdAt: item.createdAt ?? new Date().toISOString(),
        }));
        setContactMessages(mapped);
        sessionStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(mapped));
        return;
      }
    } catch {
      // fallback
    }

    setContactMessages(readContactMessages());
  }

  async function loadRecentActivities() {
    try {
      const res = await fetch(recentActivitiesListUrl(20, user));
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentActivities(data);
      }
    } catch {
      // keep current list if backend unavailable
    }
  }

  async function loadFacilities() {
    try {
      setIsFacilitiesLoading(true);
      const res = await fetch(apiUrl("/api/resources"));
      if (!res.ok) throw new Error("Failed to load resources");
      const data = await res.json();
      setFacilities(Array.isArray(data) ? data : []);
    } catch {
      setFacilitySaveMessageType("error");
      setFacilitySaveMessage("Could not load facilities from database.");
    } finally {
      setIsFacilitiesLoading(false);
    }
  }

  useEffect(() => {
    if (!modal) return;

    if (modal === "contact-messages") {
      void loadContactMessages();
      setSelectedMessageId(null);
    }
    if (modal === "facilities") {
      setIsAddFacilityFormOpen(true);
      setFacilitySaveMessage("");
      setFacilitySaveMessageType("success");
      setEditingFacilityId(null);
      void loadFacilities();
    }

    function onKey(e) {
      if (e.key === "Escape") setModal(null);
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal]);

  useEffect(() => {
    void loadRecentActivities();
    const id = setInterval(() => {
      void loadRecentActivities();
    }, 10000);
    return () => clearInterval(id);
  }, [user]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const activeTile = tiles.find((t) => t.id === modal);
  const selectedMessage = contactMessages.find((msg) => msg.id === selectedMessageId) || null;

  function handleFacilityInputChange(e) {
    const { name, value } = e.target;
    setFacilityFieldErrors({});
    setFacilityForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "type" && !isStructuredLocationType(value)) {
        next.building = "";
        next.floor = "";
        next.block = "";
        next.hallNumber = "";
      }
      if (name === "type") {
        const autoLocation = getAutoLocationForType(value);
        if (autoLocation) {
          next.location = autoLocation;
        } else if (isStructuredLocationType(value)) {
          next.location = "";
        }
      }
      if (name === "type" && !needsAudienceSelection(value)) {
        next.audience = "";
      }
      if (name === "type") {
        next.meetingRoomNumber = "";
        next.workspaceNumber = "";
        next.equipmentName = "";
        if (isLibraryWorkspaceType(value)) {
          next.capacity = "1";
          next.minCapacity = "";
          next.maxCapacity = "";
        } else if (isMeetingRoomType(value)) {
          next.capacity = "";
        } else if (isLibraryWorkspaceType(prev.type) || isMeetingRoomType(prev.type)) {
          next.capacity = "";
          next.minCapacity = "";
          next.maxCapacity = "";
        }
      }
      if (name === "status" && value === "OUT_OF_SERVICE") {
        next.availableFrom = "";
        next.availableTo = "";
      }
      if (name === "building") {
        next.floor = "";
        next.block = "";
        next.hallNumber = "";
      }
      if (name === "floor") {
        next.block = "";
        next.hallNumber = "";
      }
      if (name === "block") {
        next.hallNumber = "";
      }

      if (name === "type" || name === "audience" || name === "minCapacity" || name === "maxCapacity") {
        const meetingRoomCapacityErrors = isMeetingRoomType(next.type)
          ? validateMeetingRoomCapacity(next)
          : null;
        setFacilityFieldErrors((prevErrors) => {
          const updated = { ...prevErrors };
          delete updated.minCapacity;
          delete updated.maxCapacity;
          if (meetingRoomCapacityErrors) {
            if (meetingRoomCapacityErrors.minCapacity) {
              updated.minCapacity = meetingRoomCapacityErrors.minCapacity;
            }
            if (meetingRoomCapacityErrors.maxCapacity) {
              updated.maxCapacity = meetingRoomCapacityErrors.maxCapacity;
            }
          }
          return updated;
        });
      }
      if (name === "availableFrom" || name === "availableTo" || name === "status") {
        const availabilityErrors = getAvailabilityValidationErrors(
          next.availableFrom,
          next.availableTo,
          next.status,
        );
        setFacilityFieldErrors((prevErrors) => {
          const updated = { ...prevErrors };
          delete updated.availableFrom;
          delete updated.availableTo;
          if (availabilityErrors.availableFrom) {
            updated.availableFrom = availabilityErrors.availableFrom;
          }
          if (availabilityErrors.availableTo) {
            updated.availableTo = availabilityErrors.availableTo;
          }
          return updated;
        });
      }
      return next;
    });
  }

  async function handleFacilitySubmit(e) {
    e.preventDefault();
    const { fieldErrors } = validateFacilityForm(facilityForm);
    setFacilityFieldErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setFacilitySaveMessageType("error");
      setFacilitySaveMessage("Please fix highlighted fields.");
      return;
    }

    const structuredLocation = isStructuredLocationType(facilityForm.type);
    const resolvedLocation = structuredLocation
      ? `${facilityForm.building} - Floor ${facilityForm.floor} - ${facilityForm.block} Block - Hall ${facilityForm.hallNumber.trim()}`
      : facilityForm.location.trim();
    const resourceName = buildResourceName(
      facilityForm.type.trim(),
      facilityForm.block,
      facilityForm.floor,
      facilityForm.hallNumber,
      resolvedLocation,
      facilityForm.meetingRoomNumber.trim(),
      facilityForm.workspaceNumber.trim(),
      facilityForm.equipmentName.trim(),
    );
    const facilityPayload = {
      name: resourceName,
      type: facilityForm.type.trim(),
      capacity: isLibraryWorkspaceType(facilityForm.type)
        ? 1
        : isMeetingRoomType(facilityForm.type)
          ? null
        : facilityForm.capacity
          ? Number(facilityForm.capacity)
          : null,
      minCapacity: isMeetingRoomType(facilityForm.type) ? Number(facilityForm.minCapacity) : null,
      maxCapacity: isMeetingRoomType(facilityForm.type) ? Number(facilityForm.maxCapacity) : null,
      location: resolvedLocation,
      building: facilityForm.building,
      floor: facilityForm.floor,
      block: facilityForm.block,
      hallNumber: facilityForm.hallNumber.trim(),
      meetingRoomNumber: facilityForm.meetingRoomNumber.trim() || null,
      workspaceNumber: facilityForm.workspaceNumber.trim() || null,
      equipmentName: facilityForm.equipmentName.trim() || null,
      audience: facilityForm.audience || null,
      availableFrom: facilityForm.availableFrom || null,
      availableTo: facilityForm.availableTo || null,
      status: facilityForm.status,
      imageUrl: String(facilityForm.imageUrl ?? "").trim() || null,
    };

    const duplicateKey = getFacilityDuplicateKey(facilityPayload);
    const hasTypeIdentifierDuplicate = facilities.some((resource) => {
      if (resource.id === editingFacilityId) return false;
      if (normalizeText(resource.type) !== normalizeText(facilityPayload.type)) return false;
      return getFacilityDuplicateKey(resource) === duplicateKey && duplicateKey !== "";
    });
    if (hasTypeIdentifierDuplicate) {
      const duplicateMessage = getDuplicateMessageForType(facilityPayload.type);
      const duplicateField = isEquipmentType(facilityPayload.type)
        ? "equipmentName"
        : facilityPayload.type === "Meeting Room"
          ? "meetingRoomNumber"
          : facilityPayload.type === "Library Workspace"
            ? "workspaceNumber"
            : "hallNumber";
      setFacilityFieldErrors((prev) => ({ ...prev, [duplicateField]: duplicateMessage }));
      setFacilitySaveMessageType("error");
      setFacilitySaveMessage("Please fix highlighted fields.");
      return;
    }

    if (facilityForm.status === "ACTIVE") {
      const newStart = timeToMinutes(facilityForm.availableFrom);
      const newEnd = timeToMinutes(facilityForm.availableTo);
      const hasDuplicate = facilities.some((resource) => {
        if (resource.id === editingFacilityId) return false;
        if (normalizeText(resource.name) !== normalizeText(resourceName)) return false;
        if (normalizeText(resource.location) !== normalizeText(resolvedLocation)) return false;
        const existingStart = timeToMinutes(resource.availableFrom);
        const existingEnd = timeToMinutes(resource.availableTo);
        if (existingStart == null || existingEnd == null || newStart == null || newEnd == null) return false;
        return timesOverlap(existingStart, existingEnd, newStart, newEnd);
      });
      if (hasDuplicate) {
        setFacilityFieldErrors((prev) => ({
          ...prev,
          availableTo: "A similar resource already exists for this location and time window",
        }));
        setFacilitySaveMessageType("error");
        setFacilitySaveMessage("Please fix highlighted fields.");
        return;
      }
    }

    try {
      const url = editingFacilityId
        ? apiUrl(`/api/resources/${editingFacilityId}`)
        : apiUrl("/api/resources");
      const method = editingFacilityId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(facilityPayload),
      });
      if (!res.ok) {
        let serverMessage = "Could not save facility to database.";
        try {
          const data = await res.json();
          if (typeof data?.message === "string" && data.message.trim()) {
            serverMessage = data.message.trim();
          }
        } catch {
          // ignore body parse failure
        }
        throw new Error(serverMessage);
      }
      await loadFacilities();
      setFacilitySaveMessage(editingFacilityId ? "Facility updated successfully." : "Facility added successfully.");
      setFacilitySaveMessageType("success");
      handleFacilityClear();
    } catch (error) {
      setFacilitySaveMessageType("error");
      setFacilitySaveMessage(error instanceof Error ? error.message : "Could not save facility to database.");
      return;
    }
  }

  function handleFacilityClear() {
    setFacilityForm({
      type: "",
      capacity: "",
      minCapacity: "",
      maxCapacity: "",
      meetingRoomNumber: "",
      workspaceNumber: "",
      equipmentName: "",
      location: "",
      audience: "",
      building: "",
      floor: "",
      block: "",
      hallNumber: "",
      availableFrom: "",
      availableTo: "",
      status: "ACTIVE",
      imageUrl: "",
    });
    setFacilityFieldErrors({});
    setEditingFacilityId(null);
  }

  function handleFacilityEdit(facility) {
    setEditingFacilityId(facility.id);
    const isStructured = isStructuredLocationType(facility.type);
    setFacilityForm({
      type: facility.type,
      capacity: isLibraryWorkspaceType(facility.type)
        ? "1"
        : isMeetingRoomType(facility.type)
          ? ""
        : facility.capacity != null
          ? String(facility.capacity)
          : "",
      minCapacity: isMeetingRoomType(facility.type) ? String(facility.minCapacity ?? "") : "",
      maxCapacity: isMeetingRoomType(facility.type) ? String(facility.maxCapacity ?? "") : "",
      meetingRoomNumber: isMeetingRoomType(facility.type)
        ? String(facility.meetingRoomNumber ?? "")
        : "",
      workspaceNumber: isLibraryWorkspaceType(facility.type)
        ? String(facility.workspaceNumber ?? "")
        : "",
      equipmentName: isEquipmentType(facility.type) ? String(facility.equipmentName ?? "") : "",
      location: isStructured ? "" : facility.location,
      audience: facility.audience ?? "",
      building: facility.building ?? "",
      floor: facility.floor ?? "",
      block: facility.block ?? "",
      hallNumber: facility.hallNumber ?? "",
      availableFrom: facility.availableFrom ?? "",
      availableTo: facility.availableTo ?? "",
      status: facility.status,
      imageUrl: facility.imageUrl ?? facility.image_url ?? "",
    });
    setFacilitySaveMessage("");
    setFacilitySaveMessageType("success");
    setFacilityFieldErrors({});
  }

  async function handleFacilityDelete(id) {
    try {
      const res = await fetch(apiUrl(`/api/resources/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await loadFacilities();
      if (editingFacilityId === id) {
        handleFacilityClear();
      }
      setFacilitySaveMessageType("success");
      setFacilitySaveMessage("Facility deleted.");
    } catch {
      setFacilitySaveMessageType("error");
      setFacilitySaveMessage("Could not delete facility.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 antialiased">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/90">
          SMART CAMPUS • ADMIN DASHBOARD
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Welcome back, <span className="text-cyan-400">{displayName}!</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Manage users, facilities, bookings, maintenance, contact messages, and system settings
              from the tools below. This is a front-end demo—connect your APIs when ready.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Academic year 2025/26 · Sample data for demonstration
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Campus Role", value: "Administrator" },
            { label: "Access Valid Through", value: "April 2026" },
            { label: "Status", value: "Active", highlight: true },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 shadow-lg shadow-black/40"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${card.highlight ? "text-cyan-400" : "text-white"}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-lg font-semibold text-white">Your tools</h2>
          <p className="mt-1 text-sm text-slate-400">Tap a card to open details in a popup.</p>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => setModal(tile.id)}
              className="group w-full rounded-2xl border border-cyan-500/15 bg-slate-900/80 p-6 text-left shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tile.iconBg}`}>
                {tile.icon}
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-white group-hover:text-cyan-300">
                {tile.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{tile.description}</p>
            </button>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold text-cyan-300">Recent Activity</h3>
            <span className="text-xs text-slate-500">Auto refreshes every 10s</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            View latest system actions such as bookings, tickets, and updates.
          </p>

          {recentActivities.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/50 p-6 text-sm text-slate-500">
              No recent activity yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-3 rounded-2xl border border-cyan-500/15 bg-slate-900/70 p-4">
              {recentActivities.map((activity) => (
                <li
                  key={`${activity.id ?? activity.createdAt}-${activity.message}`}
                  className="rounded-xl border border-slate-600/40 bg-slate-800/70 px-3 py-2.5"
                >
                  <p className="text-sm text-slate-200">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.category || "SYSTEM"} • {formatDateTime(activity.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <SiteFooter />

      {modal && activeTile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dashboard-modal-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl ${
              modal === "settings" || modal === "manage-bookings" ? "max-w-2xl" : "max-w-4xl"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-cyan-500/15 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeTile.iconBg}`}
                >
                  {activeTile.icon}
                </span>
                <h2
                  id="admin-dashboard-modal-title"
                  className="font-heading text-xl font-semibold text-white sm:text-2xl"
                >
                  {activeTile.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close dialog"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="pt-5">
              {modal === "users" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Search, filter, and edit campus accounts and role assignments. In this demo,
                    users exist only in your browser session—no server list yet.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No user directory connected (demo).
                  </div>
                </div>
              )}

              {modal === "facilities" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Maintain the catalogue of rooms, labs, and assets. The{" "}
                    <Link to="/facilities" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Facilities
                    </Link>{" "}
                    page is <strong className="text-amber-200/90">read-only for admins</strong>—only{" "}
                    <strong className="text-slate-200">students</strong> and{" "}
                    <strong className="text-slate-200">lecturers</strong> can book from there. Use{" "}
                    <strong className="text-slate-200">Manage Booking</strong> to approve or reject requests (all types
                    or equipment-only via the in-panel tabs).
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddFacilityFormOpen((prev) => !prev);
                        setFacilitySaveMessage("");
                        setFacilitySaveMessageType("success");
                      }}
                      className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-6 py-2.5 text-base font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                    >
                      {isAddFacilityFormOpen ? "Close Add Facilities" : "Add Facilities"}
                    </button>
                  </div>

                  {isAddFacilityFormOpen ? (
                    <>
                      <form
                        onSubmit={handleFacilitySubmit}
                        className="flex flex-col gap-4 rounded-3xl border border-cyan-500/30 bg-slate-950/60 p-5 sm:p-6"
                      >
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-white">Add or Update Facility</h4>
                        <p className="text-xs text-slate-400">
                          Fill in details and click save. Fields marked with * are required.
                        </p>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Type <span className="text-red-300">*</span>
                          </span>
                          <select
                            name="type"
                            value={facilityForm.type}
                            onChange={handleFacilityInputChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            required
                          >
                            <option value="">Select facility type</option>
                            <option value="Lecture Hall">Lecture Hall</option>
                            <option value="Computer Lab">Computer Lab</option>
                            <option value="Library Workspace">Library Workspace</option>
                            <option value="Meeting Room">Meeting Room</option>
                            <option value="Equipment">Equipment</option>
                          </select>
                          {facilityFieldErrors.type ? (
                            <p className="text-xs font-medium text-red-300">{facilityFieldErrors.type}</p>
                          ) : null}
                        </label>
                        {isMeetingRoomType(facilityForm.type) ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-slate-300">
                                Minimum Capacity <span className="text-red-300">*</span>
                              </span>
                              <input
                                type="number"
                                min={getMeetingRoomCapacityRange(facilityForm.audience)?.min ?? 1}
                                max={getMeetingRoomCapacityRange(facilityForm.audience)?.max ?? 8}
                                step="1"
                                name="minCapacity"
                                value={facilityForm.minCapacity}
                                onChange={handleFacilityInputChange}
                                placeholder="e.g. 5"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                              />
                              {facilityFieldErrors.minCapacity ? (
                                <p className="text-xs font-medium text-red-300">
                                  {facilityFieldErrors.minCapacity}
                                </p>
                              ) : null}
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-slate-300">
                                Maximum Capacity <span className="text-red-300">*</span>
                              </span>
                              <input
                                type="number"
                                min={getMeetingRoomCapacityRange(facilityForm.audience)?.min ?? 1}
                                max={getMeetingRoomCapacityRange(facilityForm.audience)?.max ?? 8}
                                step="1"
                                name="maxCapacity"
                                value={facilityForm.maxCapacity}
                                onChange={handleFacilityInputChange}
                                placeholder="e.g. 8"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                              />
                              {facilityFieldErrors.maxCapacity ? (
                                <p className="text-xs font-medium text-red-300">
                                  {facilityFieldErrors.maxCapacity}
                                </p>
                              ) : null}
                            </label>
                            {facilityForm.audience === "Student" ? (
                              <p className="sm:col-span-2 text-xs text-slate-500">Allowed range: 5–8</p>
                            ) : null}
                            {facilityForm.audience === "Lecturer" ? (
                              <p className="sm:col-span-2 text-xs text-slate-500">Allowed range: 1–8</p>
                            ) : null}
                          </div>
                        ) : (
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-300">Capacity</span>
                            <input
                              type="number"
                              min={getCapacityLimit(facilityForm.type)?.min ?? 1}
                              max={getCapacityLimit(facilityForm.type)?.max}
                              name="capacity"
                              value={facilityForm.capacity}
                              onChange={handleFacilityInputChange}
                              disabled={isLibraryWorkspaceType(facilityForm.type)}
                              placeholder={
                                facilityForm.type === "Lecture Hall"
                                  ? "1 - 500"
                                  : facilityForm.type === "Computer Lab"
                                    ? "1 - 60"
                                    : isLibraryWorkspaceType(facilityForm.type)
                                      ? "Fixed at 1 per workspace"
                                      : "e.g. 40"
                              }
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            />
                            {isLibraryWorkspaceType(facilityForm.type) ? (
                              <p className="text-xs text-slate-500">
                                Library Workspace capacity is fixed to 1.
                              </p>
                            ) : null}
                            {getCapacityLimit(facilityForm.type) ? (
                              <p className="text-xs text-slate-500">
                                Allowed range: {getCapacityLimit(facilityForm.type).min}-
                                {getCapacityLimit(facilityForm.type).max}
                              </p>
                            ) : null}
                            {facilityFieldErrors.capacity ? (
                              <p className="text-xs font-medium text-red-300">{facilityFieldErrors.capacity}</p>
                            ) : null}
                          </label>
                        )}
                      </div>

                      {isMeetingRoomType(facilityForm.type) ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Meeting Room Number <span className="text-red-300">*</span>
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            name="meetingRoomNumber"
                            value={facilityForm.meetingRoomNumber}
                            onChange={handleFacilityInputChange}
                            placeholder="e.g. 101"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            required
                          />
                          {facilityFieldErrors.meetingRoomNumber ? (
                            <p className="text-xs font-medium text-red-300">
                              {facilityFieldErrors.meetingRoomNumber}
                            </p>
                          ) : null}
                        </label>
                      ) : null}

                      {isLibraryWorkspaceType(facilityForm.type) ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Workspace Number <span className="text-red-300">*</span>
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            name="workspaceNumber"
                            value={facilityForm.workspaceNumber}
                            onChange={handleFacilityInputChange}
                            placeholder="e.g. 22"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            required
                          />
                          {facilityFieldErrors.workspaceNumber ? (
                            <p className="text-xs font-medium text-red-300">
                              {facilityFieldErrors.workspaceNumber}
                            </p>
                          ) : null}
                        </label>
                      ) : null}

                      {isEquipmentType(facilityForm.type) ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Equipment Name <span className="text-red-300">*</span>
                          </span>
                          <input
                            type="text"
                            name="equipmentName"
                            value={facilityForm.equipmentName}
                            onChange={handleFacilityInputChange}
                            placeholder="e.g. Projector"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            required
                          />
                          {facilityFieldErrors.equipmentName ? (
                            <p className="text-xs font-medium text-red-300">
                              {facilityFieldErrors.equipmentName}
                            </p>
                          ) : null}
                        </label>
                      ) : null}

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-300">
                          Location <span className="text-red-300">*</span>
                        </span>
                        {isStructuredLocationType(facilityForm.type) ? (
                          <div className="grid gap-4 sm:grid-cols-4">
                            <select
                              name="building"
                              value={facilityForm.building}
                              onChange={handleFacilityInputChange}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition focus:border-cyan-400"
                              required
                            >
                              <option value="">Select building</option>
                              <option value="Main Building">Main Building</option>
                              <option value="New Building">New Building</option>
                            </select>
                            <select
                              name="floor"
                              value={facilityForm.floor}
                              onChange={handleFacilityInputChange}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition focus:border-cyan-400"
                              required
                              disabled={!facilityForm.building}
                            >
                              <option value="">Select floor</option>
                              {(facilityForm.building === "Main Building"
                                ? MAIN_BUILDING_FLOORS
                                : facilityForm.building === "New Building"
                                  ? NEW_BUILDING_FLOORS
                                  : []
                              ).map((floor) => (
                                <option key={floor} value={floor}>
                                  Floor {floor}
                                </option>
                              ))}
                            </select>
                            <select
                              name="block"
                              value={facilityForm.block}
                              onChange={handleFacilityInputChange}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition focus:border-cyan-400"
                              required
                              disabled={!facilityForm.floor}
                            >
                              <option value="">Select block</option>
                              {(facilityForm.building === "Main Building"
                                ? ["A", "B"]
                                : facilityForm.building === "New Building"
                                  ? ["F", "G"]
                                  : []
                              ).map((block) => (
                                <option key={block} value={block}>
                                  {block} Block
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              name="hallNumber"
                              value={facilityForm.hallNumber}
                              onChange={handleFacilityInputChange}
                              placeholder="e.g. 1"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                              required
                              disabled={!facilityForm.block}
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            name="location"
                            value={facilityForm.location}
                            onChange={handleFacilityInputChange}
                            placeholder="e.g. New Building - Floor 4"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            required
                          />
                        )}
                        {facilityFieldErrors.location ? (
                          <p className="text-xs font-medium text-red-300">{facilityFieldErrors.location}</p>
                        ) : null}
                        {facilityFieldErrors.hallNumber ? (
                          <p className="text-xs font-medium text-red-300">{facilityFieldErrors.hallNumber}</p>
                        ) : null}
                      </label>

                      {needsAudienceSelection(facilityForm.type) ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Select user type <span className="text-red-300">*</span>
                          </span>
                          <select
                            name="audience"
                            value={facilityForm.audience}
                            onChange={handleFacilityInputChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition focus:border-cyan-400"
                            required
                          >
                            <option value="">
                              {isEquipmentType(facilityForm.type)
                                ? "Select Lecturer or Technician"
                                : "Select Student or Lecturer"}
                            </option>
                            {getAudienceOptionsForType(facilityForm.type).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {facilityFieldErrors.audience ? (
                            <p className="text-xs font-medium text-red-300">{facilityFieldErrors.audience}</p>
                          ) : null}
                        </label>
                      ) : null}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Availability window (from)
                          </span>
                          <input
                            type="time"
                            name="availableFrom"
                            value={facilityForm.availableFrom}
                            onChange={handleFacilityInputChange}
                            min="08:00"
                            max="20:00"
                            disabled={facilityForm.status === "OUT_OF_SERVICE"}
                            className={`w-full rounded-xl border bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition ${
                              facilityFieldErrors.availableFrom
                                ? "border-red-400 focus:border-red-300"
                                : "border-slate-700 focus:border-cyan-400"
                            }`}
                          />
                          {facilityFieldErrors.availableFrom ? (
                            <p className="text-xs font-medium text-red-300">
                              {facilityFieldErrors.availableFrom}
                            </p>
                          ) : null}
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-300">
                            Availability window (to)
                          </span>
                          <input
                            type="time"
                            name="availableTo"
                            value={facilityForm.availableTo}
                            onChange={handleFacilityInputChange}
                            min="08:00"
                            max="20:00"
                            disabled={facilityForm.status === "OUT_OF_SERVICE"}
                            className={`w-full rounded-xl border bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition ${
                              facilityFieldErrors.availableTo
                                ? "border-red-400 focus:border-red-300"
                                : "border-slate-700 focus:border-cyan-400"
                            }`}
                          />
                          {facilityFieldErrors.availableTo ? (
                            <p className="text-xs font-medium text-red-300">{facilityFieldErrors.availableTo}</p>
                          ) : null}
                        </label>
                      </div>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-300">Status</span>
                        <select
                          name="status"
                          value={facilityForm.status}
                          onChange={handleFacilityInputChange}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition focus:border-cyan-400"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                        </select>
                        <p className="text-xs text-slate-500">
                          Use `OUT_OF_SERVICE` when the resource cannot be booked.
                        </p>
                        {facilityForm.status === "OUT_OF_SERVICE" ? (
                          <p className="text-xs font-medium text-amber-300">
                            Availability is disabled while status is OUT_OF_SERVICE.
                          </p>
                        ) : null}
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-300">
                          Photo URL <span className="text-slate-500">(optional)</span>
                        </span>
                        <input
                          type="url"
                          name="imageUrl"
                          value={facilityForm.imageUrl}
                          onChange={handleFacilityInputChange}
                          placeholder="https://… (shown when someone scans the booking QR)"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-base text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                        />
                        <p className="text-xs text-slate-500">
                          Use a direct link to an image (HTTPS). It appears on the public check-in page after scanning
                          the QR code for an approved booking.
                        </p>
                      </label>

                      <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                        <button
                          type="submit"
                          className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          {editingFacilityId ? "Update Facility" : "Save Facility"}
                        </button>
                        <button
                          type="button"
                          onClick={handleFacilityClear}
                          className="rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                        <span className="text-xs text-slate-500">
                          You can edit or delete from the Existing Facilities section.
                        </span>
                      </div>

                      {facilitySaveMessage ? (
                        <p
                          className={`text-sm font-medium ${
                            facilitySaveMessageType === "error" ? "text-red-300" : "text-emerald-300"
                          }`}
                        >
                          {facilitySaveMessage}
                        </p>
                      ) : null}
                      </form>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/60 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-white">Existing Facilities</h4>
                        <span className="text-xs text-slate-500">
                          {facilities.length} {facilities.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      {isFacilitiesLoading ? (
                        <p className="mt-3 text-sm text-slate-400">Loading facilities...</p>
                      ) : facilities.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4">
                          <p className="text-sm text-slate-300">No facilities added yet.</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Open Add Facilities to create your first facility.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-3">
                          {facilities.map((facility) => (
                            <article
                              key={facility.id}
                              className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4"
                            >
                              <p className="text-sm font-semibold text-cyan-200">{facility.type}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                Capacity: {facility.capacity || "N/A"} • Location: {facility.location}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Availability: {facility.availableFrom} - {facility.availableTo}
                              </p>
                              <p className="mt-1 text-xs font-medium text-slate-300">
                                Status: {facility.status}
                              </p>
                              {facility.audience ? (
                                <p className="mt-1 text-xs font-medium text-slate-300">
                                  User Type: {facility.audience}
                                </p>
                              ) : null}
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddFacilityFormOpen(true);
                                    handleFacilityEdit(facility);
                                  }}
                                  className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFacilityDelete(facility.id)}
                                  className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                                >
                                  Delete
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {modal === "manage-bookings" && <AdminManageBookings user={user} />}

              {modal === "maintenance" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Oversee all maintenance and incident tickets across campus. Open the{" "}
                    <Link to="/maintenance" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Maintenance
                    </Link>{" "}
                    page for the shared campus view used by technicians and reporters.
                  </p>
                  <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                    No tickets in this panel (demo).
                  </div>
                </div>
              )}

              {modal === "contact-messages" && (
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    Review and manage submissions from the{" "}
                    <Link to="/contact" className="font-medium text-cyan-400 hover:text-cyan-300">
                      Contact Us
                    </Link>{" "}
                    form. Assign ownership, mark priority, and track follow-up actions from this
                    queue when your backend API is connected.
                  </p>

                  {contactMessages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-950/50 p-8 text-center text-slate-500">
                      No contact messages yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((msg) => (
                        <article
                          key={msg.id}
                          className="rounded-xl border border-slate-600/50 bg-slate-950/50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{msg.subject}</p>
                            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-medium text-cyan-200">
                              {msg.status || "NEW"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {msg.name} • {msg.email} • {msg.phone}
                          </p>
                          <p className="mt-2 text-sm text-slate-300">{msg.message}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            Received: {formatDateTime(msg.createdAt)}
                          </p>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => setSelectedMessageId(msg.id)}
                              className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/10"
                            >
                              View
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  {selectedMessage ? (
                    <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Message details: {selectedMessage.subject}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {selectedMessage.name} • {selectedMessage.email} • {selectedMessage.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMessageId(null)}
                          className="text-xs font-medium text-slate-400 transition hover:text-slate-200"
                        >
                          Close
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">{selectedMessage.message}</p>
                      <p className="mt-3 text-xs text-slate-500">
                        Received: {formatDateTime(selectedMessage.createdAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {modal === "settings" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Demo: personal notification toggles below. In production, add system-wide access
                    controls and policy settings here.
                  </p>
                  <StudentSettingsForm />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}