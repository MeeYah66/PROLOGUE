"use client";

import Image from "next/image";
import type { CoverStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

export type LinenCoverOption = {
  id: CoverStyle;
  label: string;
  description: string;
  bg: string;
  accent: string;
  foil: string;
  spine: string;
  vignette: string;
};

export const LINEN_COVER_OPTIONS: LinenCoverOption[] = [
  {
    id: "minimal",
    label: "Ivory Linen",
    description: "Warm parchment cloth with soft bronze foil.",
    bg: "#e7dfcc",
    accent: "#5a4c34",
    foil: "#9f8758",
    spine: "#d7cab0",
    vignette: "rgba(90,76,52,0.2)",
  },
  {
    id: "classic",
    label: "Midnight Linen",
    description: "Deep blue cloth with champagne foil trim.",
    bg: "#2c3548",
    accent: "#f3ebd7",
    foil: "#c4a974",
    spine: "#232b3c",
    vignette: "rgba(10,14,24,0.38)",
  },
  {
    id: "ethereal",
    label: "Forest Cloth",
    description: "Muted evergreen with antique gold accents.",
    bg: "#324b45",
    accent: "#f0e8d2",
    foil: "#bea169",
    spine: "#273c37",
    vignette: "rgba(18,33,29,0.34)",
  },
  {
    id: "bold",
    label: "Merlot Cloth",
    description: "Rich burgundy with warm metallic detailing.",
    bg: "#5d333b",
    accent: "#f5eddf",
    foil: "#d0ae78",
    spine: "#4b282f",
    vignette: "rgba(38,12,19,0.34)",
  },
];

const LINEN_COVER_MAP: Record<CoverStyle, LinenCoverOption> = LINEN_COVER_OPTIONS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CoverStyle, LinenCoverOption>
);

export function getLinenCoverOption(style: CoverStyle): LinenCoverOption {
  return LINEN_COVER_MAP[style] ?? LINEN_COVER_OPTIONS[0];
}

type LinenBookThumbnailProps = {
  title: string;
  style: CoverStyle;
  imageUrl?: string;
  className?: string;
  variant?: "mini" | "card";
};

export function LinenBookThumbnail({
  title,
  style,
  imageUrl,
  className,
  variant = "card",
}: LinenBookThumbnailProps) {
  const palette = getLinenCoverOption(style);
  const displayTitle = title.trim() || "Untitled Manuscript";
  const titleClassName =
    variant === "mini"
      ? "text-[6.5px] leading-[1.2] tracking-[0.05em]"
      : "text-[8px] leading-[1.2] tracking-[0.055em]";

  return (
    <div className={cn("relative overflow-visible", className)}>
      <div className="absolute -bottom-[5%] left-[14%] right-[4%] h-[11%] rounded-full bg-black/35 blur-[4px] opacity-35" />
      <div className="relative h-full w-full">
        <div
          className="absolute inset-y-[4.5%] left-0 w-[9%] rounded-l-[4px] border border-black/15"
          style={{
            background: `linear-gradient(180deg, ${palette.spine} 0%, ${palette.bg} 45%, ${palette.spine} 100%)`,
          }}
        />
        <div
          className="relative ml-[8%] h-full w-[92%] overflow-hidden rounded-[6px] border border-black/15 shadow-[0_12px_18px_-10px_rgba(0,0,0,0.62)]"
          style={{ backgroundColor: palette.bg }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-cover opacity-55 mix-blend-multiply"
            />
          )}
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 0.8px, transparent 0.8px)",
              backgroundSize: "3px 3px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.28), inset 0 -34px 60px ${palette.vignette}` }}
          />
          <div className="absolute inset-[8%] rounded-[4px] border" style={{ borderColor: palette.foil, opacity: 0.85 }} />
          <div className="absolute inset-[13%] rounded-[3px] border" style={{ borderColor: palette.foil, opacity: 0.52 }} />
          <div
            className="absolute left-1/2 top-[9%] h-[22%] w-[74%] -translate-x-1/2 rounded-t-full border-x border-t"
            style={{ borderColor: palette.foil, opacity: 0.66 }}
          />
          <div
            className="absolute left-1/2 top-[39%] h-px w-[67%] -translate-x-1/2"
            style={{ backgroundColor: palette.foil, opacity: 0.55 }}
          />
          <div className="absolute inset-x-[14%] top-[43%]">
            <p
              className={cn(
                "line-clamp-3 text-center font-serif font-medium uppercase",
                titleClassName
              )}
              style={{ color: palette.accent }}
            >
              {displayTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

