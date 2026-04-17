const STYLES = {
  PENDING: "bg-amber-500/15 text-amber-200 border border-amber-500/40",
  APPROVED: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40",
  REJECTED: "bg-red-500/15 text-red-200 border border-red-500/40",
  CANCELLED: "bg-slate-600/40 text-slate-300 border border-slate-500/50",
};

function normalizeStatus(status) {
  const s = String(status ?? "")
    .trim()
    .toUpperCase();
  if (STYLES[s]) return s;
  return "PENDING";
}

export default function BookingStatusBadge({ status }) {
  const key = normalizeStatus(status);
  const label = key === "APPROVED" ? "APPROVED" : key;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[key]}`}
    >
      {label}
    </span>
  );
}
