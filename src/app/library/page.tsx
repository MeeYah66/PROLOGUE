"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Download,
  Feather,
  Menu,
  Moon,
  PenLine,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { getBooks, deleteBook, saveBook } from "@/lib/store";
import type { Book, BookStatus } from "@/lib/types";
import { cn, progressPercent, totalWordCount } from "@/lib/utils";
import { BookCard, AddBookCard } from "@/components/dashboard/BookCard";
import { AppNav } from "@/components/layout/AppNav";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme";
import { AmbientButton } from "@/components/ambient/AmbientButton";
import { useToast } from "@/lib/toast/context";

function TopBar({
  query,
  onQuery,
  onOpenNav,
}: {
  query: string;
  onQuery: (v: string) => void;
  onOpenNav: () => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle } = useTheme();

  if (searchOpen) {
    return (
      <div className="sticky top-0 z-30 flex items-center h-12 px-3 gap-2 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search manuscripts..."
            className="w-full pl-9 pr-4 py-1.5 bg-transparent rounded-lg text-sm font-sans text-ink placeholder:text-ink-faint/60 border border-parchment-deep focus:outline-none focus:border-ink-faint"
          />
        </div>
        <button
          onClick={() => {
            setSearchOpen(false);
            onQuery("");
          }}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-parchment-deep text-ink-faint hover:text-ink transition-all"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-12 px-3 md:px-6 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
        >
          <Menu className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search manuscripts..."
            className="pl-9 pr-4 py-1.5 w-64 bg-parchment/50 rounded-lg text-sm font-sans text-ink placeholder:text-ink-faint/60 border border-parchment-deep/70 focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/10 transition-all focus:w-80 duration-200"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>
        <AmbientButton />
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5" strokeWidth={1.8} />
          ) : (
            <Moon className="w-3.5 h-3.5" strokeWidth={1.8} />
          )}
        </button>
        <button
          aria-label="Notifications"
          className="relative w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
        >
          <Bell className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
        </button>
      </div>
    </div>
  );
}

function EmptyLibrary() {
  const steps = [
    { n: "01", text: "Give your story a name" },
    { n: "02", text: "Write your first chapter" },
    { n: "03", text: "Come back tomorrow and keep going" },
  ];

  return (
    <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-parchment-warm border border-parchment-deep/60 flex items-center justify-center mx-auto mb-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <Feather className="w-7 h-7 text-ink-muted" strokeWidth={1.2} />
      </div>

      <h2 className="font-serif text-[2rem] font-semibold text-ink leading-tight tracking-tight mb-4">
        The library is quiet
        <br />
        for now.
      </h2>

      <p className="text-sm text-ink-muted leading-relaxed max-w-lg mx-auto mb-3">
        Every published novel started as a blank document and a stubborn writer
        who refused to quit.
      </p>
      <p className="text-sm text-ink-muted leading-relaxed max-w-lg mx-auto mb-12">
        Yours begins today.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        {steps.map((step, index) => (
          <div key={step.n} className="flex items-center gap-3">
            <div className="rounded-2xl bg-parchment-warm/50 border border-parchment-deep/60 px-5 py-3.5 text-left min-w-[160px]">
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-amber-label mb-1">
                {step.n}
              </p>
              <p className="text-sm font-serif text-ink leading-snug">{step.text}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden sm:block w-6 h-px bg-parchment-deep/60" />
            )}
          </div>
        ))}
      </div>

      <Link href="/books/new">
        <button className="inline-flex items-center gap-2 bg-ink text-parchment px-7 py-3 rounded-xl font-sans font-medium text-sm hover:bg-ink-soft transition-all duration-200 shadow-sm">
          <PenLine className="w-3.5 h-3.5" strokeWidth={2} />
          Start your first manuscript
        </button>
      </Link>

      <p className="mt-6 text-[11px] text-ink-faint/60 font-serif italic">
        No pressure. No word count. Just you and a blank page.
      </p>
    </div>
  );
}

function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-parchment-warm/50 border border-parchment-deep/60 flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-5 h-5 text-ink-faint" strokeWidth={1.5} />
      </div>
      <p className="font-serif text-xl font-semibold text-ink mb-2">
        No manuscript named &ldquo;{query}&rdquo; yet.
      </p>
      <p className="text-sm text-ink-muted leading-relaxed">
        Maybe that&apos;s the title of your next one.
      </p>
    </div>
  );
}

const COLUMN_META: Array<{
  status: BookStatus;
  title: string;
  hint: string;
  dot: string;
}> = [
  {
    status: "draft",
    title: "Draft",
    hint: "Early ideas and first passes",
    dot: "bg-gold/80",
  },
  {
    status: "ongoing",
    title: "In Progress",
    hint: "Actively being written",
    dot: "bg-ink-faint",
  },
  {
    status: "completed",
    title: "Completed",
    hint: "Ready and finished manuscripts",
    dot: "bg-sage",
  },
];

function statusLabel(status: BookStatus): string {
  if (status === "draft") return "Draft";
  if (status === "ongoing") return "In Progress";
  return "Completed";
}

