"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Feather,
  FileText,
  Image as ImageIcon,
  List,
  Loader2,
  Printer,
  ScrollText,
  Share2,
  X,
} from "lucide-react";
import { getBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { Book, Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { estimateReadingTime } from "@/lib/utils";
import { htmlToSafeBlocks } from "@/lib/sanitization/chapter-content";
import { useToast } from "@/lib/toast/context";
import {
  manuscriptFileName,
  manuscriptToPlainText,
  manuscriptToPrintHtml,
  manuscriptToWordHtml,
} from "@/lib/manuscript-export";
import { uploadPublicSharePreview } from "@/lib/supabase/storage";

type PublishIntent = "pdf" | "document" | "text" | "print" | "share";
type PublishAction = PublishIntent | null;

const PUBLISH_COPY: Record<
  PublishIntent,
  { label: string; button: string; icon: typeof Download; description: string }
> = {
  pdf: {
    label: "PDF",
    button: "Publish PDF",
    icon: Download,
    description: "Open print layout and save it as a PDF.",
  },
  document: {
    label: "Word Document",
    button: "Publish .doc",
    icon: FileText,
    description: "Export as a Word-compatible .doc file.",
  },
  text: {
    label: "Plain Text",
    button: "Publish .txt",
    icon: FileText,
    description: "Export a clean plain text manuscript file.",
  },
  print: {
    label: "Print",
    button: "Publish to Print",
    icon: Printer,
    description: "Open print dialog for a physical copy.",
  },
  share: {
    label: "Share Link",
    button: "Publish Link",
    icon: Share2,
    description: "Create a shareable preview link for readers.",
  },
};

function isPublishIntent(value: string | null): value is PublishIntent {
  return (
    value === "pdf" ||
    value === "document" ||
    value === "text" ||
    value === "print" ||
    value === "share"
  );
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function WorkspaceNav({
  bookId,
  bookTitle,
  genre,
  onOpenToc,
}: {
  bookId: string;
  bookTitle: string;
  genre: string;
  onOpenToc: () => void;
}) {
  const navLinks = [
    { icon: Feather, label: "Write", href: `/books/${bookId}` },
    { icon: ScrollText, label: "Outline", href: `/books/${bookId}/outline` },
    { icon: Eye, label: "Preview", href: `/books/${bookId}/preview`, active: true },
    { icon: ImageIcon, label: "Cover", href: `/books/${bookId}/cover` },
  ];

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 border-b border-parchment-deep bg-parchment/95 backdrop-blur-sm z-30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="icon-sm" className="text-ink-faint">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <div className="h-3.5 w-px bg-parchment-deep" />
          <BookOpen className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <span className="text-sm font-serif font-semibold text-ink truncate max-w-[140px] sm:max-w-[200px]">
            {bookTitle}
          </span>
          <span className="text-xs text-ink-faint hidden sm:inline">| {genre}</span>
        </div>

        <div className="hidden md:flex items-center gap-0.5 bg-parchment-warm rounded-lg p-1">
          {navLinks.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href}>
              <button
                className={cn(
                  "px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
                  active
                    ? "bg-parchment text-ink shadow-sm font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="w-3 h-3" /> {label}
              </button>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end md:w-32">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-ink-faint hover:text-ink"
            onClick={onOpenToc}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <div className="md:hidden border-b border-parchment-deep bg-parchment/90">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5">
          {navLinks.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href} className="shrink-0">
              <span
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
                  active
                    ? "text-ink bg-parchment-warm font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="w-3 h-3" /> {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function CoverPage({ book }: { book: Book }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: book.cover.backgroundColor }}
    >
      {book.cover.imageUrl && (
        <>
          <Image src={book.cover.imageUrl} alt={book.title} fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,${book.cover.overlayOpacity}) 100%)`,
            }}
          />
        </>
      )}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12",
          book.cover.alignment === "center" && "items-center text-center",
          book.cover.alignment === "left" && "items-start text-left",
          book.cover.alignment === "right" && "items-end text-right"
        )}
      >
        {book.subtitle && (
          <p
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-2 sm:mb-3 opacity-80"
            style={{ color: book.cover.authorColor }}
          >
            {book.subtitle}
          </p>
        )}
        <h1
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2 sm:mb-4"
          style={{ color: book.cover.titleColor }}
        >
          {book.title}
        </h1>
        <p className="text-sm sm:text-base md:text-lg tracking-wide" style={{ color: book.cover.authorColor }}>
          {book.authorName}
        </p>
      </div>
    </div>
  );
}

function TitlePage({ book }: { book: Book }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#faf8f5] p-6 sm:p-10 md:p-12">
      <div className="text-center max-w-sm">
        <div className="w-12 h-px bg-ink-faint mx-auto mb-6 sm:mb-8" />
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mb-3 leading-tight">{book.title}</h1>
        {book.subtitle && <p className="text-sm text-ink-muted mb-6 font-serif italic">{book.subtitle}</p>}
        <div className="w-4 h-px bg-gold mx-auto mb-6" />
        <p className="text-base text-ink-muted font-serif">{book.authorName}</p>
        <div className="w-12 h-px bg-ink-faint mx-auto mt-8" />
      </div>
    </div>
  );
}

function ChapterPage({ chapter }: { chapter: Chapter }) {
  const blocks = useMemo(() => htmlToSafeBlocks(chapter.content), [chapter.content]);

  return (
    <div className="w-full min-h-full bg-[#faf8f5] px-5 sm:px-10 md:px-16 py-8 sm:py-12 md:py-16">
      <div className="text-center mb-10 md:mb-12">
        <p className="text-[10px] sm:text-xs text-ink-faint tracking-[0.18em] uppercase mb-3 font-medium">
          Chapter {chapter.number}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-tight">{chapter.title}</h2>
        <div className="w-8 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      <div
        className="book-page max-w-none space-y-4"
        style={{
          fontFamily: "var(--font-lora)",
          fontSize: "1rem",
          lineHeight: "1.9",
          color: "#1a1a1a",
        }}
      >
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h3 key={`${chapter.id}-block-${index}`} className="font-serif text-xl font-semibold text-ink mt-6">
                {block.text}
              </h3>
            );
          }

          if (block.type === "blockquote") {
            return (
              <blockquote
                key={`${chapter.id}-block-${index}`}
                className="border-l-2 border-parchment-deep pl-4 italic text-ink-muted"
              >
                {block.text}
              </blockquote>
            );
          }

          if (block.type === "unordered-list" || block.type === "ordered-list") {
            const ListTag = block.type === "ordered-list" ? "ol" : "ul";
            return (
              <ListTag
                key={`${chapter.id}-block-${index}`}
                className={cn(
                  "ml-6 space-y-1 marker:text-ink-faint",
                  block.type === "ordered-list" ? "list-decimal" : "list-disc"
                )}
              >
                {(block.items ?? []).map((item, itemIndex) => (
                  <li key={`${chapter.id}-block-${index}-item-${itemIndex}`}>{item}</li>
                ))}
              </ListTag>
            );
          }

          return (
            <p key={`${chapter.id}-block-${index}`} className="leading-relaxed">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-12 pt-6 border-t border-parchment-deep">
        <div className="flex-1 h-px" />
        <span className="text-xs text-ink-faint">*</span>
        <div className="flex-1 h-px" />
      </div>
    </div>
  );
}

type PreviewPage =
  | { type: "cover" }
  | { type: "title" }
  | { type: "chapter"; chapter: Chapter };

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [publishIntent, setPublishIntent] = useState<PublishIntent | null>(null);
  const [publishAction, setPublishAction] = useState<PublishAction>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    const intent = query.get("publish");
    setPublishIntent(isPublishIntent(intent) ? intent : null);
  }, []);

  useEffect(() => {
    if (!user) return;
    getBook(user.id, bookId).then((b) => {
      if (!b) {
        router.push("/");
        return;
      }
      setBook(b);
    });
  }, [bookId, user, router]);

  function openPrintWindow(currentBook: Book): Window | null {
    const popup = window.open("", "_blank", "width=1024,height=900");
    if (!popup) return null;
    popup.document.open();
    popup.document.write(manuscriptToPrintHtml(currentBook));
    popup.document.close();
    return popup;
  }

  async function handleFinalizePublish() {
    if (!book || !publishIntent || publishAction) return;

    setPublishAction(publishIntent);
    try {
      if (publishIntent === "pdf") {
        const popup = openPrintWindow(book);
        if (!popup) throw new Error("popup_blocked");
        window.setTimeout(() => {
          popup.focus();
          popup.print();
        }, 280);
        toast({
          variant: "success",
          title: "PDF publish ready",
          description: "Print dialog opened. Choose Save as PDF.",
        });
      }

      if (publishIntent === "document") {
        const filename = `${manuscriptFileName(book)}.doc`;
        triggerDownload(filename, manuscriptToWordHtml(book), "application/msword;charset=utf-8");
        toast({
          variant: "success",
          title: "Document published",
          description: `${filename} has been downloaded.`,
        });
      }

      if (publishIntent === "text") {
        const filename = `${manuscriptFileName(book)}.txt`;
        triggerDownload(filename, manuscriptToPlainText(book), "text/plain;charset=utf-8");
        toast({
          variant: "success",
          title: "Text manuscript published",
          description: `${filename} has been downloaded.`,
        });
      }

      if (publishIntent === "print") {
        const popup = openPrintWindow(book);
        if (!popup) throw new Error("popup_blocked");
        window.setTimeout(() => {
          popup.focus();
          popup.print();
        }, 280);
        toast({
          variant: "success",
          title: "Print publish ready",
          description: "Your manuscript is ready to print.",
        });
      }

      if (publishIntent === "share") {
        const publicPreviewUrl = await uploadPublicSharePreview(
          book.id,
          manuscriptToPrintHtml(book)
        );
        const copied = await copyText(publicPreviewUrl);
        if (!copied) throw new Error("copy_failed");
        toast({
          variant: "success",
          title: "Share link published",
          description: "Public preview link copied to clipboard.",
        });
      }
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      if (!isAbortError) {
        const popupBlocked = error instanceof Error && error.message === "popup_blocked";
        toast({
          variant: "error",
          title: popupBlocked ? "Popup blocked" : "Publish failed",
          description: popupBlocked
            ? "Allow popups for Prologue, then try again."
            : "We could not complete this publish action.",
        });
      }
    } finally {
      setPublishAction(null);
    }
  }

  if (!book) return null;

  const pages: PreviewPage[] = [
    { type: "cover" },
    { type: "title" },
    ...book.chapters.map((ch): PreviewPage => ({ type: "chapter", chapter: ch })),
  ];

  const totalPages = pages.length;
  const page = pages[currentPage];
  const totalWords = book.chapters.reduce((s, c) => s + c.wordCount, 0);
  const PublishIcon = publishIntent ? PUBLISH_COPY[publishIntent].icon : Download;

  const tocPanel = (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-deep">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Contents</p>
        <button onClick={() => setShowToc(false)} className="text-ink-faint hover:text-ink transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2 px-2">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i);
                setShowToc(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                i === currentPage
                  ? "bg-parchment-warm text-ink font-medium"
                  : "text-ink-muted hover:bg-parchment-warm/60 hover:text-ink"
              )}
            >
              {p.type === "cover" ? (
                "Cover"
              ) : p.type === "title" ? (
                "Title Page"
              ) : (
                <span>
                  <span className="text-xs text-ink-faint block">Ch. {p.chapter.number}</span>
                  {p.chapter.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-[#e8e4de] overflow-hidden">
      <WorkspaceNav
        bookId={bookId}
        bookTitle={book.title}
        genre={book.genre}
        onOpenToc={() => setShowToc(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {showToc && (
          <div className="hidden md:flex w-56 border-r border-parchment-deep bg-parchment flex-col shrink-0">
            {tocPanel}
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-start overflow-hidden">
          <div className="w-full px-3 sm:px-6 py-2.5 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setShowToc((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-3 py-1.5 rounded-md hover:bg-parchment transition-colors"
              >
                <List className="w-3.5 h-3.5" />
                Contents
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-ink-faint w-20 text-center">
                  {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-ink-faint mt-1.5 px-0.5">
              {totalWords.toLocaleString()} words | {estimateReadingTime(totalWords)} total read
            </p>
            {publishIntent && (
              <div className="mt-3 rounded-lg border border-parchment-deep bg-parchment px-3 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-amber-label">
                    Publish in Preview
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {PUBLISH_COPY[publishIntent].description}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleFinalizePublish}
                  disabled={publishAction !== null}
                >
                  {publishAction === publishIntent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PublishIcon className="w-3.5 h-3.5" />
                  )}
                  {publishAction === publishIntent ? "Publishing..." : PUBLISH_COPY[publishIntent].button}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 w-full flex items-start justify-center px-3 sm:px-6 md:px-8 pb-5 md:pb-8 overflow-y-auto">
            <div
              className="w-full max-w-[640px] bg-[#faf8f5] shadow-xl rounded-sm overflow-hidden"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15), 4px 0 0 rgba(0,0,0,0.05)" }}
            >
              {page.type === "cover" && (
                <div className="h-[68vh] min-h-[500px] max-h-[800px]">
                  <CoverPage book={book} />
                </div>
              )}
              {page.type === "title" && (
                <div className="h-[68vh] min-h-[500px] max-h-[800px]">
                  <TitlePage book={book} />
                </div>
              )}
              {page.type === "chapter" && <ChapterPage chapter={page.chapter} />}
            </div>
          </div>
        </div>
      </div>

      {showToc && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setShowToc(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="Close contents panel"
          />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px] bg-parchment border-r border-parchment-deep shadow-2xl flex flex-col">
            {tocPanel}
          </div>
        </div>
      )}
    </div>
  );
}
