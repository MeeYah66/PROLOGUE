"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "error";

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 3200;
const MAX_TOASTS = 3;

const ToastContext = createContext<ToastContextValue | null>(null);

function iconFor(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return CheckCircle2;
    case "error":
      return CircleAlert;
    default:
      return Info;
  }
}

function toastClasses(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "border-gold/35 bg-parchment text-ink";
    case "error":
      return "border-red-500/35 bg-parchment text-ink";
    default:
      return "border-parchment-deep bg-parchment text-ink";
  }
}

function iconClasses(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "text-gold-dark";
    case "error":
      return "text-red-500";
    default:
      return "text-ink-muted";
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timerId = timers.current[id];
    if (timerId) {
      window.clearTimeout(timerId);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = DEFAULT_DURATION_MS }: ToastInput) => {
      if (!title.trim()) return;

      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const message: ToastMessage = {
        id,
        title: title.trim(),
        description: description?.trim(),
        variant,
        duration,
      };

      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), message]);
      timers.current[id] = window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[120] flex w-[min(92vw,360px)] flex-col gap-2 md:right-5 md:top-5">
        {toasts.map((item) => {
          const Icon = iconFor(item.variant);
          return (
            <div
              key={item.id}
              role="status"
              aria-live="polite"
              className={cn(
                "pointer-events-auto rounded-xl border px-3.5 py-3 shadow-[0px_6px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-200",
                toastClasses(item.variant)
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClasses(item.variant))} strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug">{item.title}</p>
                  {item.description && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(item.id)}
                  className="rounded-md p-0.5 text-ink-faint transition-colors hover:bg-parchment-warm hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