function KanbanCard({
  book,
  saving,
  onDragStart,
  onDragEnd,
}: {
  book: Book;
  saving: boolean;
  onDragStart: (bookId: string) => void;
  onDragEnd: () => void;
}) {
  const wordCount = totalWordCount(book.chapters);
  const progress = progressPercent(wordCount, book.targetWordCount);

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", book.id);
        onDragStart(book.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-xl border border-parchment-deep bg-white p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:border-gold/35 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-serif text-sm font-semibold text-ink leading-snug truncate">
            {book.title}
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5 truncate">{book.genre}</p>
        </div>
        {saving ? (
          <span className="text-[10px] uppercase tracking-[0.14em] text-amber-label font-semibold">
            Saving
          </span>
        ) : null}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{progress}%</span>
        </div>
        <div className="h-[3px] rounded-full bg-parchment-deep overflow-hidden">
          <div
            className="h-full rounded-full bg-ink/70 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-ink-faint">
        <span>{book.chapters.length} chapters</span>
        <Link
          href={`/books/${book.id}`}
          className="inline-flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
        >
          Open
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  books,
  isActiveDrop,
  isDragging,
  savingBookId,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  showCreateNew,
}: {
  status: BookStatus;
  books: Book[];
  isActiveDrop: boolean;
  isDragging: boolean;
  savingBookId: string | null;
  onDragOver: (status: BookStatus) => void;
  onDragLeave: () => void;
  onDrop: (status: BookStatus, event: React.DragEvent<HTMLElement>) => void;
  onCardDragStart: (bookId: string) => void;
  onCardDragEnd: () => void;
  showCreateNew: boolean;
}) {
  const meta = COLUMN_META.find((column) => column.status === status)!;

  return (
    <section
      className={cn(
        "rounded-xl border bg-parchment p-3 transition-colors",
        isActiveDrop
          ? "border-gold/45 ring-2 ring-gold/25"
          : "border-parchment-deep"
      )}
      onDragOver={(event) => {
        if (!isDragging) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(status);
      }}
      onDragLeave={() => {
        if (!isDragging) return;
        onDragLeave();
      }}
      onDrop={(event) => onDrop(status, event)}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
            <h3 className="font-serif text-sm font-semibold text-ink">{meta.title}</h3>
          </div>
          <p className="text-[11px] text-ink-faint mt-0.5">{meta.hint}</p>
        </div>
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full border border-parchment-deep bg-parchment-warm text-[11px] font-medium text-ink">
          {books.length}
        </span>
      </div>

      <div className="min-h-[190px] space-y-2.5">
        {books.length > 0 ? (
          books.map((book) => (
            <KanbanCard
              key={book.id}
              book={book}
              saving={savingBookId === book.id}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-parchment-deep bg-parchment-warm/35 px-3 py-5 text-center">
            <p className="text-xs text-ink-faint">Drop a manuscript here</p>
            {showCreateNew && (
              <Link
                href="/books/new"
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-ink-muted hover:text-ink transition-colors"
              >
                <Plus className="w-3 h-3" />
                New manuscript
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksReady, setBooksReady] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "grid">("board");
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<BookStatus | null>(null);
  const [statusSavingBookId, setStatusSavingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getBooks(user.id).then((items) => {
      setBooks(items);
      setBooksReady(true);
    });
  }, [user]);

  if (authLoading || !booksReady) {
    return (
      <div className="flex min-h-screen bg-parchment">
        <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 md:ml-48 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-ink/15 border-t-ink/60 animate-spin" />
        </main>
      </div>
    );
  }

  const sorted = [...books].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const filtered = sorted.filter(
    (book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.genre.toLowerCase().includes(query.toLowerCase()) ||
      book.authorName.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = {
    draft: filtered.filter((book) => book.status === "draft"),
    ongoing: filtered.filter((book) => book.status === "ongoing"),
    completed: filtered.filter((book) => book.status === "completed"),
  };

  const totalWords = books.reduce((sum, book) => sum + totalWordCount(book.chapters), 0);
  const totalChapters = books.reduce((sum, book) => sum + book.chapters.length, 0);
  const inProgress = books.filter((book) => book.status === "ongoing").length;

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteBook(user.id, id);
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }

  async function moveBookToStatus(bookId: string, nextStatus: BookStatus) {
    if (!user) return;
    const book = books.find((item) => item.id === bookId);
    if (!book) return;

    if (book.status === nextStatus) {
      toast({
        variant: "info",
        title: "No status change",
        description: `"${book.title}" is already in ${statusLabel(nextStatus)}.`,
      });
      return;
    }

    const previousStatus = book.status;
    const nextUpdatedAt = new Date().toISOString();

    setBooks((prev) =>
      prev.map((item) =>
        item.id === bookId
          ? { ...item, status: nextStatus, updatedAt: nextUpdatedAt }
          : item
      )
    );
    setStatusSavingBookId(bookId);

    try {
      await saveBook(user.id, {
        ...book,
        status: nextStatus,
        updatedAt: nextUpdatedAt,
      });
      toast({
        variant: "success",
        title: "Status updated",
        description: `"${book.title}" moved to ${statusLabel(nextStatus)}.`,
      });
    } catch {
      setBooks((prev) =>
        prev.map((item) =>
          item.id === bookId ? { ...item, status: previousStatus } : item
        )
      );
      toast({
        variant: "error",
        title: "Could not update manuscript status",
        description: "Please try dragging the manuscript again.",
      });
    } finally {
      setStatusSavingBookId(null);
    }
  }

  function handleCardDragStart(bookId: string) {
    setDraggingBookId(bookId);
  }

  function handleCardDragEnd() {
    setDraggingBookId(null);
    setDropStatus(null);
  }

  async function handleDrop(status: BookStatus, event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    const droppedBookId = draggingBookId || event.dataTransfer.getData("text/plain");
    if (!droppedBookId) {
      handleCardDragEnd();
      return;
    }
    await moveBookToStatus(droppedBookId, status);
    handleCardDragEnd();
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--page-gradient)" }}>
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-14">
        <TopBar query={query} onQuery={setQuery} onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-8 pb-0 max-w-5xl mx-auto">
          <div className="flex items-end justify-between gap-5 mb-8">
            <div>
              <h1 className="font-serif text-[2.25rem] font-semibold text-ink tracking-tight leading-none mb-2">
                Your Library
              </h1>
              {books.length > 0 && (
                <p className="text-[11px] font-sans uppercase tracking-[0.18em] text-ink-faint">
                  {books.length} manuscript{books.length !== 1 ? "s" : ""}
                  <span className="mx-2 opacity-40">·</span>
                  {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
                  <span className="mx-2 opacity-40">·</span>
                  {totalWords.toLocaleString()} words
                  {inProgress > 0 && (
                    <>
                      <span className="mx-2 opacity-40">·</span>
                      <span className="text-sage">{inProgress} in progress</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {books.length > 0 && (
              <div className="shrink-0 flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-parchment-warm border border-parchment-deep rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("board")}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs transition-colors",
                      viewMode === "board"
                        ? "bg-parchment text-ink shadow-sm font-medium"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    Board
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs transition-colors",
                      viewMode === "grid"
                        ? "bg-parchment text-ink shadow-sm font-medium"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    Grid
                  </button>
                </div>

                <Link href="/export">
                  <button className="flex items-center gap-1.5 bg-parchment text-ink px-4 py-2 rounded-lg border border-parchment-deep font-sans font-medium text-sm hover:bg-parchment-warm transition-colors duration-200 whitespace-nowrap">
                    <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
                    Export Manuscript
                  </button>
                </Link>
                <Link href="/books/new">
                  <button className="flex items-center gap-1.5 bg-ink text-parchment px-4 py-2 rounded-lg font-sans font-medium text-sm hover:bg-ink-soft transition-colors duration-200 shadow-sm whitespace-nowrap">
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    New Manuscript
                  </button>
                </Link>
              </div>
            )}
          </div>

          {books.length === 0 ? (
            <EmptyLibrary />
          ) : filtered.length > 0 ? (
            <section>
              {query && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-sans uppercase tracking-[0.16em] font-semibold text-ink-faint">
                    Results for &ldquo;{query}&rdquo;
                  </span>
                  <div className="flex-1 h-px bg-parchment-deep/60" />
                </div>
              )}

              {viewMode === "board" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-8">
                  <KanbanColumn
                    status="draft"
                    books={grouped.draft}
                    isActiveDrop={dropStatus === "draft"}
                    isDragging={Boolean(draggingBookId)}
                    savingBookId={statusSavingBookId}
                    onDragOver={setDropStatus}
                    onDragLeave={() => setDropStatus(null)}
                    onDrop={handleDrop}
                    onCardDragStart={handleCardDragStart}
                    onCardDragEnd={handleCardDragEnd}
                    showCreateNew={!query}
                  />
                  <KanbanColumn
                    status="ongoing"
                    books={grouped.ongoing}
                    isActiveDrop={dropStatus === "ongoing"}
                    isDragging={Boolean(draggingBookId)}
                    savingBookId={statusSavingBookId}
                    onDragOver={setDropStatus}
                    onDragLeave={() => setDropStatus(null)}
                    onDrop={handleDrop}
                    onCardDragStart={handleCardDragStart}
                    onCardDragEnd={handleCardDragEnd}
                    showCreateNew={false}
                  />
                  <KanbanColumn
                    status="completed"
                    books={grouped.completed}
                    isActiveDrop={dropStatus === "completed"}
                    isDragging={Boolean(draggingBookId)}
                    savingBookId={statusSavingBookId}
                    onDragOver={setDropStatus}
                    onDragLeave={() => setDropStatus(null)}
                    onDrop={handleDrop}
                    onCardDragStart={handleCardDragStart}
                    onCardDragEnd={handleCardDragEnd}
                    showCreateNew={false}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                  {filtered.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={handleDelete} />
                  ))}
                  {!query && <AddBookCard />}
                </div>
              )}
            </section>
          ) : (
            <NoSearchResults query={query} />
          )}
        </div>
      </main>
    </div>
  );
}
