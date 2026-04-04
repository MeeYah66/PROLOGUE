"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import {
  BookMarked,
  Download,
  FileText,
  Loader2,
  Printer,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getBooks } from "@/lib/store";
import type { Book } from "@/lib/types";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/lib/toast/context";
import {
  manuscriptFileName,
  manuscriptToPlainText,
  manuscriptToPrintHtml,
  manuscriptToWordHtml,
  manuscriptWordCount,
} from "@/lib/manuscript-export";
import { uploadPublicSharePreview } from "@/lib/supabase/storage";

type ExportAction = "pdf" | "document" | "print" | "share" | null;

function ExportRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-xs text-ink-faint mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
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

export function ExportCenter({ className }: { className?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [exportAction, setExportAction] = useState<ExportAction>(null);

  useEffect(() => {
    let active = true;

    if (!user) {
      setBooks([]);
      setBooksError(null);
      setSelectedBookId("");
      setBooksLoading(false);
      return () => {
        active = false;
      };
    }

    setBooksLoading(true);
    setBooksError(null);
    getBooks(user.id, { includeChapterContent: true })
      .then((items) => {
        if (!active) return;
        setBooks(items);
        setSelectedBookId((current) => {
          if (current && items.some((book) => book.id === current)) {
            return current;
          }
          return "";
        });
      })
      .catch((error) => {
        if (!active) return;
        setBooks([]);
        setBooksError(
          error instanceof Error ? error.message : "Could not load manuscripts."
        );
      })
      .finally(() => {
        if (active) setBooksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );
  const selectedBookWords = selectedBook ? manuscriptWordCount(selectedBook) : 0;
  const selectedBookChapters = selectedBook?.chapters.length ?? 0;
  const exportDisabled = !selectedBook || booksLoading || !user;

  function openPrintWindow(book: Book): Window | null {
    const popup = window.open("", "_blank", "width=1024,height=900");
    if (!popup) return null;
    popup.document.open();
    popup.document.write(manuscriptToPrintHtml(book));
    popup.document.close();
    return popup;
  }

  function withSelectedBook(): Book | null {
    if (!selectedBook) {
      toast({
        variant: "info",
        title: "Choose a manuscript first",
        description: "Select a manuscript to continue.",
      });
      return null;
    }
    return selectedBook;
  }

  function handleExportPdf() {
    const book = withSelectedBook();
    if (!book) return;

    setExportAction("pdf");
    const popup = openPrintWindow(book);
    if (!popup) {
      setExportAction(null);
      toast({
        variant: "error",
        title: "Popup blocked",
        description: "Allow popups for Prologue, then try export again.",
      });
      return;
    }

    window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
        toast({
          variant: "success",
          title: "PDF export ready",
          description: "Print dialog opened. Choose Save as PDF.",
        });
      } catch {
        toast({
          variant: "error",
          title: "Could not open print dialog",
          description: "Try again or use Print manuscript below.",
        });
      } finally {
        setExportAction(null);
      }
    }, 280);
  }

  function handleExportDocument() {
    const book = withSelectedBook();
    if (!book) return;

    try {
      setExportAction("document");
      const filename = `${manuscriptFileName(book)}.doc`;
      const content = manuscriptToWordHtml(book);
      triggerDownload(filename, content, "application/msword;charset=utf-8");
      toast({
        variant: "success",
        title: "Document exported",
        description: `${filename} was downloaded successfully.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Export failed",
        description: "We could not generate the document. Please try again.",
      });
    } finally {
      setExportAction(null);
    }
  }

  function handlePrint() {
    const book = withSelectedBook();
    if (!book) return;

    setExportAction("print");
    const popup = openPrintWindow(book);
    if (!popup) {
      setExportAction(null);
      toast({
        variant: "error",
        title: "Popup blocked",
        description: "Allow popups for Prologue, then try print again.",
      });
      return;
    }

    window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
        toast({
          variant: "success",
          title: "Print dialog opened",
          description: "Your manuscript is ready for printing.",
        });
      } catch {
        toast({
          variant: "error",
          title: "Could not open print dialog",
          description: "Please try again.",
        });
      } finally {
        setExportAction(null);
      }
    }, 280);
  }

  async function handleShare() {
    const book = withSelectedBook();
    if (!book) return;

    const shareText = `Preview "${book.title}" on Prologue.`;
    const textFile =
      typeof File !== "undefined"
        ? new File([manuscriptToPlainText(book)], `${manuscriptFileName(book)}.txt`, {
            type: "text/plain",
          })
        : null;

    setExportAction("share");
    try {
      const publicPreviewUrl = await uploadPublicSharePreview(
        book.id,
        manuscriptToPrintHtml(book)
      );

      if (navigator.share && textFile && navigator.canShare?.({ files: [textFile] })) {
        await navigator.share({
          title: book.title,
          text: shareText,
          url: publicPreviewUrl,
          files: [textFile],
        });
        toast({
          variant: "success",
          title: "Manuscript shared",
          description: "Share sheet opened with your manuscript file attached.",
        });
      } else if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: shareText,
          url: publicPreviewUrl,
        });
        toast({
          variant: "success",
          title: "Preview shared",
          description: "Public preview link is ready to share.",
        });
      } else {
        const copied = await copyText(publicPreviewUrl);
        if (!copied) throw new Error("copy_failed");
        toast({
          variant: "success",
          title: "Preview link copied",
          description: "Share it with readers to open the public preview.",
        });
      }
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      if (!isAbortError) {
        toast({
          variant: "error",
          title: "Share failed",
          description: "We could not share this manuscript right now.",
        });
      }
    } finally {
      setExportAction(null);
    }
  }

  function handleExportText() {
    const book = withSelectedBook();
    if (!book) return;

    try {
      const filename = `${manuscriptFileName(book)}.txt`;
      const content = manuscriptToPlainText(book);
      triggerDownload(filename, content, "text/plain;charset=utf-8");
      toast({
        variant: "success",
        title: "Plain text exported",
        description: `${filename} was downloaded successfully.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Export failed",
        description: "We could not generate the text file.",
      });
    }
  }

  if (booksLoading) {
    return (
      <div className={cn("rounded-xl border border-parchment-deep bg-parchment p-5 flex items-center gap-2 text-sm text-ink-muted", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading your manuscripts...
      </div>
    );
  }

  if (booksError) {
    return (
      <div className={cn("rounded-xl border border-red-500/30 bg-red-500/5 p-5", className)}>
        <p className="text-sm font-medium text-red-600">Could not load manuscripts</p>
        <p className="mt-1 text-xs text-red-600/90">{booksError}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={cn("rounded-xl border border-parchment-deep bg-parchment p-5", className)}>
        <p className="text-sm text-ink-muted leading-relaxed mb-4">
          You need at least one manuscript before you can export, print, or share.
        </p>
        <Link href="/books/new">
          <Button size="sm" className="h-8 gap-1.5">
            <BookMarked className="w-3.5 h-3.5" />
            Create a manuscript
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-parchment-deep bg-parchment p-4">
        <p className="text-[10px] uppercase tracking-[0.17em] font-semibold text-amber-label mb-2">
          Selected manuscript
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_300px] gap-3 items-end">
          <div>
            <Select
              value={selectedBookId || undefined}
              onValueChange={setSelectedBookId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manuscript to export..." />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-10 rounded-lg border border-parchment-deep bg-parchment px-3.5 flex items-center justify-between gap-5">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink-muted">Chapters</span>
              <span className="font-medium text-ink">
                {selectedBook ? selectedBookChapters : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink-muted">Words</span>
              <span className="font-medium text-ink">
                {selectedBook ? selectedBookWords.toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
        <ExportRow
          icon={FileText}
          title="Export as PDF"
          description="Open a print-ready manuscript layout and save as PDF."
          action={
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={handleExportPdf}
              disabled={exportDisabled || exportAction !== null}
            >
              {exportAction === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {exportAction === "pdf" ? "Opening..." : "Export PDF"}
            </Button>
          }
        />

        <ExportRow
          icon={BookMarked}
          title="Export Manuscript"
          description="Download a Word-compatible .doc file for editing and submission."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={handleExportDocument}
                disabled={exportDisabled || exportAction !== null}
              >
                {exportAction === "document" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {exportAction === "document" ? "Exporting..." : "Export .doc"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={handleExportText}
                disabled={exportDisabled || exportAction !== null}
              >
                Export .txt
              </Button>
            </div>
          }
        />

        <ExportRow
          icon={Printer}
          title="Print Manuscript"
          description="Open a clean print view and send directly to your printer."
          action={
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={handlePrint}
              disabled={exportDisabled || exportAction !== null}
            >
              {exportAction === "print" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              {exportAction === "print" ? "Opening..." : "Print"}
            </Button>
          }
        />

        <ExportRow
          icon={Share2}
          title="Share Preview Link"
          description="Share as a text file on supported devices, or copy a preview link."
          action={
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={handleShare}
              disabled={exportDisabled || exportAction !== null}
            >
              {exportAction === "share" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
              {exportAction === "share" ? "Sharing..." : "Share"}
            </Button>
          }
        />
      </div>
    </div>
  );
}
