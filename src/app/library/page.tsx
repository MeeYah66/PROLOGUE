"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Menu, Bell, Moon, Sun, X, PenLine } from "lucide-react";
import { getBooks, deleteBook } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount } from "@/lib/utils";
import { BookCard, AddBookCard } from "@/components/dashboard/BookCard";
import { AppNav } from "@/components/layout/AppNav";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme";
import { AmbientButton } from "@/components/ambient/AmbientButton";

// ─── Top Bar ──────────────────────────────────────────────────────────────────

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
      <div className="sticky top-0 z-30 flex items-center h-12 px-3 gap-2 bg-white/95 backdrop-blur-sm border-b border-parchment-deep md:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search manuscripts..."
            className="w-full pl-9 pr-4 py-1.5 bg-transparent rounded-lg text-sm font-sans text-ink placeholder:text-ink-faint/60 border border-parchment-deep focus:outline-none focus:border-ink-faint"
          />
        </div>
        <button
          onClick={() => { setSearchOpen(false); onQuery(""); }}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-parchment-deep text-ink-faint hover:text-ink transition-all"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-12 px-3 md:px-6 bg-white/95 backdrop-blur-sm border-b border-parchment-deep">
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
            className="pl-9 pr-4 py-1.5 w-64 bg-transparent rounded-lg text-sm font-sans text-ink placeholder:text-ink-faint/60 border border-parchment-deep focus:outline-none focus:border-ink-faint transition-all focus:w-80"
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
          {theme === "dark"
            ? <Sun className="w-3.5 h-3.5" strokeWidth={1.8} />
            : <Moon className="w-3.5 h-3.5" strokeWidth={1.8} />}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks]           = useState<Book[]>([]);
  const [booksReady, setBooksReady] = useState(false);
  const [query, setQuery]           = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBooks(user.id).then((b) => {
      setBooks(b);
      setBooksReady(true);
    });
  }, [user]);

  if (authLoading || !booksReady) {
    return (
      <div className="flex min-h-screen bg-white">
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
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.genre.toLowerCase().includes(query.toLowerCase()) ||
      b.authorName.toLowerCase().includes(query.toLowerCase())
  );

  const totalWords    = books.reduce((s, b) => s + totalWordCount(b.chapters), 0);
  const totalChapters = books.reduce((s, b) => s + b.chapters.length, 0);
  const inProgress    = books.filter((b) => b.status === "ongoing").length;

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteBook(user.id, id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-14">
        <TopBar query={query} onQuery={setQuery} onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-8 pb-0 max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-end justify-between gap-5 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-ink tracking-tight leading-none mb-2">
                Your Library
              </h1>
              {books.length > 0 ? (
                <p className="text-[11px] font-sans uppercase tracking-[0.14em] text-ink-faint">
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
              ) : (
                <p className="text-[11px] font-sans uppercase tracking-[0.14em] text-ink-faint">
                  No manuscripts yet
                </p>
              )}
            </div>

            {books.length > 0 && (
              <Link href="/books/new" className="shrink-0">
                <button className="flex items-center gap-1.5 bg-ink text-parchment px-4 py-2 rounded-lg font-sans font-medium text-sm hover:bg-ink-soft transition-colors shadow-sm whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  New Book
                </button>
              </Link>
            )}
          </div>

          {/* ── Book Grid / Empty State ─────────────────────────────────────── */}
          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-parchment-warm flex items-center justify-center mb-5">
                <PenLine className="w-6 h-6 text-ink-faint" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-ink mb-3">
                Your library awaits.
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed max-w-xs mb-2">
                A blank page is not an empty thing — it holds every story you haven&apos;t written yet.
              </p>
              <p className="text-xs text-ink-faint mb-10">
                Begin your first manuscript to get started.
              </p>
              <Link href="/books/new">
                <button className="flex items-center gap-2 bg-ink text-parchment px-6 py-3 rounded-xl font-sans font-medium text-sm hover:bg-ink-soft transition-colors shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Manuscript
                </button>
              </Link>
            </div>
          ) : filtered.length > 0 ? (
            <section>
              {query && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-sans uppercase tracking-[0.16em] font-semibold text-ink-faint">
                    Results for &ldquo;{query}&rdquo;
                  </span>
                  <div className="flex-1 h-px bg-parchment-deep" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((book) => (
                  <BookCard key={book.id} book={book} onDelete={handleDelete} />
                ))}
                {!query && <AddBookCard />}
              </div>
            </section>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-ink-muted mb-2">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-ink-faint">Try a different title, genre, or author name.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
