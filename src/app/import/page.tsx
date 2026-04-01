"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileUp,
  Loader2,
  Menu,
  Scissors,
  Sparkles,
  UnfoldVertical,
} from "lucide-react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/context";
import { GENRES } from "@/lib/data/mockData";
import { createBook, updateChapter } from "@/lib/store";
import { countWords } from "@/lib/utils";
import {
  getImportFileType,
  parseManuscriptFile,
  type ParsedChapter,
  type ParsedManuscript,
} from "@/lib/importer/parse";
import type { Chapter } from "@/lib/types";
import { cn } from "@/lib/utils";

type ImportStage = "upload" | "processing" | "review" | "importing";

const PROCESSING_MESSAGES = [
  "Reading your pages...",
  "Detecting chapter breaks...",
  "Structuring your manuscript...",
];

function chapterSnippet(content: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const text = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "No preview text detected yet.";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function paragraphBlocksFromHtml(content: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<article>${content}</article>`, "text/html");
  const nodes = Array.from(
    doc.querySelectorAll(
      "article p, article h1, article h2, article h3, article h4, article h5, article h6, article blockquote, article li"
    )
  );

  const blocks = nodes
    .map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (blocks.length > 0) return blocks;

  const fallback = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
  return fallback ? [fallback] : [];
}

function textBlocksToHtml(blocks: string[]): string {
  return blocks.map((block) => `<p>${block.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("");
}

function splitChapterAtMidpoint(chapter: ParsedChapter): [ParsedChapter, ParsedChapter] | null {
  const blocks = paragraphBlocksFromHtml(chapter.content);
  if (blocks.length < 2) return null;

  const midpoint = Math.ceil(blocks.length / 2);
  const firstBlocks = blocks.slice(0, midpoint);
  const secondBlocks = blocks.slice(midpoint);

  if (firstBlocks.length === 0 || secondBlocks.length === 0) return null;

  const firstContent = textBlocksToHtml(firstBlocks);
  const secondContent = textBlocksToHtml(secondBlocks);

  return [
    {
      id: crypto.randomUUID(),
      title: chapter.title,
      content: firstContent,
      wordCount: countWords(firstContent),
    },
    {
      id: crypto.randomUUID(),
      title: `${chapter.title} (Part 2)`,
      content: secondContent,
      wordCount: countWords(secondContent),
    },
  ];
}

function ImportTopBar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <div className="sticky top-0 z-30 h-12 px-3 md:px-6 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep">
      <div className="h-full max-w-5xl mx-auto flex items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          >
            <Menu className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm text-ink-faint hover:text-ink hover:bg-parchment-warm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          <span className="h-4 w-px bg-parchment-deep/90 mx-0.5" />
          <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.17em] font-semibold text-amber-label">
            Import Manuscript
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ImportManuscriptPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [stage, setStage] = useState<ImportStage>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [processingIndex, setProcessingIndex] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(8);

  const [detected, setDetected] = useState<ParsedManuscript | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [genre, setGenre] = useState("Other");
  const [chapters, setChapters] = useState<ParsedChapter[]>([]);

  const totalWords = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
    [chapters]
  );

  async function beginParsing(file: File) {
    const fileType = getImportFileType(file);
    if (!fileType) {
      setError("Please upload a .docx, .txt, or .pdf manuscript.");
      return;
    }

    setError("");
    setStage("processing");
    setProcessingProgress(10);
    setProcessingIndex(0);

    const progressTimer = window.setInterval(() => {
      setProcessingIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      setProcessingProgress((prev) => Math.min(94, prev + Math.floor(Math.random() * 8) + 2));
    }, 900);

    try {
      const startTime = Date.now();
      const parsed = await parseManuscriptFile(file);
      const elapsed = Date.now() - startTime;
      if (elapsed < 1400) {
        await new Promise((resolve) => window.setTimeout(resolve, 1400 - elapsed));
      }

      const safeChapters = parsed.chapters.length > 0
        ? parsed.chapters
        : [
            {
              id: crypto.randomUUID(),
              title: "Chapter 1",
              content: "<p></p>",
              wordCount: 0,
            },
          ];

      setDetected(parsed);
      setBookTitle(parsed.title || "Imported Manuscript");
      setGenre("Other");
      setChapters(safeChapters);
      setProcessingProgress(100);

      window.setTimeout(() => {
        setStage("review");
      }, 250);
    } catch (parseError) {
      const message =
        parseError instanceof Error
          ? parseError.message
          : "We could not process that file. Please try another manuscript file.";
      setError(message);
      setStage("upload");
    } finally {
      window.clearInterval(progressTimer);
    }
  }

  function onFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    beginParsing(file);
  }

  function renameChapter(index: number, value: string) {
    setChapters((current) =>
      current.map((chapter, chapterIndex) =>
        chapterIndex === index ? { ...chapter, title: value } : chapter
      )
    );
  }

  function mergeWithPrevious(index: number) {
    if (index <= 0) return;

    setChapters((current) => {
      if (index <= 0 || index >= current.length) return current;

      const previous = current[index - 1];
      const currentChapter = current[index];
      const mergedContent = `${previous.content}${currentChapter.content}`;
      const merged: ParsedChapter = {
        ...previous,
        content: mergedContent,
        wordCount: countWords(mergedContent),
      };

      const next = [...current];
      next.splice(index - 1, 2, merged);
      return next;
    });
  }

  function splitChapter(index: number) {
    setChapters((current) => {
      const target = current[index];
      if (!target) return current;

      const split = splitChapterAtMidpoint(target);
      if (!split) return current;

      const next = [...current];
      next.splice(index, 1, split[0], split[1]);
      return next;
    });
  }

  async function confirmImport() {
    if (!user) return;
    if (!bookTitle.trim()) {
      setError("Please give this manuscript a title before importing.");
      return;
    }
    if (chapters.length === 0) {
      setError("We need at least one chapter section to create the manuscript.");
      return;
    }

    setError("");
    setStage("importing");

    try {
      const targetWordCount = Math.max(
        50000,
        Math.ceil(Math.max(totalWords, 45000) / 5000) * 5000
      );

      const newBook = await createBook(user.id, {
        title: bookTitle.trim(),
        subtitle: undefined,
        genre,
        blurb: "Imported into Prologue to continue writing.",
        authorName: user.name || "Author",
        status: "ongoing",
        targetWordCount,
        cover: {
          style: "minimal",
          titleColor: "#1a1a1a",
          authorColor: "#6b6b6b",
          alignment: "left",
          backgroundColor: "#f0ece6",
          overlayOpacity: 0.5,
        },
      });

      for (let index = 0; index < chapters.length; index += 1) {
        const chapter = chapters[index];
        const now = new Date().toISOString();

        const payload: Chapter = {
          id: crypto.randomUUID(),
          number: index + 1,
          title: chapter.title.trim() || `Chapter ${index + 1}`,
          content: chapter.content,
          status: "draft",
          summary: undefined,
          wordCount: countWords(chapter.content),
          povCharacter: undefined,
          sceneLabel: undefined,
          createdAt: now,
          updatedAt: now,
        };

        await updateChapter(user.id, newBook.id, payload);
      }

      router.push(`/books/${newBook.id}`);
    } catch (importError) {
      const message =
        importError instanceof Error
          ? importError.message
          : "Import failed. Please try again.";
      setError(message);
      setStage("review");
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(to bottom, #f8f3ec 0%, #faf8f5 35%, #f7f7f6 100%)" }}>
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-12">
        <ImportTopBar onOpenNav={() => setMobileNavOpen(true)} />

        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
          <div className={cn("max-w-[780px]", stage === "upload" ? "mb-5" : "mb-8")}>
            <h1 className="font-serif text-[2.35rem] md:text-[2.75rem] leading-[1.02] font-semibold text-ink tracking-tight text-balance">
              Continue writing where you left off.
            </h1>
            <p className="text-sm text-ink-muted mt-3 max-w-[700px] leading-relaxed">
              Bring in your existing draft. We will structure it into chapters so you can edit, reorder, and keep writing inside Prologue.
            </p>
          </div>

          {stage === "upload" && (
            <>
              <div className="animate-fade-in">
                <button
                  data-drag={dragActive ? "true" : "false"}
                  className={cn(
                    "group relative w-full rounded-[1.35rem] border border-parchment-deep/70 bg-parchment-warm/92 px-4 sm:px-6 py-4 sm:py-5 text-left",
                    "shadow-[0_8px_22px_rgba(28,21,10,0.08)] transition-all duration-200",
                    "hover:-translate-y-px hover:bg-parchment-warm hover:shadow-[0_14px_28px_rgba(28,21,10,0.13)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                    dragActive &&
                      "border-gold/45 bg-gold/14 shadow-[0_0_0_2px_rgba(201,168,76,0.30),0_14px_28px_rgba(28,21,10,0.1)]"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    onFileSelected(event.dataTransfer.files);
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-r from-gold/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  <span className="relative z-[1] flex items-center gap-3 sm:gap-4">
                    <span className="w-10 h-10 rounded-xl bg-parchment-warm border border-parchment-deep/80 flex items-center justify-center shrink-0">
                      <FileUp className="w-4.5 h-4.5 text-gold-dark" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[1rem] sm:text-[1.03rem] leading-tight font-medium text-ink">
                        Upload your manuscript
                      </span>
                      <span className="block text-xs sm:text-[12.5px] text-ink-muted/95 mt-1">
                        Drag and drop or choose a file (.docx, .txt, .pdf)
                      </span>
                    </span>

                    <span className="shrink-0 flex items-center pl-3 ml-1 border-l border-parchment-deep/75 text-ink-muted group-hover:text-ink transition-colors">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </span>
                  </span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/pdf"
                  className="hidden"
                  onChange={(event) => onFileSelected(event.target.files)}
                />

                <Link
                  href="/books/new"
                  className="inline-flex mt-3.5 text-[13px] text-ink-faint hover:text-ink-muted underline-offset-4 hover:underline"
                >
                  Prefer to start fresh? Create a blank manuscript -&gt;
                </Link>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
              )}
            </>
          )}

          {stage === "processing" && (
            <div className="animate-fade-in max-w-2xl rounded-2xl border border-parchment-deep bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-parchment-warm border border-parchment-deep flex items-center justify-center">
                  <Loader2 className="w-4.5 h-4.5 text-ink-muted animate-spin" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.17em] text-ink-faint font-medium mb-1">Importing</p>
                  <h2 className="font-serif text-2xl font-semibold text-ink">Structuring your manuscript...</h2>
                </div>
              </div>
              <p className="text-sm text-ink-muted mb-4">{PROCESSING_MESSAGES[processingIndex]}</p>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}

          {stage === "importing" && (
            <div className="animate-fade-in max-w-2xl rounded-2xl border border-parchment-deep bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-parchment-warm border border-parchment-deep flex items-center justify-center">
                  <Loader2 className="w-4.5 h-4.5 text-ink-muted animate-spin" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-ink">Building your writing studio...</h2>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                We are creating your book, attaching chapter content, and opening your manuscript in the editor.
              </p>
            </div>
          )}

          {stage === "review" && detected && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
              <div className="rounded-2xl border border-parchment-deep bg-white p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.17em] text-amber-label font-semibold mb-1">
                      Review structure
                    </p>
                    <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">
                      Confirm chapters before import
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStage("upload")}>
                    Choose another file
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="import-title">Book title</Label>
                    <Input
                      id="import-title"
                      value={bookTitle}
                      onChange={(event) => setBookTitle(event.target.value)}
                      placeholder="Imported Manuscript"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Genre</Label>
                    <Select
                      value={genre}
                      onValueChange={setGenre}
                    >
                      <SelectTrigger className="bg-parchment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((genreName) => (
                          <SelectItem key={genreName} value={genreName}>
                            {genreName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {chapters.map((chapter, index) => {
                    const splitAvailable = paragraphBlocksFromHtml(chapter.content).length > 1;
                    return (
                      <div
                        key={chapter.id}
                        className="rounded-xl overflow-hidden border border-parchment-deep/95 bg-parchment/45 transition-colors hover:border-gold/35"
                      >
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-parchment-warm/85 border-b border-parchment-deep/90">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-amber-label font-semibold">
                            Chapter {index + 1}
                          </p>
                          <Badge className="text-[10px] bg-parchment border border-parchment-deep/90 text-ink-muted hover:bg-parchment">
                            {chapter.wordCount.toLocaleString()} words
                          </Badge>
                        </div>

                        <div className="bg-white/95 px-3 py-3.5">
                          <div className="flex-1 min-w-0">
                            <Input
                              value={chapter.title}
                              onChange={(event) => renameChapter(index, event.target.value)}
                              className="font-serif h-9 mb-2"
                            />
                            <p className="text-xs text-ink-muted leading-relaxed line-clamp-1">
                              {chapterSnippet(chapter.content)}
                            </p>
                          </div>
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-white"
                              disabled={index === 0}
                              onClick={() => mergeWithPrevious(index)}
                            >
                              <UnfoldVertical className="w-3 h-3" />
                              Merge
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-white"
                              disabled={!splitAvailable}
                              onClick={() => splitChapter(index)}
                            >
                              <Scissors className="w-3 h-3" />
                              Split
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-2xl border border-parchment-deep bg-white p-4 md:p-5 sticky top-6">
                <p className="text-[11px] uppercase tracking-[0.17em] text-ink-faint font-medium mb-1.5">
                  Import summary
                </p>
                <h3 className="font-serif text-xl font-semibold text-ink mb-3 leading-tight">
                  {bookTitle || "Imported manuscript"}
                </h3>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">Detected sections</span>
                    <span className="font-medium text-ink">{chapters.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">Total words</span>
                    <span className="font-medium text-ink">{totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">Source file</span>
                    <span className="font-medium text-ink uppercase">{detected.sourceType}</span>
                  </div>
                </div>

                <Separator className="mb-4" />
                <p className="text-xs text-ink-faint mb-4">
                  You can rename, reorder, split, or merge now. Nothing is final until import.
                </p>

                <Button onClick={confirmImport} className="w-full h-10 gap-2" disabled={chapters.length === 0 || !bookTitle.trim()}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Import into Prologue
                </Button>
              </aside>
            </div>
          )}

          {error && stage !== "upload" && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
