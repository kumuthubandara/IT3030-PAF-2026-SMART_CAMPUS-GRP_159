/** Matches backend bookable check: type string contains "equipment" (case-insensitive). */
export function isEquipmentResourceType(type) {
  return String(type ?? "")
    .trim()
    .toLowerCase()
    .includes("equipment");
}
