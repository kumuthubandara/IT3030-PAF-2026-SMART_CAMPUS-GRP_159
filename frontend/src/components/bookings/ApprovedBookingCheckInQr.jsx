import { useCallback, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../ToastProvider.jsx";
import { buildCheckInPageUrl } from "../../utils/checkInUrl.js";

/**
 * @param {object} props
 * @param {string} props.bookingId
 * @param {'student'|'lecturer'|'technician'} [props.audience]
 */
export default function ApprovedBookingCheckInQr({ bookingId, audience = "student" }) {
  const { showToast } = useToast();
  const url = buildCheckInPageUrl(bookingId);
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
