export default function AdminBookingFilters({
  draft,
  onDraftChange,
  onApply,
  onReset,
  disabled,
  equipmentOnly,
  variant = "default",
  hideHeading = false,
  embedded = false,
}) {
  const panel = embedded
    ? "p-0 pt-1"
    : variant === "lecturerPanel"
      ? "rounded-xl border border-violet-500/15 bg-slate-950/50 p-4"
      : "rounded-xl border border-cyan-500/15 bg-slate-950/50 p-4";
  const heading = variant === "lecturerPanel" ? "text-violet-300/90" : "text-slate-500";
  const applyBtn =
    variant === "lecturerPanel"
      ? "rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
      : "rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50";

  return (
    <div className={panel}>
      {!hideHeading ? (
        <p className={`text-xs font-semibold uppercase tracking-wide ${heading}`}>Filters</p>
      ) : null}
      {equipmentOnly ? (
        <p className="mt-2 text-xs text-slate-500">
          Resource type is fixed to{" "}
          <strong className={variant === "lecturerPanel" ? "text-violet-200" : "text-slate-300"}>equipment</strong>{" "}
          (matches any type name containing &quot;equipment&quot;).
        </p>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs text-slate-400">
          Status
          <select
            value={draft.status}
            onChange={(e) => onDraftChange({ ...draft, status: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-slate-100"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
        {!equipmentOnly ? (
        <label className="block text-xs text-slate-400">
          Resource type (contains)
          <input
            type="text"
            value={draft.resourceType}
            onChange={(e) => onDraftChange({ ...draft, resourceType: e.target.value })}
            disabled={disabled}
            placeholder="e.g. Meeting"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
        </label>
        ) : null}
        <label className="block text-xs text-slate-400">
          Date (overlap)
          <input
            type="date"
            value={draft.date}
            onChange={(e) => onDraftChange({ ...draft, date: e.target.value })}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-slate-100"
          />
        </label>
        <label className="block text-xs text-slate-400">
          Requester (name or email)
          <input
            type="text"
            value={draft.requester}
            onChange={(e) => onDraftChange({ ...draft, requester: e.target.value })}
            disabled={disabled}
            placeholder="e.g. @sliit or Silva"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
        </label>
        <label className="block text-xs text-slate-400 sm:col-span-2 lg:col-span-2">
          Location (contains)
          <input
            type="text"
            value={draft.location}
            onChange={(e) => onDraftChange({ ...draft, location: e.target.value })}
            disabled={disabled}
            placeholder="e.g. New Building"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={disabled} onClick={onApply} className={applyBtn}>
          Apply filters
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
