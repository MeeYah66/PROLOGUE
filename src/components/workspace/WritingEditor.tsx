"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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

interface WritingEditorProps {
  chapter: Chapter;
  onChange: (updated: Partial<Chapter>) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

// ── Toolbar primitives ────────────────────────────────────────────────────────
function ToolbarDivider() {
  return <div className="w-px h-4 bg-parchment-deep mx-0.5 shrink-0" />;
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
          // preventDefault keeps editor focus while clicking toolbar
          onMouseDown={(e) => { e.preventDefault(); onClick(); }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded transition-colors",
            active
              ? "bg-ink/10 text-ink"
              : "text-ink-faint hover:text-ink hover:bg-parchment-warm"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
    </Tooltip>
  );
}

// ── Block type options ────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1",        label: "Heading 1" },
  { value: "h2",        label: "Heading 2" },
  { value: "h3",        label: "Heading 3" },
  { value: "blockquote",label: "Blockquote" },
];

const FONTS = [
  { value: "lora",     label: "Lora",        css: "var(--font-lora)" },
  { value: "garamond", label: "EB Garamond",  css: "'EB Garamond', Georgia, serif" },
  { value: "georgia",  label: "Georgia",      css: "Georgia, serif" },
  { value: "inter",    label: "Inter",        css: "var(--font-inter)" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function WritingEditor({
  chapter,
  onChange,
  focusMode,
  onToggleFocusMode,
}: WritingEditorProps) {
  const [localTitle, setLocalTitle]   = useState(chapter.title);
  const [saved, setSaved]             = useState(true);
  const [activeFont, setActiveFont]   = useState("lora");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Tiptap editor ──────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExt,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      Placeholder.configure({
        placeholder: "Begin your chapter here. The cursor is yours…",
      }),
    ],
    content: chapter.content || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      setSaved(false);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        onChange({
          content:   html,
          wordCount: countWords(html),
        });
        setSaved(true);
      }, 800);
    },
    immediatelyRender: false,
  });

  // Sync content + title when chapter switches
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(chapter.content || "");
    }
    setLocalTitle(chapter.title);
    setSaved(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const wordCount  = countWords(editor?.getHTML() ?? "");
  const readingTime = estimateReadingTime(wordCount);

  function scheduleAutoSavTitle(title: string) {
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onChange({ title, wordCount: countWords(editor?.getHTML() ?? "") });
      setSaved(true);
    }, 800);
  }

  // ── Block type helpers ─────────────────────────────────────────────────────
  function getActiveBlock(): string {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("blockquote"))             return "blockquote";
    return "paragraph";
  }

  function setBlock(value: string) {
    if (!editor) return;
    editor.chain().focus();
    if (value === "h1")        editor.chain().toggleHeading({ level: 1 }).run();
    else if (value === "h2")   editor.chain().toggleHeading({ level: 2 }).run();
    else if (value === "h3")   editor.chain().toggleHeading({ level: 3 }).run();
    else if (value === "blockquote") editor.chain().toggleBlockquote().run();
    else editor.chain().setParagraph().run();
  }

  function setFont(value: string) {
    const font = FONTS.find((f) => f.value === value);
    if (!font || !editor) return;
    setActiveFont(value);
    editor.chain().focus().selectAll().setFontFamily(font.css).run();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col h-full", focusMode ? "bg-white" : "bg-parchment")}>

      {/* ── Status / meta bar ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between px-6 py-2.5 border-b border-parchment-deep transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-3">
          <Select
            value={chapter.status}
            onValueChange={(v) => onChange({ status: v as Chapter["status"] })}
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
          <span
            className={cn(
              "flex items-center gap-1 text-xs transition-all",
              saved ? "text-emerald-500" : "text-ink-faint"
            )}
          >
            {saved ? <><Check className="w-3 h-3" />Saved</> : "Saving…"}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleFocusMode}
                className="text-ink-faint hover:text-ink"
              >
                {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{focusMode ? "Exit Focus Mode" : "Focus Mode"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ── Formatting toolbar ────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1 px-5 py-1.5 border-b border-parchment-deep bg-parchment/80 flex-wrap transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        {/* Block type */}
        <Select value={getActiveBlock()} onValueChange={setBlock}>
          <SelectTrigger
            className="h-7 w-32 text-xs border border-parchment-deep bg-transparent focus:ring-0 shadow-none rounded px-2"
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

        {/* Font family */}
        <Select value={activeFont} onValueChange={setFont}>
          <SelectTrigger
            className="h-7 w-32 text-xs border border-parchment-deep bg-transparent focus:ring-0 shadow-none rounded px-2 ml-1"
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

        {/* Inline formatting */}
        <ToolbarBtn active={editor?.isActive("bold")}      onClick={() => editor?.chain().focus().toggleBold().run()}      title="Bold (⌘B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("italic")}    onClick={() => editor?.chain().focus().toggleItalic().run()}    title="Italic (⌘I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline (⌘U)">
          <Underline className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Text alignment */}
        <ToolbarBtn active={editor?.isActive({ textAlign: "left" })}    onClick={() => editor?.chain().focus().setTextAlign("left").run()}    title="Align left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "center" })}  onClick={() => editor?.chain().focus().setTextAlign("center").run()}  title="Align center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "right" })}   onClick={() => editor?.chain().focus().setTextAlign("right").run()}   title="Align right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive({ textAlign: "justify" })} onClick={() => editor?.chain().focus().setTextAlign("justify").run()} title="Justify">
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Block elements */}
        <ToolbarBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Scene break */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setHorizontalRule().run(); }}
              className="h-7 px-2 flex items-center justify-center rounded text-xs text-ink-faint hover:text-ink hover:bg-parchment-warm transition-colors font-serif tracking-widest"
              title="Scene break"
            >
              ⁂
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Scene break</TooltipContent>
        </Tooltip>
      </div>

      {/* ── Editor area ───────────────────────────────────────────────── */}
      <div className={cn("flex-1 overflow-y-auto", focusMode ? "py-16" : "py-10")}>
        <div className={cn("mx-auto", focusMode ? "max-w-[640px] px-8" : "max-w-[680px] px-8")}>

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
              scheduleAutoSavTitle(e.target.value);
            }}
            placeholder="Chapter title"
            className="w-full bg-transparent border-none outline-none text-ink font-serif text-3xl font-semibold placeholder:text-ink-faint/40 mb-8 leading-tight focus:ring-0"
            style={{ fontFamily: "var(--font-lora)" }}
          />

          {/* Rich text editor */}
          <EditorContent
            editor={editor}
            className="tiptap-editor"
            style={{ fontFamily: FONTS.find((f) => f.value === activeFont)?.css ?? "var(--font-lora)" }}
          />

          {/* End of chapter indicator */}
          {wordCount > 100 && (
            <div className="flex items-center gap-4 mt-12 pt-6 border-t border-parchment-deep">
              <span className="text-xs text-ink-faint">End of chapter</span>
              <div className="flex-1 h-px bg-parchment-deep" />
              <span className="text-xs text-ink-faint">{wordCount.toLocaleString()} words</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
