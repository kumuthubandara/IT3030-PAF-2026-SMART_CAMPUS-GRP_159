import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(undefined);

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ToastItem({ id, message, variant, onDismiss }) {
  const ring =
    variant === "success"
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
      : variant === "error"
        ? "border-red-500/40 bg-red-500/15 text-red-100"
        : "border-cyan-500/35 bg-slate-900/95 text-slate-100";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${ring}`}
    >
      <p className="flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const id = nextId();
      const variant = options.variant ?? "info";
      setToasts((prev) => [...prev, { id, message, variant }]);
      const ms = typeof options.duration === "number" ? options.duration : 4500;
      if (ms > 0) {
        setTimeout(() => removeToast(id), ms);
      }
      return id;
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast: removeToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
