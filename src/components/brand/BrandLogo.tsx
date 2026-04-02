"use client";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "light";
}) {
  const gradient =
    tone === "light"
      ? "linear-gradient(180deg, rgb(var(--color-parchment)) 0%, rgb(var(--color-parchment-warm)) 100%)"
      : "linear-gradient(180deg, rgb(var(--color-gold-light)) 0%, rgb(var(--color-gold)) 45%, rgb(var(--color-gold-dark)) 100%)";

  return (
    <div
      className={cn("relative h-8 w-7 shrink-0", className)}
      aria-hidden="true"
    >
      <span
        className="block h-full w-full"
        style={{
          background: gradient,
          WebkitMaskImage: "url('/brand/prologue-mark.png')",
          maskImage: "url('/brand/prologue-mark.png')",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          filter: "drop-shadow(0 1px 1px rgba(26,20,8,0.12))",
        }}
      />
    </div>
  );
}

export function BrandLogo({
  className,
  textClassName,
  markClassName,
}: {
  className?: string;
  textClassName?: string;
  markClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-parchment-deep/70 bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <BrandMark className={cn("h-6 w-5", markClassName)} />
      </div>
      <span className={cn("font-serif text-base font-semibold tracking-tight text-ink", textClassName)}>
        Prologue
      </span>
    </div>
  );
}
