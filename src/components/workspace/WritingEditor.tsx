"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import {
  Check,
  Clock,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  ListOrdered,
  Save,
  Timer,
} from "lucide-react";
import type { Chapter } from "@/lib/types";
import { countWords, estimateReadingTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/context";
import { useWritingSettings } from "@/lib/writing-settings";

interface WritingEditorProps {
  chapter: Chapter;
  onChange: (updated: Partial<Chapter>) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-4 w-px shrink-0 bg-parchment-deep" />;
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition-colors",
            active ? "bg-ink/10 text-ink" : "text-ink-faint hover:bg-parchment-warm hover:text-ink"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

const StylePreserver = Extension.create({
  name: "stylePreserver",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock"],
        attributes: {
          style: {
            default: null,
            parseHTML: (el) => el.getAttribute("style") || null,
            renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
          },
          class: {
            default: null,
            parseHTML: (el) => el.getAttribute("class") || null,
            renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
          },
        },
      },
    ];
  },
});

const InlineStylePreserver = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style") || null,
        renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
      },
    };
  },
});

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "blockquote", label: "Blockquote" },
];

const FONTS = [
  { value: "lora", label: "Lora", css: "var(--font-lora)" },
  { value: "garamond", label: "EB Garamond", css: "'EB Garamond', Georgia, serif" },
  { value: "georgia", label: "Georgia", css: "Georgia, serif" },
  { value: "inter", label: "Inter", css: "var(--font-inter)" },
];

const FONT_SIZE_MAP = {
  small: "0.98rem",
  medium: "1.0625rem",
  large: "1.16rem",
} as const;

const TITLE_SIZE_MAP = {
  small: "2rem",
  medium: "2.2rem",
  large: "2.4rem",
} as const;

function formatSessionTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function WritingEditor({
  chapter,
  onChange,
  focusMode,
  onToggleFocusMode,
}: WritingEditorProps) {
  const { user } = useAuth();
  const { settings } = useWritingSettings(user?.id);

  const [localTitle, setLocalTitle] = useState(chapter.title);
  const [saved, setSaved] = useState(true);
  const [activeFont, setActiveFont] = useState("lora");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef(settings);
  const localTitleRef = useRef(localTitle);
  const prevAutoSaveRef = useRef(settings.autoSave);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    localTitleRef.current = localTitle;
  }, [localTitle]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      InlineStylePreserver,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      StylePreserver,
      Placeholder.configure({
        placeholder: "Begin your chapter here. The cursor is yours...",
      }),
    ],
    content: chapter.content || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        spellcheck: String(settings.spellcheck),
        style: `font-size:${FONT_SIZE_MAP[settings.editorFontSize]};`,
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      setSaved(false);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      if (!settingsRef.current.autoSave) return;

      saveTimeout.current = setTimeout(() => {
        onChange({
          title: localTitleRef.current,
          content: html,
          wordCount: countWords(html),
        });
        setSaved(true);
      }, 800);
    },
    immediatelyRender: false,
  });

  const saveNow = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    onChange({
      title: localTitleRef.current,
      content: html,
      wordCount: countWords(html),
    });
    setSaved(true);
  }, [editor, onChange]);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(chapter.content || "");
    }
    setLocalTitle(chapter.title);
    setSaved(true);
    setSessionSeconds(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: "tiptap-editor focus:outline-none",
          spellcheck: String(settings.spellcheck),
          style: `font-size:${FONT_SIZE_MAP[settings.editorFontSize]};`,
        },
      },
    });
  }, [editor, settings.spellcheck, settings.editorFontSize]);

  useEffect(() => {
    if (settings.autoSave && !prevAutoSaveRef.current && !saved) {
      saveNow();
    }
    prevAutoSaveRef.current = settings.autoSave;
  }, [settings.autoSave, saved, saveNow]);

  useEffect(() => {
    if (!settings.sessionTimer) return;
    const timerId = window.setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [settings.sessionTimer, chapter.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      saveNow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveNow]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const wordCount = countWords(editor?.getHTML() ?? "");
  const readingTime = estimateReadingTime(wordCount);
  const sessionLabel = formatSessionTime(sessionSeconds);

  function scheduleAutoSaveTitle(title: string) {
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (!settings.autoSave) return;

    saveTimeout.current = setTimeout(() => {
      const html = editor?.getHTML() ?? chapter.content;
      onChange({
        title,
        content: html,
        wordCount: countWords(html),
      });
      setSaved(true);
    }, 800);
  }

  function getActiveBlock(): string {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("blockquote")) return "blockquote";
    return "paragraph";
  }

  function setBlock(value: string) {
    if (!editor) return;
    editor.chain().focus();
    if (value === "h1") editor.chain().toggleHeading({ level: 1 }).run();
    else if (value === "h2") editor.chain().toggleHeading({ level: 2 }).run();
    else if (value === "h3") editor.chain().toggleHeading({ level: 3 }).run();
    else if (value === "blockquote") editor.chain().toggleBlockquote().run();
    else editor.chain().setParagraph().run();
  }

  function setFont(value: string) {
    const font = FONTS.find((f) => f.value === value);
    if (!font || !editor) return;
    setActiveFont(value);
    editor.chain().focus().selectAll().setFontFamily(font.css).run();
  }

  return (
    <div className="flex h-full flex-col bg-parchment">
      <div
        className={cn(
          "flex items-center justify-between border-b border-parchment-deep/50 px-6 py-2.5 transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-3">
          <Select value={chapter.status} onValueChange={(v) => onChange({ status: v as Chapter["status"] })}>
            <SelectTrigger className="h-7 w-28 border-none bg-transparent p-0 text-xs shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="revised">Revised</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-3.5 w-px bg-parchment-deep" />

          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <AlignLeft className="h-3.5 w-3.5" />
              {wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} read
            </span>
            {settings.sessionTimer && (
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {sessionLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!settings.autoSave && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={saveNow}
              disabled={saved}
            >
              <Save className="h-3 w-3" />
              Save now
            </Button>
          )}

          <span
            className={cn(
              "flex items-center gap-1 text-xs transition-all",
              saved ? "text-emerald-500" : settings.autoSave ? "text-ink-faint" : "text-amber-label"
            )}
          >
            {saved ? (
              <>
                <Check className="h-3 w-3" />
                Saved
              </>
            ) : settings.autoSave ? (
              "Saving..."
            ) : (
              "Unsaved changes"
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
                {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{focusMode ? "Exit Focus Mode" : "Focus Mode"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-1 border-b border-parchment-deep/40 bg-parchment/50 px-5 py-1.5 transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        <Select value={getActiveBlock()} onValueChange={setBlock}>
          <SelectTrigger
            className="h-7 w-32 rounded border border-parchment-deep bg-transparent px-2 text-xs shadow-none focus:ring-0"
            onMouseDown={(e) => e.preventDefault()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map((b) => (
              <SelectItem key={b.value} value={b.value} className="text-xs">
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFont} onValueChange={setFont}>
          <SelectTrigger
            className="ml-1 h-7 w-32 rounded border border-parchment-deep bg-transparent px-2 text-xs shadow-none focus:ring-0"
            onMouseDown={(e) => e.preventDefault()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f.value} value={f.value} className="text-xs" style={{ fontFamily: f.css }}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToolbarDivider />

        <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold (Ctrl/Cmd+B)">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic (Ctrl/Cmd+I)">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline (Ctrl/Cmd+U)">
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn active={editor?.isActive({ textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "right" })} onClick={() => editor?.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "justify" })} onClick={() => editor?.chain().focus().setTextAlign("justify").run()} title="Justify">
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().setHorizontalRule().run();
              }}
              className="flex h-7 items-center justify-center rounded px-2 font-serif text-xs tracking-widest text-ink-faint transition-colors hover:bg-parchment-warm hover:text-ink"
              title="Scene break"
            >
              ***
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Scene break
          </TooltipContent>
        </Tooltip>
      </div>

      <div className={cn("flex-1 overflow-y-auto", focusMode ? "py-14" : "py-8")}>
        <div className={cn("mx-auto px-6", focusMode ? "max-w-[720px]" : "max-w-[800px]")}>
          <div className="paper-canvas min-h-[70vh] rounded-2xl bg-white px-14 py-12 shadow-[0px_4px_32px_rgba(0,0,0,0.07)]">
            <p className="mb-5 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-label">
              Chapter {chapter.number}
            </p>

            <input
              type="text"
              value={localTitle}
              onChange={(e) => {
                setLocalTitle(e.target.value);
                scheduleAutoSaveTitle(e.target.value);
              }}
              placeholder="Chapter title"
              className="mb-10 w-full border-none bg-transparent font-serif font-semibold leading-tight tracking-tight text-ink placeholder:text-ink-faint/30 outline-none focus:ring-0"
              style={{ fontFamily: "var(--font-lora)", fontSize: TITLE_SIZE_MAP[settings.editorFontSize] }}
              spellCheck={settings.spellcheck}
            />

            <EditorContent
              editor={editor}
              className="tiptap-editor"
              style={{ fontFamily: FONTS.find((f) => f.value === activeFont)?.css ?? "var(--font-lora)" }}
            />

            {wordCount > 100 && (
              <div className="mt-14 flex items-center gap-4 border-t border-parchment-deep/60 pt-6">
                <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-faint/60">End of chapter</span>
                <div className="h-px flex-1 bg-parchment-deep/40" />
                <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-faint/60">{wordCount.toLocaleString()} words</span>
              </div>
            )}
          </div>

          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}

