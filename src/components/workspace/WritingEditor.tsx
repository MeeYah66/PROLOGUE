"use client";

import { useState, useEffect, useRef } from "react";
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

// ── Style preserver ───────────────────────────────────────────────────────────
// Adds `style` + `class` attributes to all block node types and extends
// TextStyle so inline CSS from pasted HTML (ChatGPT, Google Docs, etc.) is
// retained in the schema and not stripped on paste.
const StylePreserver = Extension.create({
  name: "stylePreserver",
  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
          "blockquote",
          "codeBlock",
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: (el) => el.getAttribute("style") || null,
            renderHTML: (attrs) => attrs.style ? { style: attrs.style } : {},
          },
          class: {
            default: null,
            parseHTML: (el) => el.getAttribute("class") || null,
            renderHTML: (attrs) => attrs.class ? { class: attrs.class } : {},
          },
        },
      },
    ];
  },
});

// Extend TextStyle mark so inline `style` on <span> tags survives paste too
const InlineStylePreserver = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style") || null,
        renderHTML: (attrs) => attrs.style ? { style: attrs.style } : {},
      },
    };
  },
});

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
      InlineStylePreserver,   // TextStyle extended to preserve inline CSS
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      StylePreserver,          // Preserves style/class on all block nodes
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
    <div className="flex flex-col h-full bg-parchment">

      {/* ── Status / meta bar ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center justify-between px-6 py-2.5 border-b border-parchment-deep/50 transition-opacity",
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
          "flex items-center gap-1 px-5 py-1.5 border-b border-parchment-deep/40 bg-parchment/50 flex-wrap transition-opacity",
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
      <div className={cn("flex-1 overflow-y-auto", focusMode ? "py-14" : "py-8")}>
        <div className={cn("mx-auto px-6", focusMode ? "max-w-[720px]" : "max-w-[800px]")}>

          {/* Paper sheet */}
          <div className="bg-white rounded-2xl shadow-[0px_4px_32px_rgba(0,0,0,0.07)] px-14 py-12 min-h-[70vh]">

            {/* Chapter label */}
            <p className="text-[10px] font-sans uppercase tracking-[0.22em] font-semibold text-amber-label mb-5">
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
              className="w-full bg-transparent border-none outline-none text-ink font-serif text-[2.2rem] font-semibold placeholder:text-ink-faint/30 mb-10 leading-tight focus:ring-0 tracking-tight"
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
              <div className="flex items-center gap-4 mt-14 pt-6 border-t border-parchment-deep/60">
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint/60 font-sans">End of chapter</span>
                <div className="flex-1 h-px bg-parchment-deep/40" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint/60 font-sans">{wordCount.toLocaleString()} words</span>
              </div>
            )}

          </div>

          {/* Bottom breathing room */}
          <div className="h-16" />
        </div>
      </div>
    </div>
  );
}
