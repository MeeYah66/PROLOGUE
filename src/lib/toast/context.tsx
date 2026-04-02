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
  phase: "enter" | "open" | "exit";
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 3200;
const MAX_TOASTS = 3;
const EXIT_DURATION_MS = 220;

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
  const autoTimers = useRef<Record<string, number>>({});
  const removeTimers = useRef<Record<string, number>>({});
  const animationFrames = useRef<number[]>([]);
  const dismissing = useRef<Record<string, boolean>>({});

  const clearToastTimers = useCallback((id: string) => {
    const autoTimerId = autoTimers.current[id];
    if (autoTimerId) {
      window.clearTimeout(autoTimerId);
      delete autoTimers.current[id];
    }

    const removeTimerId = removeTimers.current[id];
    if (removeTimerId) {
      window.clearTimeout(removeTimerId);
      delete removeTimers.current[id];
    }
  }, []);

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      clearToastTimers(id);
      delete dismissing.current[id];
    },
    [clearToastTimers]
  );

  const dismiss = useCallback((id: string) => {
    if (dismissing.current[id]) return;
    dismissing.current[id] = true;

    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, phase: "exit" } : toast))
    );

    const autoTimerId = autoTimers.current[id];
    if (autoTimerId) {
      window.clearTimeout(autoTimerId);
      delete autoTimers.current[id];
    }

    removeTimers.current[id] = window.setTimeout(() => {
      removeToast(id);
    }, EXIT_DURATION_MS);
  }, [removeToast]);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = DEFAULT_DURATION_MS }: ToastInput) => {
      if (!title.trim()) return;

      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const safeDuration = Number.isFinite(duration)
        ? Math.max(1000, Math.floor(duration))
        : DEFAULT_DURATION_MS;
      const message: ToastMessage = {
        id,
        title: title.trim(),
        description: description?.trim(),
        variant,
        duration: safeDuration,
        phase: "enter",
      };

      setToasts((prev) => {
        const next = [...prev, message];
        if (next.length <= MAX_TOASTS) return next;

        const dropped = next.slice(0, next.length - MAX_TOASTS);
        dropped.forEach((item) => {
          clearToastTimers(item.id);
          delete dismissing.current[item.id];
        });
        return next.slice(-MAX_TOASTS);
      });

      const rafId = window.requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, phase: "open" } : item))
        );
      });
      animationFrames.current.push(rafId);

      autoTimers.current[id] = window.setTimeout(() => dismiss(id), safeDuration);
    },
    [clearToastTimers, dismiss]
  );

  useEffect(() => {
    return () => {
      Object.values(autoTimers.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      Object.values(removeTimers.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      animationFrames.current.forEach((frameId) => {
        window.cancelAnimationFrame(frameId);
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
                "toast-surface pointer-events-auto relative overflow-hidden rounded-xl border px-3.5 py-3 backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px]",
                item.phase === "enter" && "toast-enter",
                item.phase === "open" && "toast-open",
                item.phase === "exit" && "toast-exit",
                toastClasses(item.variant)
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={cn("toast-icon-pop mt-0.5 h-4 w-4 shrink-0", iconClasses(item.variant))} strokeWidth={1.8} />
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
              <div
                aria-hidden
                className={cn(
                  "toast-progress absolute inset-x-0 bottom-0 h-[2px] origin-left",
                  item.variant === "success"
                    ? "bg-gold/80"
                    : item.variant === "error"
                      ? "bg-red-400/80"
                      : "bg-ink/45"
                )}
                style={{ animationDuration: `${item.duration}ms` }}
              />
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
