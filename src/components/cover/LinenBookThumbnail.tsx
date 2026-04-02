"use client";

import Image from "next/image";
import type { CoverStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

export type LinenCoverOption = {
  id: CoverStyle;
  label: string;
  description: string;
  bg: string;
  edge: string;
  titleColor: string;
  subtitleColor: string;
  authorColor: string;
};

export const LINEN_COVER_OPTIONS: LinenCoverOption[] = [
  {
    id: "minimal",
    label: "Pearl",
    description: "Soft ivory with warm editorial type.",
    bg: "#f4f2ed",
    edge: "#d8d3c9",
    titleColor: "#9d8a5d",
    subtitleColor: "#6d6558",
    authorColor: "#4b463f",
  },
  {
    id: "classic",
    label: "Slate",
    description: "Cool stone white with deep graphite type.",
    bg: "#eceff3",
    edge: "#cfd6df",
    titleColor: "#5f6f86",
    subtitleColor: "#5e6673",
    authorColor: "#353b45",
  },
  {
    id: "ethereal",
    label: "Sage Mist",
    description: "Muted sage paper with grounded neutral text.",
    bg: "#edf1eb",
    edge: "#d0d8cf",
    titleColor: "#6f7e6f",
    subtitleColor: "#5d665c",
    authorColor: "#424a43",
  },
  {
    id: "bold",
    label: "Blush Sand",
    description: "Warm blush white with rich cocoa lettering.",
    bg: "#f2ece8",
    edge: "#dbcfc8",
    titleColor: "#8a6b58",
    subtitleColor: "#675b52",
    authorColor: "#463e39",
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

type CoverVariant = "mini" | "card" | "builder";

type LinenBookThumbnailProps = {
  title: string;
  style: CoverStyle;
  subtitle?: string;
  author?: string;
  imageUrl?: string;
  className?: string;
  variant?: CoverVariant;
};

export function LinenBookThumbnail({
  title,
  style,
  subtitle,
  author,
  imageUrl,
  className,
  variant = "card",
}: LinenBookThumbnailProps) {
  const palette = getLinenCoverOption(style);
  const displayTitle = title.trim() || "Untitled Manuscript";
  const displaySubtitle =
    subtitle?.trim() || (variant === "builder" ? "A manuscript in progress" : "");
  const displayAuthor = author?.trim() || "";

  const titleClassName =
    variant === "mini"
      ? "text-[6.3px] leading-[1.08]"
      : variant === "card"
        ? "text-[8.2px] leading-[1.08]"
        : "text-[14px] leading-[1.02] sm:text-[16px]";
  const subtitleClassName =
    variant === "builder" ? "text-[8px] leading-[1.2]" : "text-[5.6px] leading-[1.2]";
  const authorClassName =
    variant === "builder" ? "text-[8.6px] tracking-[0.13em]" : "text-[5.8px] tracking-[0.12em]";

  return (
    <div className={cn("relative overflow-visible", className)}>
      <div className="absolute -bottom-[5%] left-[14%] right-[5%] h-[10.5%] rounded-full bg-black/28 blur-[4px] opacity-40" />
      <div className="relative h-full w-full">
        <div
          className="absolute inset-y-[4%] left-0 w-[6.2%] rounded-l-[4px] border border-black/10"
          style={{
            background: `linear-gradient(180deg, ${palette.edge} 0%, #f6f6f6 38%, ${palette.edge} 100%)`,
          }}
        />
        <div
          className="relative ml-[5.8%] h-full w-[94.2%] overflow-hidden rounded-[6px] border border-black/12 shadow-[0_12px_20px_-12px_rgba(0,0,0,0.55)]"
          style={{
            background: `linear-gradient(164deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.18) 100%), ${palette.bg}`,
          }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-cover opacity-12 mix-blend-multiply"
            />
          )}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(rgba(110,100,90,0.12) 0.7px, transparent 0.7px)",
              backgroundSize: "4px 4px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.42), inset 0 -24px 38px rgba(0,0,0,0.07)",
            }}
          />

          <div className="absolute inset-x-[10%] top-[29%] text-center">
            <p className={cn("line-clamp-3 font-serif font-medium", titleClassName)} style={{ color: palette.titleColor }}>
              {displayTitle}
            </p>
          </div>

          {(variant === "builder" || variant === "card") && displaySubtitle && (
            <p
              className={cn("absolute inset-x-[12%] top-[66%] text-center font-sans", subtitleClassName)}
              style={{ color: palette.subtitleColor }}
            >
              {displaySubtitle}
            </p>
          )}

          {(variant === "builder" || variant === "card") && displayAuthor && (
            <p
              className={cn(
                "absolute inset-x-[10%] bottom-[9%] truncate text-center font-sans font-medium uppercase",
                authorClassName
              )}
              style={{ color: palette.authorColor }}
            >
              {displayAuthor}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
