"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Menu, Bell, Moon, Sun, X, PenLine, BookOpen, Feather } from "lucide-react";
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
      <div className="sticky top-0 z-30 flex items-center h-12 px-3 gap-2 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep md:hidden">
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

// ─── Empty Library ────────────────────────────────────────────────────────────

function EmptyLibrary() {
  const steps = [
    { n: "01", text: "Give your story a name" },
    { n: "02", text: "Write your first chapter" },
    { n: "03", text: "Come back tomorrow and keep going" },
  ];

  return (
    <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 text-center">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-parchment-warm border border-parchment-deep/60 flex items-center justify-center mx-auto mb-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
        <Feather className="w-7 h-7 text-ink-muted" strokeWidth={1.2} />
      </div>

      {/* Headline */}
      <h2 className="font-serif text-[2rem] font-semibold text-ink leading-tight tracking-tight mb-4">
        The library is quiet<br />for now.
      </h2>

      {/* Atmospheric subtext */}
      <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto mb-3">
        Every published novel started as a blank document and a stubborn writer who refused to quit.
      </p>
      <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto mb-12">
        Yours begins today.
      </p>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className="rounded-2xl bg-parchment-warm/50 border border-parchment-deep/60 px-5 py-3.5 text-left min-w-[160px]">
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-amber-label mb-1">{s.n}</p>
              <p className="text-sm font-serif text-ink leading-snug">{s.text}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block w-6 h-px bg-parchment-deep/60" />
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/books/new">
        <button className="inline-flex items-center gap-2 bg-ink text-parchment px-7 py-3 rounded-xl font-sans font-medium text-sm hover:bg-ink-soft transition-all duration-200 shadow-sm">
          <PenLine className="w-3.5 h-3.5" strokeWidth={2} />
          Start your first manuscript
        </button>
      </Link>

      {/* Quiet note */}
      <p className="mt-6 text-[11px] text-ink-faint/60 font-serif italic">
        No pressure. No word count. Just you and a blank page.
      </p>
    </div>
  );
}

// ─── No Search Results ────────────────────────────────────────────────────────

function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-parchment-warm/50 border border-parchment-deep/60 flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-5 h-5 text-ink-faint" strokeWidth={1.5} />
      </div>
      <p className="font-serif text-xl font-semibold text-ink mb-2">
        No manuscript named &ldquo;{query}&rdquo; — yet.
      </p>
      <p className="text-sm text-ink-muted leading-relaxed">
        Maybe that&apos;s the title of your next one.
      </p>
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
    <div className="flex min-h-screen" style={{ background: "linear-gradient(to bottom, #f8f3ec 0%, #faf8f5 25%, #faf8f5 65%, #f6f7f9 100%)" }}>
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-14">
        <TopBar query={query} onQuery={setQuery} onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-8 pb-0 max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────────── */}
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
              <Link href="/books/new" className="shrink-0">
                <button className="flex items-center gap-1.5 bg-ink text-parchment px-4 py-2 rounded-lg font-sans font-medium text-sm hover:bg-ink-soft transition-colors duration-200 shadow-sm whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  New Manuscript
                </button>
              </Link>
            )}
          </div>

          {/* ── Book Grid / Empty States ────────────────────────────────────── */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((book) => (
                  <BookCard key={book.id} book={book} onDelete={handleDelete} />
                ))}
                {!query && <AddBookCard />}
              </div>
            </section>
          ) : (
            <NoSearchResults query={query} />
          )}

        </div>
      </main>
    </div>
  );
}
