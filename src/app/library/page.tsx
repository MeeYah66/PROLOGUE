"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Copy,
  Download,
  Feather,
  GripVertical,
  MoreHorizontal,
  Menu,
  Moon,
  Pencil,
  PenLine,
  Plus,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { createBook, deleteBook, getBooks, saveBook, updateChapter } from "@/lib/store";
import type { Book, BookStatus } from "@/lib/types";
import { cn, progressPercent, totalWordCount } from "@/lib/utils";
import { BookCard, AddBookCard } from "@/components/dashboard/BookCard";
import { AppNav } from "@/components/layout/AppNav";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme";
import { AmbientButton } from "@/components/ambient/AmbientButton";
import { useToast } from "@/lib/toast/context";
import { LinenBookThumbnail } from "@/components/cover/LinenBookThumbnail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  laneTone: string;
  progressTone: string;
}> = [
  {
    status: "draft",
    title: "Draft",
    hint: "Early ideas and first passes",
    dot: "bg-gold",
    laneTone: "bg-parchment-warm/45",
    progressTone: "bg-ink/60",
  },
  {
    status: "ongoing",
    title: "In Progress",
    hint: "Actively being written",
    dot: "bg-sage",
    laneTone: "bg-parchment-warm/45",
    progressTone: "bg-ink/60",
  },
  {
    status: "completed",
    title: "Completed",
    hint: "Ready and finished manuscripts",
    dot: "bg-ink-faint",
    laneTone: "bg-parchment-warm/45",
    progressTone: "bg-ink/60",
  },
];

function statusLabel(status: BookStatus): string {
  if (status === "draft") return "Draft";
  if (status === "ongoing") return "In Progress";
  return "Completed";
}

function formatBoardDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function KanbanCard({
  book,
  status,
  saving,
  onRename,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  book: Book;
  status: BookStatus;
  saving: boolean;
  onRename: (book: Book) => void;
  onDuplicate: (book: Book) => void;
  onDelete: (book: Book) => void;
  onDragStart: (bookId: string) => void;
  onDragEnd: () => void;
}) {
  const meta = COLUMN_META.find((column) => column.status === status)!;
  const wordCount = totalWordCount(book.chapters);
  const progress = progressPercent(wordCount, book.targetWordCount);
  const statusBadgeClass =
    book.status === "draft"
      ? "bg-parchment-deep text-ink-muted kanban-status-draft"
      : book.status === "ongoing"
        ? "bg-gold/25 text-gold-dark kanban-status-ongoing"
        : "bg-sage/25 text-sage-dark kanban-status-completed";

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
        "kanban-card rounded-xl border border-parchment-deep/75 bg-white overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:border-gold/35 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="kanban-card-head h-9 px-3 flex items-center justify-between border-b border-parchment-deep/70">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs font-medium text-ink truncate">{book.title}</p>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-md text-ink-faint hover:text-ink hover:bg-parchment transition-colors flex items-center justify-center" aria-label="Card options">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onRename(book)}>
                <Pencil className="w-3.5 h-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onDuplicate(book)}>
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500 cursor-pointer" onClick={() => onDelete(book)}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-3.5 pt-3.5 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <LinenBookThumbnail
            title={book.title}
            style={book.cover.style}
            subtitle={book.subtitle}
            author={book.authorName}
            imageUrl={book.cover.imageUrl}
            variant="card"
            className="h-[88px] w-[58px] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-ink-muted truncate">{book.genre}</p>
            <div className="space-y-1.5 mt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <BookOpen className="w-3.5 h-3.5 text-ink-faint" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Calendar className="w-3.5 h-3.5 text-ink-faint" />
                <span>Updated {formatBoardDate(book.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
            <span>{book.chapters.length} chapters</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-parchment-deep overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", meta.progressTone)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-ink-faint pt-1">
          <span className={cn("kanban-status-badge inline-flex items-center h-6 px-2.5 rounded-md text-[10px] font-semibold tracking-[0.02em]", statusBadgeClass)}>
            {statusLabel(book.status)}
          </span>
          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
          >
            Open
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {saving ? (
          <span className="inline-block mt-2 text-[10px] uppercase tracking-[0.14em] text-amber-label font-semibold">
            Saving
          </span>
        ) : null}
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  books,
  isActiveDrop,
  isDragging,
  isColumnDropTarget,
  isColumnDragging,
  savingBookId,
  onDragOver,
  onDragLeave,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  onRenameBook,
  onDuplicateBook,
  onDeleteBook,
  onCardDragStart,
  onCardDragEnd,
  showCreateNew,
}: {
  status: BookStatus;
  books: Book[];
  isActiveDrop: boolean;
  isDragging: boolean;
  isColumnDropTarget: boolean;
  isColumnDragging: boolean;
  savingBookId: string | null;
  onDragOver: (status: BookStatus) => void;
  onDragLeave: () => void;
  onDrop: (status: BookStatus, event: React.DragEvent<HTMLElement>) => void;
  onColumnDragStart: (status: BookStatus) => void;
  onColumnDragOver: (status: BookStatus) => void;
  onColumnDrop: (status: BookStatus) => void;
  onColumnDragEnd: () => void;
  onRenameBook: (book: Book) => void;
  onDuplicateBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onCardDragStart: (bookId: string) => void;
  onCardDragEnd: () => void;
  showCreateNew: boolean;
}) {
  const meta = COLUMN_META.find((column) => column.status === status)!;

  return (
    <section
      className={cn(
        "kanban-lane rounded-2xl border p-3 transition-colors",
        meta.laneTone,
        isColumnDropTarget ? "kanban-lane-column-drop ring-2 ring-ink/15 border-ink/25" : "",
        isActiveDrop
          ? "kanban-lane-card-drop border-gold/45 ring-2 ring-gold/20"
          : "border-parchment-deep/70"
      )}
      onDragOver={(event) => {
        if (isColumnDragging) {
          event.preventDefault();
          onColumnDragOver(status);
          return;
        }
        if (!isDragging) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver(status);
      }}
      onDragLeave={() => {
        if (isColumnDragging) return;
        if (!isDragging) return;
        onDragLeave();
      }}
      onDrop={(event) => {
        if (isColumnDragging) {
          event.preventDefault();
          onColumnDrop(status);
          return;
        }
        onDrop(status, event);
      }}
    >
      <div className="kanban-lane-head flex items-center justify-between mb-3 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", meta.dot)} />
            <h3 className="font-serif text-[15px] font-semibold text-ink truncate">{meta.title}</h3>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">{meta.hint}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="kanban-count-badge inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full border border-parchment-deep bg-parchment-warm text-[11px] font-medium text-ink">
            {books.length}
          </span>
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              onColumnDragStart(status);
            }}
            onDragEnd={onColumnDragEnd}
            className="kanban-move-handle w-6 h-6 rounded-md border border-parchment-deep/90 bg-parchment/75 text-ink-faint hover:text-ink transition-colors flex items-center justify-center cursor-move"
            aria-label={`Reorder ${meta.title} column`}
            title="Drag to reorder column"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-[420px] space-y-3">
        {books.length > 0 ? (
          books.map((book) => (
            <KanbanCard
              key={book.id}
              book={book}
              status={status}
              saving={savingBookId === book.id}
              onRename={onRenameBook}
              onDuplicate={onDuplicateBook}
              onDelete={onDeleteBook}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
            />
          ))
        ) : (
          <div className="kanban-empty rounded-xl border border-dashed border-parchment-deep/80 bg-parchment/55 px-3 py-8 text-center">
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
  const [columnOrder, setColumnOrder] = useState<BookStatus[]>([
    "draft",
    "ongoing",
    "completed",
  ]);
  const [draggingColumnStatus, setDraggingColumnStatus] = useState<BookStatus | null>(null);
  const [columnDropStatus, setColumnDropStatus] = useState<BookStatus | null>(null);
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

  const grouped: Record<BookStatus, Book[]> = {
    draft: filtered.filter((book) => book.status === "draft"),
    ongoing: filtered.filter((book) => book.status === "ongoing"),
    completed: filtered.filter((book) => book.status === "completed"),
  };

  const totalWords = books.reduce((sum, book) => sum + totalWordCount(book.chapters), 0);
  const totalChapters = books.reduce((sum, book) => sum + book.chapters.length, 0);

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteBook(user.id, id);
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }

  async function handleDeleteBook(book: Book) {
    const shouldDelete = window.confirm(`Delete "${book.title}"? This cannot be undone.`);
    if (!shouldDelete) return;
    await handleDelete(book.id);
    toast({
      variant: "success",
      title: "Manuscript deleted",
      description: `"${book.title}" has been removed from your library.`,
    });
  }

  async function handleRenameBook(book: Book) {
    if (!user) return;
    const nextTitle = window.prompt("Rename manuscript", book.title)?.trim();
    if (!nextTitle || nextTitle === book.title) return;

    const now = new Date().toISOString();
    const updated: Book = { ...book, title: nextTitle, updatedAt: now };

    setBooks((prev) => prev.map((item) => (item.id === book.id ? updated : item)));
    try {
      await saveBook(user.id, updated);
      toast({
        variant: "success",
        title: "Manuscript renamed",
        description: `"${book.title}" is now "${nextTitle}".`,
      });
    } catch {
      setBooks((prev) => prev.map((item) => (item.id === book.id ? book : item)));
      toast({
        variant: "error",
        title: "Rename failed",
        description: "Please try renaming this manuscript again.",
      });
    }
  }

  async function handleDuplicateBook(book: Book) {
    if (!user) return;
    const userId = user.id;
    const now = new Date().toISOString();
    const duplicateTitle = `${book.title} (Copy)`;

    try {
      const duplicated = await createBook(userId, {
        title: duplicateTitle,
        subtitle: book.subtitle,
        genre: book.genre,
        blurb: book.blurb,
        authorName: book.authorName,
        status: book.status,
        cover: book.cover,
        targetWordCount: book.targetWordCount,
        lastEditedChapterId: undefined,
      });

      const chapterIdMap = new Map<string, string>();
      const duplicatedChapters = book.chapters.map((chapter) => {
        const newId = crypto.randomUUID();
        chapterIdMap.set(chapter.id, newId);
        return {
          ...chapter,
          id: newId,
          createdAt: now,
          updatedAt: now,
        };
      });

      await Promise.all(
        duplicatedChapters.map((chapter) => updateChapter(userId, duplicated.id, chapter))
      );

      const duplicatedBook: Book = {
        ...duplicated,
        title: duplicateTitle,
        subtitle: book.subtitle,
        genre: book.genre,
        blurb: book.blurb,
        authorName: book.authorName,
        status: book.status,
        cover: book.cover,
        chapters: duplicatedChapters,
        notes: book.notes,
        targetWordCount: book.targetWordCount,
        lastEditedChapterId: book.lastEditedChapterId
          ? chapterIdMap.get(book.lastEditedChapterId)
          : undefined,
        updatedAt: now,
      };

      await saveBook(userId, duplicatedBook);
      setBooks((prev) => [duplicatedBook, ...prev]);
      toast({
        variant: "success",
        title: "Manuscript duplicated",
        description: `"${duplicateTitle}" is ready in your library.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Duplicate failed",
        description: "Could not duplicate this manuscript right now.",
      });
    }
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
      if (nextStatus === "completed") {
        toast({
          variant: "success",
          title: "Manuscript completed",
          description: `"${book.title}" is complete. Beautiful work, you just finished a story milestone.`,
        });
      } else if (nextStatus === "ongoing") {
        toast({
          variant: "success",
          title: "Back in progress",
          description: `"${book.title}" is now active. Keep the momentum going.`,
        });
      } else {
        toast({
          variant: "success",
          title: "Moved to draft",
          description: `"${book.title}" is in Draft, ready for fresh ideas and revisions.`,
        });
      }
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

  function handleColumnDragStart(status: BookStatus) {
    setDraggingColumnStatus(status);
    setColumnDropStatus(status);
  }

  function handleColumnDragOver(status: BookStatus) {
    if (!draggingColumnStatus) return;
    setColumnDropStatus(status);
  }

  function handleColumnDragEnd() {
    setDraggingColumnStatus(null);
    setColumnDropStatus(null);
  }

  function handleColumnDrop(targetStatus: BookStatus) {
    if (!draggingColumnStatus) return;
    if (draggingColumnStatus === targetStatus) {
      handleColumnDragEnd();
      return;
    }

    setColumnOrder((previous) => {
      const next = [...previous];
      const fromIndex = next.indexOf(draggingColumnStatus);
      const toIndex = next.indexOf(targetStatus);
      if (fromIndex === -1 || toIndex === -1) return previous;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggingColumnStatus);
      return next;
    });

    toast({
      variant: "success",
      title: "Board order updated",
      description: "Your column layout has been rearranged.",
    });
    handleColumnDragEnd();
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
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[2.25rem] font-semibold text-ink tracking-tight leading-none mb-2">
                Your Library
              </h1>
              {books.length > 0 && (
                <p className="text-[11px] font-sans uppercase tracking-[0.18em] text-ink-faint">
                {books.length} manuscript{books.length !== 1 ? "s" : ""}
                <span className="mx-2 opacity-40">&middot;</span>
                {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
                <span className="mx-2 opacity-40">&middot;</span>
                {totalWords.toLocaleString()} words
              </p>
            )}
            </div>
            {books.length > 0 && (
              <div className="shrink-0 flex items-center gap-2">
                <Link href="/export">
                  <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-parchment-deep bg-parchment text-sm font-medium text-ink hover:bg-parchment-warm transition-colors">
                    <Download className="w-3.5 h-3.5" strokeWidth={2} />
                    Export Manuscript
                  </button>
                </Link>
                <Link href="/books/new">
                  <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-ink text-parchment text-sm font-medium hover:bg-ink-soft transition-colors">
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
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

              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="kanban-view-toggle flex items-center gap-1 bg-parchment-warm border border-parchment-deep rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("board")}
                    className={cn(
                      "kanban-view-btn px-3 py-1 rounded-md text-xs transition-colors",
                      viewMode === "board"
                        ? "kanban-view-btn-active bg-parchment text-ink shadow-sm font-medium"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    Board
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "kanban-view-btn px-3 py-1 rounded-md text-xs transition-colors",
                      viewMode === "grid"
                        ? "kanban-view-btn-active bg-parchment text-ink shadow-sm font-medium"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    Grid
                  </button>
                </div>
              </div>

              {viewMode === "board" ? (
                <div className="kanban-shell rounded-[22px] border border-parchment-deep/85 bg-parchment/82 shadow-[0_8px_24px_rgba(0,0,0,0.05)] overflow-hidden mb-8">
                  <div className="p-2.5 md:p-3">
                    <div className="overflow-x-auto">
                      <div className="min-w-[790px] grid grid-cols-3 gap-3">
                        {columnOrder.map((status) => (
                          <KanbanColumn
                            key={status}
                            status={status}
                            books={grouped[status]}
                            isActiveDrop={dropStatus === status}
                            isDragging={Boolean(draggingBookId)}
                            isColumnDropTarget={
                              Boolean(draggingColumnStatus) && columnDropStatus === status
                            }
                            isColumnDragging={Boolean(draggingColumnStatus)}
                            savingBookId={statusSavingBookId}
                            onDragOver={setDropStatus}
                            onDragLeave={() => setDropStatus(null)}
                            onDrop={handleDrop}
                            onColumnDragStart={handleColumnDragStart}
                            onColumnDragOver={handleColumnDragOver}
                            onColumnDrop={handleColumnDrop}
                            onColumnDragEnd={handleColumnDragEnd}
                            onRenameBook={handleRenameBook}
                            onDuplicateBook={handleDuplicateBook}
                            onDeleteBook={handleDeleteBook}
                            onCardDragStart={handleCardDragStart}
                            onCardDragEnd={handleCardDragEnd}
                            showCreateNew={!query && status === "draft"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
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
