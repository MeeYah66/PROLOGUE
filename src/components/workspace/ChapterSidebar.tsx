"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  Trash2,
  Copy,
  ChevronLeft,
  BookText,
} from "lucide-react";
import type { Book, Chapter } from "@/lib/types";
import { cn, countWords } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChapterSidebarProps {
  book: Book;
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onAddChapter: () => void;
  onDeleteChapter: (id: string) => void;
  onDuplicateChapter: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const statusDot: Record<string, string> = {
  draft: "bg-amber-400",
  revised: "bg-blue-400",
  final: "bg-emerald-400",
};

export function ChapterSidebar({
  book,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onDuplicateChapter,
  collapsed,
  onToggleCollapse,
  className,
}: ChapterSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (collapsed) {
    return (
      <div className={cn("w-10 flex flex-col items-center py-4 border-r border-parchment-deep bg-parchment shrink-0", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-parchment-warm transition-all"
            >
              <BookText className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand Chapters</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn("w-60 flex flex-col border-r border-parchment-deep bg-parchment shrink-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-deep">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
          Chapters
        </span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onAddChapter}
                className="text-ink-faint hover:text-ink"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Chapter</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleCollapse}
                className="text-ink-faint hover:text-ink"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Chapter list */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {book.chapters.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-serif text-sm text-ink leading-snug mb-1">
                Chapter One<br />is waiting.
              </p>
              <p className="text-[11px] text-ink-faint leading-relaxed mb-4 mt-2">
                Every novel starts here.
              </p>
              <Button variant="outline" size="sm" onClick={onAddChapter} className="text-xs">
                <Plus className="w-3.5 h-3.5" />
                Write Chapter One
              </Button>
            </div>
          ) : (
            book.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={cn(
                  "group relative flex items-start gap-2 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-all",
                  activeChapterId === chapter.id
                    ? "bg-parchment-warm text-ink"
                    : "text-ink-muted hover:bg-parchment-warm/60 hover:text-ink"
                )}
                onClick={() => onSelectChapter(chapter.id)}
                onMouseEnter={() => setHoveredId(chapter.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Drag handle */}
                <GripVertical className="w-3 h-3 mt-0.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />

                {/* Status dot */}
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", statusDot[chapter.status])} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-xs text-ink-faint mb-0.5">
                        Ch. {chapter.number}
                        {chapter.sceneLabel && (
                          <span className="ml-1.5 text-ink-faint/70">· {chapter.sceneLabel}</span>
                        )}
                      </p>
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {chapter.title}
                      </p>
                      <p className="text-xs text-ink-faint mt-1">
                        {chapter.wordCount.toLocaleString()} words
                      </p>
                    </div>

                    {/* Chapter menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={cn(
                            "transition-opacity shrink-0 mt-0.5",
                            hoveredId === chapter.id || activeChapterId === chapter.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateChapter(chapter.id);
                          }}
                        >
                          <Copy className="w-4 h-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChapter(chapter.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer stats */}
      <div className="border-t border-parchment-deep px-4 py-2.5">
        <p className="text-xs text-ink-faint">
          {book.chapters.reduce((s, c) => s + c.wordCount, 0).toLocaleString()} total words
        </p>
      </div>
    </div>
  );
}
