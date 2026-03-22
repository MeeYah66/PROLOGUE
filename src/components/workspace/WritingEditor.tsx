"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  Clock,
  Maximize2,
  Minimize2,
  AlignLeft,
} from "lucide-react";
import type { Chapter } from "@/lib/types";
import { countWords, estimateReadingTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WritingEditorProps {
  chapter: Chapter;
  onChange: (updated: Partial<Chapter>) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export function WritingEditor({
  chapter,
  onChange,
  focusMode,
  onToggleFocusMode,
}: WritingEditorProps) {
  const [localTitle, setLocalTitle] = useState(chapter.title);
  const [localContent, setLocalContent] = useState(chapter.content);
  const [saved, setSaved] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when chapter changes
  useEffect(() => {
    setLocalTitle(chapter.title);
    setLocalContent(chapter.content);
    setSaved(true);
  }, [chapter.id]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [localContent, resizeTextarea]);

  function scheduleAutoSave(title: string, content: string) {
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onChange({
        title,
        content,
        wordCount: countWords(content),
      });
      setSaved(true);
    }, 800);
  }

  const wordCount = countWords(localContent);
  const readingTime = estimateReadingTime(wordCount);

  return (
    <div className={cn("flex flex-col h-full bg-parchment", focusMode && "bg-white")}>
      {/* Toolbar */}
      <div
        className={cn(
          "flex items-center justify-between px-6 py-3 border-b border-parchment-deep transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Status select */}
          <Select
            value={chapter.status}
            onValueChange={(v) =>
              onChange({ status: v as Chapter["status"] })
            }
          >
            <SelectTrigger className="h-7 w-28 text-xs border-none bg-transparent p-0 focus:ring-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-3.5 w-px bg-parchment-deep" />

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" />
              {wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} read
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          <span
            className={cn(
              "flex items-center gap-1 text-xs transition-all",
              saved ? "text-emerald-500" : "text-ink-faint"
            )}
          >
            {saved ? (
              <>
                <Check className="w-3 h-3" />
                Saved
              </>
            ) : (
              "Saving…"
            )}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleFocusMode}
                className="text-ink-faint hover:text-ink"
              >
                {focusMode ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {focusMode ? "Exit Focus Mode" : "Focus Mode"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Editor area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          focusMode ? "py-16" : "py-10"
        )}
      >
        <div
          className={cn(
            "mx-auto",
            focusMode ? "max-w-[640px] px-8" : "max-w-[680px] px-8"
          )}
        >
          {/* Chapter label */}
          <p className="text-xs text-ink-faint mb-3 font-medium tracking-wider uppercase">
            Chapter {chapter.number}
          </p>

          {/* Chapter title */}
          <input
            type="text"
            value={localTitle}
            onChange={(e) => {
              setLocalTitle(e.target.value);
              scheduleAutoSave(e.target.value, localContent);
            }}
            placeholder="Chapter title"
            className={cn(
              "w-full bg-transparent border-none outline-none text-ink font-serif text-3xl font-semibold placeholder:text-ink-faint/40 mb-8 leading-tight",
              "focus:ring-0"
            )}
            style={{ fontFamily: "var(--font-lora)" }}
          />

          {/* Writing area */}
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => {
              setLocalContent(e.target.value);
              resizeTextarea();
              scheduleAutoSave(localTitle, e.target.value);
            }}
            placeholder="Begin your chapter here. The cursor is yours…"
            className={cn(
              "w-full bg-transparent border-none outline-none resize-none prose-editor",
              "placeholder:text-ink-faint/30 text-ink leading-[1.85] min-h-[60vh]",
              "focus:ring-0"
            )}
            style={{
              fontFamily: "var(--font-lora)",
              fontSize: "1.0625rem",
              lineHeight: "1.85",
              color: "#2d2d2d",
              overflowY: "hidden",
            }}
            spellCheck
            autoFocus
          />

          {/* End of chapter indicator */}
          {localContent.length > 100 && (
            <div className="flex items-center gap-4 mt-12 pt-6 border-t border-parchment-deep">
              <span className="text-xs text-ink-faint">End of chapter</span>
              <div className="flex-1 h-px bg-parchment-deep" />
              <span className="text-xs text-ink-faint">
                {wordCount.toLocaleString()} words
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
