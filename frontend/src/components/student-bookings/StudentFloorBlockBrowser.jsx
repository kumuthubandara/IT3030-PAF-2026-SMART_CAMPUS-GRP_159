import { useState } from "react";
import {
  lectureHallBuildings,
  computerLabBuildings,
  mainBuildingFloors,
  newBuildingFloors,
  labMainBuildingFloors,
  labNewBuildingFloors,
  mainBuildingBlockTabs,
  newBuildingBlockTabs,
  floorBlockPanelCopy,
  normalizeBuildingName,
  extractFloorNumber,
  extractCodeFromResource,
  getResourceKind,
  formatUnitCount,
  getResourceDetailRows,
  getStatusMeta,
} from "../facilities/facilityBrowseCore.js";

function getBuildingAvailabilityLabel(buildingName, spaceKind, apiResources) {
  const normalizedBuilding = normalizeBuildingName(buildingName);
  const count = apiResources.filter((resource) => {
    const kind = getResourceKind(resource.type);
    if (spaceKind === "lecture" && kind !== "lecture") return false;
    if (spaceKind === "lab" && kind !== "lab") return false;
    return normalizeBuildingName(resource.building) === normalizedBuilding;
  }).length;
  return formatUnitCount(count, spaceKind === "lab" ? "labs" : "halls");
}

/**
 * Student booking UI: building → floor → block → room cards (matches Facilities lecture/lab flow, cyan accents).
 * @param {{ resources: object[], spaceKind: 'lecture'|'lab', onBookNow: (r: object) => void }} props
 */
