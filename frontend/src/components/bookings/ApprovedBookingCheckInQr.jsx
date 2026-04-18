import { useCallback, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../ToastProvider.jsx";
import { buildBookingConfirmationQrPlainText } from "../../utils/bookingQrPlainText.js";

/**
 * QR encodes plain text (not a URL) so scanning shows a confirmation note on the device.
 * @param {object} props
 * @param {Record<string, unknown>} props.bookingRaw API booking row
 * @param {Record<string, unknown>|null|undefined} props.user signed-in user
 * @param {'student'|'lecturer'|'technician'} [props.audience]
 */
export default function ApprovedBookingCheckInQr({ bookingRaw, user, audience = "student" }) {
  const { showToast } = useToast();
  const qrValue = useMemo(() => buildBookingConfirmationQrPlainText(bookingRaw, user), [bookingRaw, user]);
  const ring = audience === "lecturer" ? "border-violet-500/35" : "border-cyan-500/35";
  const [copyState, setCopyState] = useState("idle");

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopyState("copied");
      showToast("Confirmation text copied to clipboard.", { variant: "success" });
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
      showToast("Could not copy — try again or scan the QR to read the confirmation on your device.", {
        variant: "error",
      });
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [qrValue, showToast]);

  return (
    <div className={`inline-flex max-w-[min(100%,20rem)] flex-col items-stretch rounded-xl border ${ring} bg-slate-900/40 p-2.5`}>
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Booking confirmation QR
      </p>

      <div className="mx-auto flex aspect-square w-40 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-inner">
        <QRCodeCanvas
          value={qrValue}
          size={128}
          level="M"
          marginSize={2}
          includeMargin
          bgColor="#ffffff"
          fgColor="#000000"
          className="max-h-full max-w-full [image-rendering:crisp-edges]"
        />
      </div>

      <button
        type="button"
        onClick={() => void copyText()}
        className="mt-3 rounded-lg border border-slate-600 bg-slate-800/80 px-2 py-1.5 text-[10px] font-semibold text-cyan-200 transition hover:border-cyan-500/50 hover:bg-slate-800"
      >
        {copyState === "copied" ? "Copied!" : copyState === "fail" ? "Copy failed" : "Copy confirmation text"}
      </button>

      <p className="mt-2 text-center text-[10px] leading-snug text-slate-500">
        Scanning this code does not open a website — most camera apps show the text as a preview (no network required).
      </p>
    </div>
  );
}
