"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, ArrowRight, PenLine, Sun, Moon, Bell } from "lucide-react";
import { getBooks, deleteBook } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount, progressPercent } from "@/lib/utils";
import { BookCard } from "@/components/dashboard/BookCard";
import { AppNav } from "@/components/layout/AppNav";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

function getGreeting(hour: number): string {
  if (hour < 5)  return "Writing into the night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ user }: { user: { name: string } }) {
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

      {/* Cursive writing animation */}
      <svg
        viewBox="0 0 220 80"
        className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block pointer-events-none"
        style={{ width: 200, height: 72, opacity: 0.55 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes write {
            0%   { stroke-dashoffset: 900; opacity: 1; }
            70%  { stroke-dashoffset: 0;   opacity: 1; }
            85%  { stroke-dashoffset: 0;   opacity: 0; }
            100% { stroke-dashoffset: 900; opacity: 0; }
          }
          @keyframes write2 {
            0%   { stroke-dashoffset: 600; opacity: 1; }
            65%  { stroke-dashoffset: 0;   opacity: 1; }
            80%  { stroke-dashoffset: 0;   opacity: 0; }
            100% { stroke-dashoffset: 600; opacity: 0; }
          }
          @keyframes write3 {
            0%   { stroke-dashoffset: 400; opacity: 1; }
            60%  { stroke-dashoffset: 0;   opacity: 1; }
            78%  { stroke-dashoffset: 0;   opacity: 0; }
            100% { stroke-dashoffset: 400; opacity: 0; }
          }
          .stroke1 {
            stroke-dasharray: 900;
            stroke-dashoffset: 900;
            animation: write 4s ease-in-out infinite;
          }
          .stroke2 {
            stroke-dasharray: 600;
            stroke-dashoffset: 600;
            animation: write2 4s ease-in-out infinite;
            animation-delay: 0.3s;
          }
          .stroke3 {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: write3 4s ease-in-out infinite;
            animation-delay: 0.55s;
          }
        `}</style>

        {/* Line 1 — long cursive word */}
        <path
          className="stroke1"
          d="M 8 38
             C 12 30, 18 26, 22 30
             C 26 34, 24 42, 28 40
             C 32 38, 34 28, 40 30
             C 46 32, 44 44, 50 40
             C 54 37, 56 28, 62 30
             C 68 32, 66 44, 72 40
             C 76 37, 78 30, 84 30
             C 90 30, 90 40, 96 38
             C 100 36, 102 28, 108 30
             C 114 32, 112 44, 118 40
             C 122 37, 124 30, 130 32
             C 138 35, 136 46, 144 42
             C 150 38, 152 30, 158 32
             C 166 35, 164 46, 170 42
             C 176 38, 180 30, 188 34
             C 194 37, 196 44, 202 42"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line 2 — shorter word below */}
        <path
          className="stroke2"
          d="M 30 55
             C 36 47, 42 44, 46 48
             C 50 52, 48 60, 54 57
             C 58 54, 60 46, 66 48
             C 72 50, 70 60, 76 57
             C 80 55, 82 48, 88 50
             C 96 53, 94 62, 102 58
             C 108 55, 110 47, 116 50
             C 124 54, 122 62, 130 58
             C 136 55, 140 48, 148 52
             C 156 56, 154 63, 162 59"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line 3 — small underline flourish */}
        <path
          className="stroke3"
          d="M 30 68
             C 60 64, 100 67, 140 65
             C 160 64, 175 67, 185 63"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative px-8 py-6">
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
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (v: string) => void;
}) {
  const [dark, setDark] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-12 px-6 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep">
      {/* Left — search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search manuscripts..."
          className="pl-9 pr-4 py-1.5 w-48 bg-white rounded-lg text-sm font-sans text-ink placeholder:text-ink-faint/60 border border-parchment-deep focus:outline-none focus:border-ink-muted focus:ring-1 focus:ring-ink/10 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all focus:w-60"
        />
      </div>

      {/* Right — theme + notifications */}
      <div className="flex items-center gap-2">
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
    <Link href={`/books/${book.id}`}>
      <div className="group relative flex gap-7 items-start bg-white rounded-2xl p-6 mb-10 cursor-pointer overflow-hidden transition-all duration-300 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.09)] hover:-translate-y-0.5">

        {book.cover.imageUrl && (
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none scale-110"
            style={{
              backgroundImage: `url(${book.cover.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(48px)",
            }}
          />
        )}

        {/* Portrait cover */}
        <div
          className="relative shrink-0 rounded-xl overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-[1.015]"
          style={{ width: 108, height: 162, backgroundColor: book.cover.backgroundColor }}
        >
          {book.cover.imageUrl ? (
            <Image src={book.cover.imageUrl} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              <p className="font-serif text-[11px] font-semibold leading-tight" style={{ color: book.cover.titleColor }}>
                {book.title}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between" style={{ minHeight: 162 }}>
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.16em] text-ink-faint mb-2.5">
              Resume where you left off · {book.genre}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink leading-tight tracking-tight mb-2.5 group-hover:text-sage transition-colors duration-300 line-clamp-1">
              {book.title}
            </h2>
            {book.blurb && (
              <p className="font-serif italic text-sm text-ink-muted leading-relaxed line-clamp-2 max-w-lg">
                {book.blurb}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            {lastCh && (
              <p className="text-xs text-ink-faint">
                <span className="text-ink-muted font-medium">Ch. {lastCh.number} — {lastCh.title}</span>
                <span className="ml-2 opacity-60">
                  {wordCount.toLocaleString()} words · {progress}%
                </span>
              </p>
            )}
            <div className="h-[2px] w-48 bg-parchment-deep rounded-full overflow-hidden">
              <div className="h-full bg-sage/80 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-1.5 text-sage group-hover:text-sage-dark transition-colors">
              <PenLine className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-xs font-sans font-semibold tracking-wide">Continue Writing</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
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
  const [books, setBooks]  = useState<Book[]>([]);
  const [query, setQuery]  = useState("");
  const [booksReady, setBooksReady] = useState(false);

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
        <AppNav />
        <main className="flex-1 ml-48 flex items-center justify-center">
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
      <AppNav />

      <main className="flex-1 ml-48 pb-12">

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <TopBar query={query} onQuery={setQuery} />

        <div className="px-8 pt-8 pb-0 max-w-5xl mx-auto">

          {/* ── Welcome Banner ──────────────────────────────────────────── */}
          <WelcomeBanner user={user!} />

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

        <div className="px-8 max-w-5xl mx-auto">

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

                {!query && (
                  <Link href="/books/new">
                    <div className="group h-full min-h-[240px] rounded-2xl border-2 border-dashed border-parchment-deep hover:border-sage/40 bg-transparent hover:bg-white/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer">
                      <div className="w-11 h-11 rounded-full bg-parchment-deep group-hover:bg-sage/10 flex items-center justify-center transition-colors">
                        <Plus className={cn("w-4.5 h-4.5 text-ink-faint group-hover:text-sage transition-colors")} />
                      </div>
                      <div className="text-center px-6">
                        <p className="text-sm font-serif font-medium text-ink-muted group-hover:text-ink transition-colors">
                          Begin a new manuscript
                        </p>
                        <p className="text-xs text-ink-faint mt-1 leading-relaxed">
                          Every story starts with a first chapter.
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
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
