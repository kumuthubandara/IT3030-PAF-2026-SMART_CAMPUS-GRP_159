import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCheckInVerification } from "./services/checkInApi.js";

function VenuePhoto({ url, alt }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-600/60 bg-slate-800/50">
      <img
        src={url}
        alt={alt || "Venue"}
        className="max-h-56 w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function formatInstant(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CheckInPage() {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      setData(null);
      try {
        const decoded = bookingId ? decodeURIComponent(bookingId) : "";
        if (!decoded) {
          throw new Error("Missing booking reference.");
        }
        const res = await fetchCheckInVerification(decoded);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load verification.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 font-sans text-slate-200 antialiased">
      <div className="mx-auto max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
          Smart Campus
        </p>
        <h1 className="mt-2 text-center font-heading text-2xl font-bold text-white">Booking check-in</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Read-only verification for staff at the venue.</p>

        <div className="mt-8 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-6 shadow-xl">
          {loading ? <p className="text-center text-sm text-slate-400">Loading…</p> : null}
          {!loading && error ? (
            <div className="space-y-3 text-center">
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                {error}
              </p>
              <Link to="/" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                Back to home
              </Link>
            </div>
          ) : null}
          {!loading && data ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">Verified</p>
                <p className="mt-1 text-sm text-emerald-100/90">This reservation is approved in the system.</p>
              </div>
              <VenuePhoto url={data.imageUrl} alt={data.roomName || "Booked resource"} />
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Resource</dt>
                  <dd className="mt-0.5 font-semibold text-white">{data.roomName || "—"}</dd>
                </div>
                {data.resourceType ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</dt>
                    <dd className="mt-0.5 text-slate-300">{data.resourceType}</dd>
                  </div>
                ) : null}
                {data.location ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
                    <dd className="mt-0.5 text-slate-300">{data.location}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Start</dt>
                  <dd className="mt-0.5 text-slate-300">{formatInstant(data.startDateTime)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">End</dt>
                  <dd className="mt-0.5 text-slate-300">{formatInstant(data.endDateTime)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reference</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-slate-400">{data.bookingId}</dd>
                </div>
              </dl>
              <div className="border-t border-slate-700/80 pt-4 text-center">
                <Link to="/" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
                  Back to home
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
