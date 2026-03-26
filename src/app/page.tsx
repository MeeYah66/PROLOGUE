"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, ArrowRight, PenLine, Sun, Moon, Bell, Menu, X } from "lucide-react";
import { getBooks, deleteBook } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount, progressPercent } from "@/lib/utils";
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

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner({
  user,
  streak,
  wordsToday,
  manuscriptCount,
}: {
  user: { name: string };
  streak: number;
  wordsToday: number;
  manuscriptCount: number;
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

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: "#19130e" }}>

      {/* SVG noise grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Warm amber glow — bottom left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 90% at 0% 110%, rgba(180,110,40,0.32) 0%, transparent 65%)",
        }}
      />
      {/* Cooler deep glow — top right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 60% at 100% 0%, rgba(80,60,40,0.25) 0%, transparent 60%)",
        }}
      />

      {/* Gold hairline — top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 40%, rgba(201,168,76,0.3) 60%, transparent 100%)" }}
      />

      <div className="relative px-8 py-6 flex items-center justify-between gap-6">
        {/* Left — date + greeting (unchanged) */}
        <div>
          <p
            className="text-[10px] font-sans uppercase tracking-[0.22em] mb-2"
            style={{ color: "rgba(201,168,76,0.55)" }}
          >
            {today}
          </p>
          <h2
            className="font-serif text-[1.85rem] font-semibold leading-[1.15] tracking-tight"
            style={{ color: "#f0e6d3" }}
          >
            {greeting}, {firstName}.
          </h2>
        </div>

        {/* Right — accountability badges */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak — always visible, gold when active */}
          <div
            className="flex flex-col items-center px-4 py-2 rounded-xl border"
            style={{
              background:  streak > 0 ? "rgba(201,168,76,0.15)" : "rgba(0,0,0,0.25)",
              borderColor: streak > 0 ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="font-serif text-xl font-semibold leading-none tabular-nums"
              style={{ color: streak > 0 ? "#c9a84c" : "#f0e6d3" }}
            >
              {streak}
            </span>
            <span
              className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1 leading-none whitespace-nowrap"
              style={{ color: streak > 0 ? "rgba(201,168,76,0.7)" : "rgba(240,230,211,0.4)" }}
            >
              day streak
            </span>
          </div>

          {/* Words today — hidden on mobile */}
          <div
            className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl border"
            style={{
              background:  "rgba(0,0,0,0.25)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="font-serif text-xl font-semibold leading-none tabular-nums"
              style={{ color: "#f0e6d3" }}
            >
              {wordsToday.toLocaleString()}
            </span>
            <span
              className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1 leading-none whitespace-nowrap"
              style={{ color: "rgba(240,230,211,0.4)" }}
            >
              words today
            </span>
          </div>

          {/* Manuscripts — hidden on mobile */}
          <div
            className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl border"
            style={{
              background:  "rgba(0,0,0,0.25)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="font-serif text-xl font-semibold leading-none tabular-nums"
              style={{ color: "#f0e6d3" }}
            >
              {manuscriptCount}
            </span>
            <span
              className="text-[9px] font-sans uppercase tracking-[0.14em] mt-1 leading-none whitespace-nowrap"
              style={{ color: "rgba(240,230,211,0.4)" }}
            >
              {manuscriptCount === 1 ? "manuscript" : "manuscripts"}
            </span>
          </div>
        </div>
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

// ─── Featured "continue writing" strip ──────────────────────────────────────
function FeaturedBook({ book }: { book: Book }) {
  const wordCount = totalWordCount(book.chapters);
  const progress  = progressPercent(wordCount, book.targetWordCount);
  const lastCh    = book.chapters.find((c) => c.id === book.lastEditedChapterId)
                 ?? book.chapters.at(-1);

  return (
    <section className="group relative mb-8 overflow-hidden rounded-xl border border-parchment-deep/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)]">
      {book.cover.imageUrl && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] scale-110"
          style={{
            backgroundImage: `url(${book.cover.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(56px)",
          }}
        />
      )}

      <div className="relative flex flex-nowrap items-center gap-5 px-5 py-4">
        <Link
          href={`/books/${book.id}`}
          className="relative shrink-0 overflow-hidden rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ width: 64, height: 96, backgroundColor: book.cover.backgroundColor }}
          aria-label={`Open ${book.title}`}
        >
          {book.cover.imageUrl ? (
            <Image src={book.cover.imageUrl} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-2">
              <p className="font-serif text-[9px] font-semibold leading-tight" style={{ color: book.cover.titleColor }}>
                {book.title}
              </p>
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-sans uppercase tracking-[0.14em] text-ink-faint">
            Continue where you left off · {book.genre}
          </p>
          <Link href={`/books/${book.id}`} className="block">
            <h2 className="line-clamp-1 font-serif text-xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-gold">
              {book.title}
            </h2>
          </Link>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-ink-faint">
            {lastCh && (
              <span className="min-w-0 truncate text-ink-muted">
                <span className="font-medium">Ch. {lastCh.number} — {lastCh.title}</span>
                <span className="ml-2 opacity-60">{wordCount.toLocaleString()} words · {progress}%</span>
              </span>
            )}
          </div>

          <div className="mt-2.5 h-1 w-full max-w-[14rem] overflow-hidden rounded-full bg-parchment-deep">
            <div
              className="h-full rounded-full bg-sage/85 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant="gold"
          className="shrink-0 rounded-lg px-4 py-2 text-[11px] font-semibold tracking-[0.01em] gap-1.5"
        >
          <Link href={`/books/${book.id}`} aria-label={`Continue writing ${book.title}`}>
            <PenLine className="w-3.5 h-3.5" strokeWidth={1.8} />
            Continue Writing
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </section>
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

          {/* ── Welcome Banner ──────────────────────────────────────────── */}
          <WelcomeBanner
            user={user!}
            streak={computeStreak(books)}
            wordsToday={computeWordsToday(books)}
            manuscriptCount={books.length}
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

          {/* ── Featured strip ──────────────────────────────────────────── */}
          {featured && !query && books.length > 0 && <FeaturedBook book={featured} />}

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
