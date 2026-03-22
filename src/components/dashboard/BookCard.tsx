"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Eye, Trash2, PenLine, BookOpen } from "lucide-react";
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
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS: Record<string, { dot: string; label: string }> = {
  draft:     { dot: "bg-amber-400",   label: "Draft" },
  ongoing:   { dot: "bg-sage",        label: "In progress" },
  completed: { dot: "bg-emerald-400", label: "Complete" },
};

export function BookCard({ book, onDelete }: BookCardProps) {
  const wordCount = totalWordCount(book.chapters);
  const progress  = progressPercent(wordCount, book.targetWordCount);
  const lastCh    = book.chapters.find((c) => c.id === book.lastEditedChapterId);
  const status    = STATUS[book.status] ?? STATUS.draft;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)]">

      {/* Cover */}
      <Link href={`/books/${book.id}`}>
        <div
          className="relative h-44 w-full overflow-hidden"
          style={{ backgroundColor: book.cover.backgroundColor }}
        >
          {book.cover.imageUrl ? (
            <>
              <Image
                src={book.cover.imageUrl}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* Gradient so text is always legible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <>
              {/* Subtle ruled-paper texture */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 0,transparent 50%)",
                  backgroundSize: "100% 26px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </>
          )}

          {/* Title overlay on cover */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end p-4",
              book.cover.alignment === "center" && "items-center text-center",
              book.cover.alignment === "right"  && "items-end text-right",
            )}
          >
            <p
              className="font-serif text-base font-semibold leading-tight line-clamp-2 drop-shadow-sm"
              style={{ color: book.cover.titleColor }}
            >
              {book.title}
            </p>
            {book.subtitle && (
              <p
                className="text-[11px] mt-0.5 opacity-80 line-clamp-1"
                style={{ color: book.cover.authorColor }}
              >
                {book.subtitle}
              </p>
            )}
          </div>

          {/* Context menu — top right corner */}
          <div
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/books/${book.id}`}>
                    <PenLine className="w-4 h-4" /> Continue Writing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/books/${book.id}/preview`}>
                    <Eye className="w-4 h-4" /> Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/books/${book.id}/cover`}>
                    <BookOpen className="w-4 h-4" /> Edit Cover
                  </Link>
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => onDelete(book.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>

      {/* Card body */}
      <Link href={`/books/${book.id}`}>
        <div className="p-4 pb-5">
          {/* Status + genre */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
            <span className="text-[10px] font-sans uppercase tracking-[0.13em] text-ink-faint">
              {status.label}
            </span>
            <span className="text-ink-faint/30 text-xs">·</span>
            <span className="text-[10px] font-sans uppercase tracking-[0.13em] text-ink-faint truncate">
              {book.genre}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-[1rem] font-semibold text-ink leading-snug line-clamp-1 mb-0.5 group-hover:text-sage transition-colors duration-200">
            {book.title}
          </h3>

          {/* Last chapter */}
          {lastCh ? (
            <p className="text-xs text-ink-faint line-clamp-1">
              Ch. {lastCh.number} — {lastCh.title}
            </p>
          ) : (
            <p className="text-xs text-ink-faint">No chapters yet</p>
          )}

          {/* Progress + stats */}
          <div className="mt-4 space-y-2">
            {/* 2px progress bar */}
            <div className="h-[2px] w-full bg-parchment-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-sage/70 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-[10px] font-sans text-ink-faint tracking-wide">
              <div className="flex items-center gap-2.5">
                <span>{book.chapters.length} ch.</span>
                <span className="opacity-30">·</span>
                <span>
                  {wordCount >= 1000
                    ? `${(wordCount / 1000).toFixed(1)}k`
                    : wordCount.toLocaleString()} words
                </span>
                <span className="opacity-30">·</span>
                <span>{progress}%</span>
              </div>
              <span>{timeAgo(book.updatedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
