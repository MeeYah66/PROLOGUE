"use client";

import { useState } from "react";
import {
  ChevronRight,
  User,
  Tag,
  FileText,
  X,
} from "lucide-react";
import type { Book, Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MetaPanelProps {
  book: Book;
  chapter: Chapter;
  onUpdateChapter: (updates: Partial<Chapter>) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function MetaPanel({
  book,
  chapter,
  onUpdateChapter,
  collapsed,
  onToggleCollapse,
  className,
}: MetaPanelProps) {
  const [summaryDraft, setSummaryDraft] = useState(chapter.summary ?? "");

  const saveSummary = () => {
    if (summaryDraft !== chapter.summary) {
      onUpdateChapter({ summary: summaryDraft });
    }
  };

  const totalWords = book.chapters.reduce((s, c) => s + c.wordCount, 0);
  const targetProgress = book.targetWordCount > 0
    ? Math.min(Math.round((totalWords / book.targetWordCount) * 100), 100)
    : 0;

  if (collapsed) {
    return (
      <div className={cn("w-10 flex flex-col items-center py-4 border-l border-parchment-deep bg-parchment shrink-0", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-parchment-warm transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Show Details</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn("w-60 flex flex-col border-l border-parchment-deep bg-parchment shrink-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-deep">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
          Details
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="text-ink-faint hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close Panel</TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Chapter summary */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Chapter Summary
            </Label>
            <Textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              onBlur={saveSummary}
              placeholder="Brief synopsis of this chapter…"
              rows={4}
              className="text-xs resize-none"
            />
          </div>

          <Separator />

          {/* POV & Scene */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" />
                POV Character
              </Label>
              <Input
                value={chapter.povCharacter ?? ""}
                onChange={(e) => onUpdateChapter({ povCharacter: e.target.value })}
                placeholder="e.g. Sera Ashvane"
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Tag className="w-3.5 h-3.5" />
                Scene Label
              </Label>
              <Input
                value={chapter.sceneLabel ?? ""}
                onChange={(e) => onUpdateChapter({ sceneLabel: e.target.value })}
                placeholder="e.g. Rising Action"
                className="text-xs h-8"
              />
            </div>
          </div>

          <Separator />

          {/* Manuscript progress */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Manuscript
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-faint">Total Words</span>
                <span className="text-ink font-medium">{totalWords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-faint">Target</span>
                <span className="text-ink font-medium">{book.targetWordCount.toLocaleString()}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1 w-full bg-parchment-deep rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-500"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
              <p className="text-xs text-ink-faint text-right">{targetProgress}% complete</p>
            </div>
          </div>

          <Separator />

          {/* Chapter stats */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Chapter Stats
            </p>
            <div className="space-y-1.5">
              {[
                { label: "Words", value: chapter.wordCount.toLocaleString() },
                { label: "Status", value: chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1) },
                { label: "Number", value: `Chapter ${chapter.number}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-ink-faint">{label}</span>
                  <span className="text-ink font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Characters in book */}
          {book.notes.characters.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                Characters
              </p>
              <div className="space-y-1">
                {book.notes.characters.slice(0, 4).map((char) => (
                  <div key={char.id} className="flex items-center justify-between">
                    <span className="text-xs text-ink truncate">{char.name}</span>
                    <span className="text-xs text-ink-faint shrink-0 ml-2">{char.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
