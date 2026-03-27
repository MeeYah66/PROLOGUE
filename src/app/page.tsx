"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ArrowRight, PenLine, Sun, Moon, Bell, Menu, X } from "lucide-react";
import { getBooks, deleteBook } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount } from "@/lib/utils";
import { BookCard, AddBookCard } from "@/components/dashboard/BookCard";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

function getGreeting(hour: number): string {
  if (hour < 5)  return "Writing into the night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

function localDateStr(iso: string): string {
  // Convert UTC ISO to local YYYY-MM-DD
  return new Date(iso).toLocaleDateString("en-CA"); // "en-CA" gives YYYY-MM-DD
}

function computeStreak(books: Book[]): number {
  const activityDates = new Set<string>();
  for (const book of books) {
    activityDates.add(localDateStr(book.updatedAt));
    for (const ch of book.chapters) {
      activityDates.add(localDateStr(ch.updatedAt));
    }
  }
  const todayStr = new Date().toLocaleDateString("en-CA");
  if (!activityDates.has(todayStr)) return 0;
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    if (activityDates.has(cursor.toLocaleDateString("en-CA"))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function computeWordsToday(books: Book[]): number {
  const todayStr = new Date().toLocaleDateString("en-CA");
  let total = 0;
  for (const book of books) {
    for (const ch of book.chapters) {
      if (localDateStr(ch.updatedAt) === todayStr) total += ch.wordCount;
    }
  }
  return total;
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({
  user,
  streak,
  wordsToday,
  manuscriptCount,
  featuredBook,
}: {
  user: { name: string };
  streak: number;
  wordsToday: number;
  manuscriptCount: number;
  featuredBook: Book | null;
}) {
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);

  const firstName = user.name.split(" ")[0];
  const greeting  = getGreeting(hour);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  const lastCh = featuredBook
    ? (featuredBook.chapters.find((c) => c.id === featuredBook.lastEditedChapterId) ?? featuredBook.chapters.at(-1))
    : null;

  const contextLine = lastCh
    ? `You left off at Chapter ${lastCh.number} — ${lastCh.title}`
    : null;

  const ctaHref  = featuredBook ? `/books/${featuredBook.id}` : "/books/new";
  const ctaLabel = featuredBook ? "Continue Writing" : "Start Writing";

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-8"
      style={{
        backgroundColor: "#F5F0E8",
        boxShadow: "0 1px 3px rgba(26,20,14,0.05), 0 4px 18px rgba(26,20,14,0.04)",
      }}
    >

      {/* Grain — very subtle */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Gold blush — top right */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 70% at 105% -5%, rgba(201,168,76,0.10) 0%, transparent 60%)" }} />
      {/* Warm blush — bottom left */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at -5% 110%, rgba(180,120,40,0.07) 0%, transparent 55%)" }} />
      {/* Gold hairline */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.55) 35%, rgba(201,168,76,0.30) 65%, transparent 100%)" }} />

      <div className="relative flex flex-col px-9 pt-[30px] pb-7">

        {/* ── Top row: greeting + stat boxes ── */}
        <div className="flex items-start justify-between gap-8 mb-[18px]">

          {/* Left — date + greeting */}
          <div>
            {/* #7A5C14 on #F5F0E8 → 5.6:1 ✓ AA */}
            <p className="text-[10px] font-sans uppercase tracking-[0.22em] mb-3" style={{ color: "#7A5C14" }}>
              {today}
            </p>
            {/* #1a1408 on #F5F0E8 → 15.4:1 ✓ AAA */}
            <h2 className="font-serif text-[2rem] font-semibold leading-[1.15] tracking-tight" style={{ color: "#1a1408" }}>
              {greeting}, {firstName}.
            </h2>
          </div>

          {/* Right — stat boxes */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Streak box — left accent when active signals the earned state */}
            <div
              className="flex flex-col items-center px-[18px] py-[10px] rounded-xl min-w-[72px]"
              style={{
                background:    streak > 0 ? "rgba(201,168,76,0.11)" : "rgba(26,20,14,0.04)",
                border:        streak > 0 ? "1px solid rgba(201,168,76,0.28)" : "1px solid rgba(26,20,14,0.09)",
                borderLeft:    streak > 0 ? "2.5px solid rgba(180,130,30,0.55)" : "1px solid rgba(26,20,14,0.09)",
              }}
            >
              {/* #6B4F0E on gold-tint box → 6.35:1 ✓ AAA */}
              <span className="font-serif text-[1.35rem] font-semibold leading-none" style={{ color: streak > 0 ? "#6B4F0E" : "#1a1408" }}>
                {streak}
              </span>
              {/* #7A5610 on gold-tint box → 5.52:1 ✓ AA  |  rgba(26,20,14,0.58) on plain box → 4.78:1 ✓ AA */}
              <span className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1.5 leading-none whitespace-nowrap" style={{ color: streak > 0 ? "#7A5610" : "rgba(26,20,14,0.58)" }}>
                Day Streak
              </span>
            </div>

            <div
              className="hidden sm:flex flex-col items-center px-[18px] py-[10px] rounded-xl border min-w-[72px]"
              style={{ background: "rgba(26,20,14,0.04)", borderColor: "rgba(26,20,14,0.09)" }}
            >
              {/* #1a1408 → 14:1 ✓ AAA */}
              <span className="font-serif text-[1.35rem] font-semibold leading-none" style={{ color: "#1a1408" }}>
                {wordsToday.toLocaleString()}
              </span>
              {/* rgba(26,20,14,0.58) → 4.78:1 ✓ AA */}
              <span className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1.5 leading-none whitespace-nowrap" style={{ color: "rgba(26,20,14,0.58)" }}>
                Words Today
              </span>
            </div>

            <div
              className="hidden sm:flex flex-col items-center px-[18px] py-[10px] rounded-xl border min-w-[72px]"
              style={{ background: "rgba(26,20,14,0.04)", borderColor: "rgba(26,20,14,0.09)" }}
            >
              <span className="font-serif text-[1.35rem] font-semibold leading-none" style={{ color: "#1a1408" }}>
                {manuscriptCount}
              </span>
              <span className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1.5 leading-none whitespace-nowrap" style={{ color: "rgba(26,20,14,0.58)" }}>
                {manuscriptCount === 1 ? "Manuscript" : "Manuscripts"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom frame: context + CTA ── */}
        {featuredBook && (
          <div
            className="flex items-center justify-between gap-5 px-[18px] py-[14px] rounded-xl"
            style={{
              background:  "rgba(26,20,14,0.03)",
              border:      "1px solid rgba(26,20,14,0.08)",
              borderLeft:  "2.5px solid rgba(180,140,40,0.42)",
            }}
          >
            <div className="min-w-0">
              {contextLine && (
                /* rgba(26,20,14,0.62) → 5.44:1 ✓ AA */
                <p className="font-serif text-[1.05rem] leading-relaxed" style={{ color: "rgba(26,20,14,0.62)" }}>
                  {contextLine}
                </p>
              )}
              {/* rgba(26,20,14,0.60) on frame bg → 5.0:1 ✓ AA */}
              <p className="font-serif italic text-[0.9rem] leading-relaxed" style={{ color: "rgba(26,20,14,0.60)" }}>
                Your story is still waiting for you.
              </p>
            </div>
            <Button asChild size="sm" variant="gold" className="shrink-0 rounded-[9px] px-5 text-[13px] font-semibold gap-[7px]">
              <Link href={ctaHref}>
                <PenLine className="w-3.5 h-3.5" strokeWidth={1.8} />
                {ctaLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({
  query,
  onQuery,
  onOpenNav,
}: {
  query: string;
  onQuery: (v: string) => void;
  onOpenNav: () => void;
}) {
  const [dark, setDark]               = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);

  // Mobile: full-width search overlay
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

      {/* Left — hamburger (mobile) + search field (desktop) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNav}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          title="Menu"
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

      {/* Right — search icon (mobile) + theme + notifications */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          title="Search"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>

        <button
          onClick={() => setDark((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark
            ? <Sun  className="w-3.5 h-3.5" strokeWidth={1.8} />
            : <Moon className="w-3.5 h-3.5" strokeWidth={1.8} />
          }
        </button>

        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyLibrary({ userName }: { userName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-parchment-warm flex items-center justify-center mb-5">
        <PenLine className="w-6 h-6 text-ink-faint" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-2xl font-semibold text-ink mb-3">
        Your library awaits, {userName.split(" ")[0]}.
      </h2>
      <p className="text-sm text-ink-muted leading-relaxed max-w-xs mb-2">
        A blank page is not an empty thing — it holds every story you haven&apos;t written yet.
      </p>
      <p className="text-xs text-ink-faint mb-10">
        Begin your first manuscript to get started.
      </p>
      <Link href="/books/new">
        <button className="flex items-center gap-2 bg-ink text-parchment px-6 py-3 rounded-xl font-sans font-medium text-sm hover:bg-ink-soft transition-colors shadow-sm">
          <PenLine className="w-3.5 h-3.5" />
          Create Your First Manuscript
        </button>
      </Link>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks]       = useState<Book[]>([]);
  const [query, setQuery]       = useState("");
  const [booksReady, setBooksReady]   = useState(false);
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

  const featured = sorted[0] ?? null;

  const filtered = sorted.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.genre.toLowerCase().includes(query.toLowerCase()) ||
      b.authorName.toLowerCase().includes(query.toLowerCase())
  );

  const rest = query ? filtered : filtered.filter((b) => b.id !== featured?.id);

  const totalWords    = books.reduce((s, b) => s + totalWordCount(b.chapters), 0);
  const totalChapters = books.reduce((s, b) => s + b.chapters.length, 0);
  const inProgress    = books.filter((b) => b.status === "ongoing").length;

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteBook(user.id, id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-12">

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <TopBar query={query} onQuery={setQuery} onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-6 md:pt-8 pb-0 max-w-5xl mx-auto">

          {/* ── Hero Banner ─────────────────────────────────────────────── */}
          <HeroBanner
            user={user!}
            streak={computeStreak(books)}
            wordsToday={computeWordsToday(books)}
            manuscriptCount={books.length}
            featuredBook={books.length > 0 ? featured : null}
          />

          {/* ── Page header ─────────────────────────────────────────────── */}
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
        </div>

        <div className="px-4 md:px-8 max-w-5xl mx-auto">

          {/* ── Empty library ─────────────────────────────────────────────── */}
          {books.length === 0 && <EmptyLibrary userName={user?.name ?? "Writer"} />}

          {/* ── Book grid ───────────────────────────────────────────────── */}
          {rest.length > 0 ? (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-sans uppercase tracking-[0.16em] font-semibold text-ink-faint">
                  {query ? `Results for "${query}"` : "All Manuscripts"}
                </span>
                <div className="flex-1 h-px bg-parchment-deep" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onDelete={handleDelete}
                  />
                ))}
                {!query && <AddBookCard />}
              </div>
            </section>
          ) : query ? (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-ink-muted mb-2">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-ink-faint">Try a different title or genre.</p>
            </div>
          ) : null}

        </div>
      </main>
    </div>
  );
}
