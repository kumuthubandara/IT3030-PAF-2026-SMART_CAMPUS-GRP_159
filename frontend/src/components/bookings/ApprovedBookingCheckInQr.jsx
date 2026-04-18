import { useCallback, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../ToastProvider.jsx";
import { buildCheckInPageUrl, checkInUrlIsLocalhostOnly } from "../../utils/checkInUrl.js";

/**
 * @param {object} props
 * @param {string} props.bookingId
 * @param {'student'|'lecturer'|'technician'} [props.audience]
 */
export default function ApprovedBookingCheckInQr({ bookingId, audience = "student" }) {
  const { showToast } = useToast();
  const url = buildCheckInPageUrl(bookingId);
  const localhostQr = checkInUrlIsLocalhostOnly(url);
  const ring = audience === "lecturer" ? "border-violet-500/35" : "border-cyan-500/35";
  const [copyState, setCopyState] = useState("idle");

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      showToast("Check-in link copied to clipboard.", { variant: "success" });
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
      showToast("Could not copy — select the URL and copy manually.", { variant: "error" });
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [url]);

  return (
    <div className={`inline-flex max-w-[min(100%,16rem)] flex-col items-stretch rounded-xl border ${ring} bg-slate-900/40 p-2.5`}>
      {localhostQr ? (
        <p className="mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[9px] leading-snug text-amber-100">
          <span className="font-semibold text-amber-200">Phone scan:</span> this link uses{" "}
          <span className="font-mono">localhost</span> — your phone opens its own device, not this PC. In{" "}
          <span className="font-mono">frontend/.env</span> set{" "}
          <span className="break-all font-mono text-amber-50/90">VITE_PUBLIC_APP_ORIGIN=http://192.168.x.x:5173</span>{" "}
          (same Wi‑Fi), restart <span className="font-mono">npm run dev</span>, then open this QR again.
        </p>
      ) : null}
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Check-in QR
      </p>

      <div className="mx-auto flex aspect-square w-36 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-inner">
        <QRCodeCanvas
          value={url}
          size={112}
          level="H"
          marginSize={3}
          includeMargin
          bgColor="#ffffff"
          fgColor="#000000"
          className="max-h-full max-w-full [image-rendering:crisp-edges]"
        />
      </div>

      <p className="mt-2 break-all text-center font-mono text-[9px] leading-tight text-slate-500">{url}</p>

      <button
        type="button"
        onClick={() => void copyLink()}
        className="mt-2 rounded-lg border border-slate-600 bg-slate-800/80 px-2 py-1.5 text-[10px] font-semibold text-cyan-200 transition hover:border-cyan-500/50 hover:bg-slate-800"
      >
        {copyState === "copied" ? "Copied!" : copyState === "fail" ? "Copy failed — select URL above" : "Copy check-in link"}
      </button>

      <p className="mt-2 text-center text-[10px] leading-snug text-slate-500">
        Staff scan opens verification. If the camera will not read the code, use Copy and open the link on the device
        that can reach this app.
      </p>
    </div>
  );
}
