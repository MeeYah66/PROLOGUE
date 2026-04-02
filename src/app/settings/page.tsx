"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Share2,
  Printer,
  Moon,
  Sun,
  Type,
  BookMarked,
  Feather,
  Clock,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/layout/AppNav";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth/context";
import { useWritingSettings } from "@/lib/writing-settings";
import { useToast } from "@/lib/toast/context";
import { getBooks } from "@/lib/store";
import type { Book } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  manuscriptFileName,
  manuscriptToPlainText,
  manuscriptToPrintHtml,
  manuscriptToWordHtml,
  manuscriptWordCount,
} from "@/lib/manuscript-export";

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink">{title}</p>
            {badge && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gold/10 text-gold-dark border border-gold/20">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-faint mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function ToggleSetting({
  icon: Icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
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
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={cn(
          "rounded-full relative transition-colors shrink-0",
          checked ? "bg-gold" : "bg-parchment-deep"
        )}
        style={{ height: "22px", minWidth: "40px" }}
      >
        <div
          className={cn(
            "toggle-knob absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

type ExportAction = "pdf" | "document" | "print" | "share" | null;

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

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings } = useWritingSettings(user?.id);
  const { theme, toggle: toggleTheme } = useTheme();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [exportAction, setExportAction] = useState<ExportAction>(null);

  useEffect(() => {
    let active = true;

    if (!user) {
      setBooks([]);
      setSelectedBookId("");
      setBooksLoading(false);
      return () => {
        active = false;
      };
    }

    setBooksLoading(true);
    getBooks(user.id)
      .then((items) => {
        if (!active) return;
        setBooks(items);
        setSelectedBookId((current) => {
          if (current && items.some((book) => book.id === current)) {
            return current;
          }
          return items[0]?.id ?? "";
        });
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

  function handleFontSizeChange(size: "small" | "medium" | "large") {
    if (settings.editorFontSize === size) return;

    updateSettings({ editorFontSize: size });
    toast({
      variant: "success",
      title: `Editor font set to ${size}`,
      description: "Your writing editor now uses this text size.",
    });
  }

  function handleAutoSaveToggle() {
    const next = !settings.autoSave;
    updateSettings({ autoSave: next });
    toast({
      variant: "success",
      title: next ? "Auto-save enabled" : "Auto-save paused",
      description: next
        ? "Changes will save automatically while you write."
        : "Remember to save manually while this is off.",
    });
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggleTheme();
    toast({
      variant: "success",
      title: nextTheme === "dark" ? "Dark mode enabled" : "Light mode enabled",
      description: "Your appearance preference has been updated.",
    });
  }

  function handleSpellcheckToggle() {
    const next = !settings.spellcheck;
    updateSettings({ spellcheck: next });
    toast({
      variant: "success",
      title: next ? "Spellcheck enabled" : "Spellcheck disabled",
      description: next
        ? "Misspelled words will be highlighted as you type."
        : "Spellcheck highlights are now hidden.",
    });
  }

  function handleDailyGoalToggle() {
    const next = !settings.dailyWordGoalEnabled;
    updateSettings({ dailyWordGoalEnabled: next });
    toast({
      variant: "success",
      title: next ? "Daily Goal enabled" : "Daily Goal hidden",
      description: next
        ? "Your dashboard will show daily goal progress."
        : "Daily goal tracking is hidden until you turn it back on.",
    });
  }

  function handleSessionTimerToggle() {
    const next = !settings.sessionTimer;
    updateSettings({ sessionTimer: next });
    toast({
      variant: "success",
      title: next ? "Session Timer enabled" : "Session Timer hidden",
      description: next
        ? "Writing sessions now display a live timer."
        : "Session timer is now turned off.",
    });
  }

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
        description: "Select a manuscript in Export & Share to continue.",
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

    const previewUrl = `${window.location.origin}/books/${book.id}/preview`;
    const shareText = `Preview "${book.title}" on Prologue.`;
    const textFile = new File(
      [manuscriptToPlainText(book)],
      `${manuscriptFileName(book)}.txt`,
      { type: "text/plain" }
    );

    setExportAction("share");
    try {
      if (navigator.share && navigator.canShare?.({ files: [textFile] })) {
        await navigator.share({
          title: book.title,
          text: shareText,
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
          url: previewUrl,
        });
        toast({
          variant: "success",
          title: "Preview shared",
          description: "Share sheet opened successfully.",
        });
      } else {
        const copied = await copyText(previewUrl);
        if (!copied) throw new Error("copy_failed");
        toast({
          variant: "success",
          title: "Preview link copied",
          description: "Share it with readers to open the preview page.",
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

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav />
      <main className="flex-1 md:ml-48">
        {/* Header */}
        <div className="border-b border-parchment-deep px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
            <p className="text-sm text-ink-faint mt-1">
              Preferences, export options, and writing tools
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">
          {/* Export */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Export & Share</h2>
            <p className="text-xs text-ink-faint mb-4">
              Export your manuscript, share a preview link, or open a print-ready version.
            </p>
            {booksLoading ? (
              <div className="rounded-xl border border-parchment-deep bg-parchment p-5 flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your manuscripts...
              </div>
            ) : books.length === 0 ? (
              <div className="rounded-xl border border-parchment-deep bg-parchment p-5">
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
            ) : (
              <>
                <div className="rounded-xl border border-parchment-deep bg-parchment p-4 mb-4">
                  <p className="text-[10px] uppercase tracking-[0.17em] font-semibold text-amber-label mb-2">
                    Selected manuscript
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3 items-end">
                    <div>
                      <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                        <SelectTrigger className="bg-parchment-warm">
                          <SelectValue placeholder="Choose manuscript" />
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
                    <div className="rounded-lg border border-parchment-deep bg-parchment-warm px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-muted">Chapters</span>
                        <span className="font-medium text-ink">{selectedBookChapters}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-ink-muted">Words</span>
                        <span className="font-medium text-ink">{selectedBookWords.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
                  <SettingRow
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

                  <SettingRow
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

                  <SettingRow
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

                  <SettingRow
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
              </>
            )}
          </section>

          {/* Editor Preferences */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Editor Preferences</h2>
            <p className="text-xs text-ink-faint mb-4">
              Customise your writing environment.
            </p>
            <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
              <div className="py-4 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-parchment-warm flex items-center justify-center">
                    <Type className="w-4 h-4 text-ink-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Editor Font Size</p>
                    <p className="text-xs text-ink-faint mt-0.5">Adjust the size of text in the writing editor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-parchment-warm rounded-lg p-1">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs transition-all capitalize",
                        settings.editorFontSize === size ? "bg-parchment text-ink shadow-sm font-medium" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <ToggleSetting
                  icon={Feather}
                  title="Auto-save"
                  description="Automatically save your writing every few seconds"
                  checked={settings.autoSave}
                  onToggle={handleAutoSaveToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={theme === "dark" ? Sun : Moon}
                  title="Dark Mode"
                  description="Switch to a dark theme for night-time writing"
                  checked={theme === "dark"}
                  onToggle={handleThemeToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={Sparkles}
                  title="Spellcheck"
                  description="Highlight misspelled words as you type"
                  checked={settings.spellcheck}
                  onToggle={handleSpellcheckToggle}
                />
              </div>
            </div>
          </section>

          {/* Writing Tools */}
          <section>
            <h2 className="font-serif text-base font-semibold text-ink mb-1">Writing Tools</h2>
            <p className="text-xs text-ink-faint mb-4">
              Track your writing habits and progress.
            </p>
            <div className="rounded-xl border border-parchment-deep bg-parchment divide-y divide-parchment-deep">
              <div className="px-4">
                <ToggleSetting
                  icon={Target}
                  title="Daily Word Goal"
                  description="Show or hide daily goal tracking on your dashboard"
                  checked={settings.dailyWordGoalEnabled}
                  onToggle={handleDailyGoalToggle}
                />
              </div>
              <div className="px-4">
                <ToggleSetting
                  icon={Clock}
                  title="Session Timer"
                  description="Show a timer to track how long you write each session"
                  checked={settings.sessionTimer}
                  onToggle={handleSessionTimerToggle}
                />
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="rounded-xl border border-parchment-deep bg-parchment p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="w-4 h-4 text-ink-muted" />
                <h2 className="font-serif text-base font-semibold text-ink">About Prologue</h2>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                Prologue is a premium novel-writing studio built for serious fiction authors.
                Every decision in this product is made with the writer's experience in mind.
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-parchment-deep">
                <span className="text-xs text-ink-faint">Version 0.1.0</span>
                <span className="text-xs text-ink-faint">·</span>
                <span className="text-xs text-ink-faint">Made for writers</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
