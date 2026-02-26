"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ToastVariant = "info" | "success" | "error";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type ShowToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function toastClasses(variant: ToastVariant) {
  if (variant === "error") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (variant === "success") {
    return "border-green-200 bg-green-50 text-green-800";
  }

  return "border-zinc-200 bg-white text-zinc-800";
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full rounded-lg border px-4 py-3 shadow-sm ${toastClasses(toast.variant)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-xs font-semibold opacity-70 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = ({
    message,
    variant = "info",
    durationMs = 3500,
  }: ShowToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, variant, durationMs }]);
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
