"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Trash2, Pencil, Copy, ArrowRight, Plus } from "lucide-react";
import type { Book } from "@/lib/types";
import { cn, totalWordCount, progressPercent } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookCardProps {
  book: Book;
  onDelete?: (id: string) => void;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1)  return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  if (d < 7)  return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS: Record<string, { dot: string; label: string }> = {
  draft:     { dot: "bg-amber-400",   label: "Draft" },
  ongoing:   { dot: "bg-sage",        label: "In progress" },
  completed: { dot: "bg-emerald-400", label: "Complete" },
};

// ─── 3-D Book Cover ───────────────────────────────────────────────────────────
function BookCover({ book, hovered }: { book: Book; hovered: boolean }) {
  const bg = book.cover.backgroundColor ?? "#2d2d2d";

  return (
    <div className="shrink-0" style={{ width: 76 }}>
      <div
        className="relative rounded-[3px] overflow-hidden"
        style={{
          width: 76,
          height: 114,
          backgroundColor: bg,
          transform: hovered
            ? "perspective(500px) rotateY(14deg)"
            : "perspective(500px) rotateY(5deg)",
          transformOrigin: "left center",
          transition: "transform 0.35s ease",
          boxShadow: [
            "2px 2px 0 rgba(240,234,220,0.90)",
            "4px 4px 0 rgba(225,218,205,0.70)",
            "6px 6px 0 rgba(210,202,185,0.50)",
            "0 10px 28px rgba(0,0,0,0.28)",
          ].join(", "),
        }}
      >
        {/* Cover image */}
        {book.cover.imageUrl && (
          <Image
            src={book.cover.imageUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        )}

        {/* Spine shadow — crease inward from left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: 18,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
          }}
        />

        {/* Diagonal dust-jacket sheen */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)",
          }}
        />

        {/* Title text */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-2 pointer-events-none">
          <p
            className="font-serif text-[9.5px] font-semibold leading-tight line-clamp-3 drop-shadow-sm"
            style={{ color: book.cover.titleColor }}
          >
            {book.title}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────
export function BookCard({ book, onDelete }: BookCardProps) {
  const router    = useRouter();
  const [hovered, setHovered] = useState(false);

  const wordCount = totalWordCount(book.chapters);
  const progress  = progressPercent(wordCount, book.targetWordCount);
  const status    = STATUS[book.status] ?? STATUS.draft;

  return (
    <div
      className="group relative bg-white rounded-xl border border-parchment-deep overflow-hidden cursor-pointer transition-shadow duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.11)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/books/${book.id}`)}
    >
      {/* ── Hover scrim + pill ──────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 z-10 rounded-xl pointer-events-none transition-all duration-300 flex items-center justify-center",
          hovered ? "bg-black/50" : "bg-black/0"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-ink text-xs font-semibold shadow-xl transition-all duration-300",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          Continue writing
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>

      {/* ── Three-dot menu ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute top-3 right-3 z-20 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/60 transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Pencil className="w-3.5 h-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                  onClick={() => onDelete(book.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Card body — cover + metadata ────────────────────────────────── */}
      <div className="relative z-[1] flex gap-3.5 p-4">
        <BookCover book={book} hovered={hovered} />

        {/* Metadata column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Top — status + title + genre */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
              <span className="text-[9.5px] font-sans uppercase tracking-[0.13em] text-ink-faint">
                {status.label}
              </span>
            </div>

            <h3 className="font-serif text-[0.92rem] font-semibold text-ink leading-snug line-clamp-2 mb-1.5">
              {book.title}
            </h3>

            <p className="text-[10.5px] text-ink-faint truncate">
              {book.genre}
            </p>
          </div>

          {/* Bottom — word count + progress */}
          <div className="space-y-1.5 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans text-ink-faint tabular-nums">
                {wordCount >= 1000
                  ? `${(wordCount / 1000).toFixed(1)}k`
                  : wordCount.toLocaleString()} words
              </span>
              <span className="text-[10px] font-sans text-ink-faint tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-[2px] w-full bg-parchment-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-sage/70 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="relative z-[1] border-t border-parchment-deep px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-sans text-ink-faint uppercase tracking-[0.11em]">
          {book.chapters.length} {book.chapters.length === 1 ? "chapter" : "chapters"}
        </span>
        <span className="text-[10px] font-sans text-ink-faint">
          {timeAgo(book.updatedAt)}
        </span>
      </div>
    </div>
  );
}

// ─── Add Book Card ────────────────────────────────────────────────────────────
export function AddBookCard() {
  return (
    <Link href="/books/new">
      <div className="group h-full min-h-[200px] rounded-xl border-2 border-dashed border-parchment-deep hover:border-ink/30 bg-transparent transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer px-6">
        <div className="w-10 h-10 rounded-full border border-parchment-deep group-hover:border-ink/30 flex items-center justify-center transition-colors duration-300">
          <Plus className="w-4 h-4 text-ink-faint group-hover:text-ink transition-colors duration-300" strokeWidth={1.8} />
        </div>
        <div className="text-center">
          <p className="font-serif text-sm font-medium text-ink-muted group-hover:text-ink transition-colors duration-300 leading-snug">
            Begin a new manuscript
          </p>
          <p className="text-[11px] text-ink-faint mt-1 leading-relaxed">
            Every story starts with a first chapter.
          </p>
        </div>
      </div>
    </Link>
  );
}