export default function StudentFloorBlockBrowser({ resources, spaceKind, onBookNow }) {
  const facilityBuildings = spaceKind === "lab" ? computerLabBuildings : lectureHallBuildings;
  const [activeFacilityBuilding, setActiveFacilityBuilding] = useState(facilityBuildings[0].name);
  const [floorBlocksModalFloor, setFloorBlocksModalFloor] = useState(null);
  const [floorBlocksModalBuilding, setFloorBlocksModalBuilding] = useState(null);
  const [activeFloorBlockTab, setActiveFloorBlockTab] = useState(mainBuildingBlockTabs[0].label);

  const mainFloorsForModal = spaceKind === "lab" ? labMainBuildingFloors : mainBuildingFloors;
  const newFloorsForModal = spaceKind === "lab" ? labNewBuildingFloors : newBuildingFloors;

  const selectedFacilityBuilding =
    facilityBuildings.find((b) => b.name === activeFacilityBuilding) ?? facilityBuildings[0];

  const floorModalBlockTabs =
    floorBlocksModalBuilding === "new" ? newBuildingBlockTabs : mainBuildingBlockTabs;

  const floorBlockPanel =
    floorBlocksModalFloor != null && floorBlocksModalBuilding != null
      ? floorBlockPanelCopy(floorBlocksModalFloor, activeFloorBlockTab, floorBlocksModalBuilding, spaceKind)
      : null;

  const managedRoomNumbers =
    floorBlocksModalFloor && floorBlocksModalBuilding
      ? resources
          .filter((resource) => {
            const resourceType = String(resource.type ?? "").toLowerCase();
            const expectedType = spaceKind === "lab" ? "computer lab" : "lecture hall";
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

  const displayedRoomNumbers = [...managedRoomNumbers].filter(
    (room, index, list) => list.findIndex((c) => c.code === room.code) === index,
  );

  const selectedBlockResourceCount =
    floorBlocksModalFloor && floorBlocksModalBuilding
      ? resources.filter((resource) => {
          const kind = getResourceKind(resource.type);
          if (spaceKind === "lab" && kind !== "lab") return false;
          if (spaceKind === "lecture" && kind !== "lecture") return false;
          const selectedBuilding = floorBlocksModalBuilding === "main" ? "main building" : "new building";
          if (normalizeBuildingName(resource.building) !== selectedBuilding) return false;
          if (String(resource.floor ?? "").trim() !== extractFloorNumber(floorBlocksModalFloor)) return false;
          return (
            String(resource.block ?? "").trim().toUpperCase() === activeFloorBlockTab.charAt(0).toUpperCase()
          );
        }).length
      : 0;

  const title = spaceKind === "lab" ? "Computer labs" : "Lecture halls";

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 shadow-sm sm:p-6">
      <h3 className="font-heading text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        {spaceKind === "lab"
          ? "Select a building, then a floor and block, then book an available lab."
          : "Select a building, then a floor and block, then book an available lecture hall."}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
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
                  ? "border-cyan-300/70 bg-cyan-500/20 text-cyan-50"
                  : "border-cyan-500/30 text-cyan-200 hover:border-cyan-400/50 hover:text-white"
              }`}
            >
              {building.name}
            </button>
          );
        })}
      </div>

      <article className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-950/70 p-6 shadow-sm">
        <h4 className="font-heading text-lg font-semibold text-cyan-200">{selectedFacilityBuilding.name}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{selectedFacilityBuilding.description}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-300/90">
          {getBuildingAvailabilityLabel(selectedFacilityBuilding.name, spaceKind, resources)}
        </p>

        {activeFacilityBuilding === "Main building" ? (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Floors</p>
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
                  className="rounded-xl border border-cyan-500/25 bg-slate-900/90 px-4 py-4 text-left shadow-sm transition hover:border-cyan-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                >
                  <p className="font-heading text-base font-semibold text-white">{floor.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{floor.detail}</p>
                </button>
              ))}
            </div>
          </div>
        ) : activeFacilityBuilding === "New building" ? (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Floors (2–13)</p>
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
                  className="rounded-xl border border-cyan-500/25 bg-slate-900/90 px-4 py-4 text-left shadow-sm transition hover:border-cyan-400/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                >
                  <p className="font-heading text-base font-semibold text-white">{floor.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{floor.detail}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </article>

      {floorBlocksModalFloor && floorBlocksModalBuilding ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-cyan-500/25 bg-slate-900 shadow-2xl shadow-cyan-950/40">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-5 py-4 sm:px-7">
              <h3 className="font-heading text-2xl font-semibold text-white">{floorBlocksModalFloor}</h3>
              <button
                type="button"
                onClick={() => {
                  setFloorBlocksModalFloor(null);
                  setFloorBlocksModalBuilding(null);
                }}
                className="rounded-full border border-cyan-500/30 px-3 py-1 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/60 hover:text-cyan-50"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <p className="text-sm text-slate-400">
                {spaceKind === "lab"
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
                          ? "border-cyan-300/70 bg-cyan-500/20 text-cyan-50"
                          : "border-cyan-500/30 text-cyan-200 hover:border-cyan-400/50 hover:text-white"
                      }`}
                    >
                      {block.label}
                    </button>
                  );
                })}
              </div>

              {floorBlockPanel ? (
                <article className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-950/70 p-6 shadow-sm">
                  <h4 className="font-heading text-lg font-semibold text-cyan-200">{floorBlockPanel.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{floorBlockPanel.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-300/90">
                    {formatUnitCount(selectedBlockResourceCount, spaceKind === "lab" ? "labs" : "halls")}
                  </p>
                </article>
              ) : null}

              {displayedRoomNumbers.length > 0 ? (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {spaceKind === "lab" ? "Lab numbers" : "Lecture hall numbers"}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {displayedRoomNumbers.map((room) => (
                      <div
                        key={room.code}
                        className="rounded-xl border border-cyan-500/25 bg-slate-950/70 px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-heading text-lg font-semibold text-cyan-100">{room.code}</p>
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
                        {room.resource ? (
                          <button
                            type="button"
                            disabled={!getStatusMeta(room.resource.status).isBookable}
                            onClick={() => {
                              if (getStatusMeta(room.resource.status).isBookable) {
                                onBookNow?.(room.resource);
                              }
                            }}
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
                  {spaceKind === "lab" ? "No computer labs match this floor and block yet." : "No lecture halls match this floor and block yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
