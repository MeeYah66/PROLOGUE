"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Bell,
  Menu,
  PenLine,
  ArrowRight,
  Flame,
  BookMarked,
  ScrollText,
  Trophy,
} from "lucide-react";
import { getBooks } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount, estimateReadingTime, progressPercent } from "@/lib/utils";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 5)  return "Still up writing";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function localDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
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

function computeWeeklyActivity(books: Book[]): { label: string; words: number; isToday: boolean }[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString("en-CA");
    const label   = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
    let words     = 0;
    for (const book of books) {
      for (const ch of book.chapters) {
        if (localDateStr(ch.updatedAt) === dateStr) words += ch.wordCount;
      }
    }
    return { label, words, isToday: i === 6 };
  });
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-12 px-3 md:px-6 bg-parchment/95 backdrop-blur-sm border-b border-parchment-deep">
      <button
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint transition-all"
      >
        <Menu className="w-3.5 h-3.5" strokeWidth={1.8} />
      </button>
      <div className="flex items-center gap-2 ml-auto">
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

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function StatStrip({
  totalWords,
  completedBooks,
  streak,
  totalChapters,
}: {
  totalWords: number;
  completedBooks: number;
  streak: number;
  totalChapters: number;
}) {
  const stats = [
    { icon: PenLine,    value: totalWords.toLocaleString(),   label: "Words Written"   },
    { icon: Trophy,     value: String(completedBooks),        label: "Books Complete"  },
    { icon: Flame,      value: streak > 0 ? `${streak}d` : "—", label: "Writing Streak" },
    { icon: ScrollText, value: String(totalChapters),         label: "Chapters"        },
  ];

  return (
    <div className="inline-flex items-center bg-parchment-warm rounded-xl px-1 py-1 flex-wrap gap-y-1">
      {stats.map(({ icon: Icon, value, label }, i) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2 px-4 py-2">
            <Icon className="w-3.5 h-3.5 text-ink-faint shrink-0" strokeWidth={1.5} />
            {/* value — #1a1408 on #f5f0e8 → 14:1 ✓ AAA */}
            <span className="font-serif text-sm font-semibold text-ink">{value}</span>
            {/* label — rgba(26,20,14,0.58) on #f5f0e8 → 4.8:1 ✓ AA */}
            <span className="text-[11px] text-ink-muted">{label}</span>
          </div>
          {i < stats.length - 1 && (
            <div className="w-px h-4 bg-parchment-deep shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML and return the trailing ~200 chars — the writer's last words. */
function extractSnippet(html: string, maxChars = 200): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text || text.length < 20) return "";
  if (text.length <= maxChars) return text;
  const raw      = text.slice(-maxChars);
  const spaceIdx = raw.indexOf(" ");
  return "\u2026" + (spaceIdx > -1 ? raw.slice(spaceIdx + 1) : raw);
}

// ─── Mini Book Cover ──────────────────────────────────────────────────────────

function MiniCover({ book }: { book: Book }) {
  return (
    <div
      className="w-[56px] shrink-0 self-stretch rounded-lg relative overflow-hidden"
      style={{ backgroundColor: book.cover.backgroundColor, minHeight: "90px" }}
    >
      {book.cover.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.cover.imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55))" }}
      />
    </div>
  );
}

// ─── Currently Writing ────────────────────────────────────────────────────────

function CurrentlyWriting({ book }: { book: Book | null }) {
  if (!book) {
    return (
      <div className="rounded-xl border border-parchment-deep bg-white p-8 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 rounded-full bg-parchment-warm flex items-center justify-center mb-3">
          <PenLine className="w-4 h-4 text-ink-faint" strokeWidth={1.5} />
        </div>
        <p className="font-serif text-base font-semibold text-ink mb-1.5">Your story is waiting</p>
        <p className="text-sm text-ink-muted leading-relaxed max-w-xs mb-5">
          Begin your first manuscript to start tracking your progress here.
        </p>
        <Link href="/books/new">
          <Button size="sm" className="gap-1.5 bg-ink text-parchment hover:bg-ink-soft">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Start Writing
          </Button>
        </Link>
      </div>
    );
  }

  const lastCh  = book.chapters.find((c) => c.id === book.lastEditedChapterId) ?? book.chapters.at(-1);
  const words   = totalWordCount(book.chapters);
  const pct     = progressPercent(words, book.targetWordCount);
  const snippet = lastCh ? extractSnippet(lastCh.content) : "";

  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-4 flex gap-4">
      <MiniCover book={book} />

      <div className="flex flex-col flex-1 min-w-0 gap-2.5">

        {/* Row 1 — label + chapter location */}
        <div className="flex items-center justify-between gap-2">
          {/* #7A5C14 on white → 5.7:1 ✓ AA */}
          <p className="text-[9px] font-sans uppercase tracking-[0.20em] font-semibold shrink-0" style={{ color: "#7A5C14" }}>
            Currently Writing
          </p>
          {lastCh && (
            <span className="text-[10px] text-ink-muted truncate">
              Ch. {lastCh.number} — {lastCh.title}
            </span>
          )}
        </div>

        {/* Row 2 — title */}
        <h3 className="font-serif text-lg font-semibold text-ink leading-tight truncate">
          {book.title}
        </h3>

        {/* Row 3 — last written snippet (Joan Didion re-entry) */}
        {snippet && (
          <p className="font-serif text-[12px] italic leading-relaxed line-clamp-2 text-ink-muted border-l-2 border-parchment-deep pl-2.5">
            {snippet}
          </p>
        )}

        {/* Row 4 — progress bar + word count + CTA all in one line */}
        <div className="flex items-center gap-3 mt-auto pt-0.5">
          <div className="flex-1 min-w-0">
            <div className="h-[3px] rounded-full bg-parchment-deep overflow-hidden mb-1">
              <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-ink-muted">
              {words.toLocaleString()} / {book.targetWordCount.toLocaleString()} · {pct}%
            </span>
          </div>
          <Link href={`/books/${book.id}`} className="shrink-0">
            <Button size="sm" variant="gold" className="gap-1 px-3 h-7 text-[12px] font-semibold rounded-lg">
              <PenLine className="w-3 h-3" strokeWidth={1.8} />
              Continue
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Weekly Activity ──────────────────────────────────────────────────────────

function WeeklyActivity({ books }: { books: Book[] }) {
  const activity    = computeWeeklyActivity(books);
  const maxWords    = Math.max(...activity.map((d) => d.words), 1);
  const totalThisWeek = activity.reduce((s, d) => s + d.words, 0);

  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-serif text-sm font-semibold text-ink">This Week</h3>
        <span className="text-[11px] text-ink-muted">{totalThisWeek.toLocaleString()} words</span>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-1 h-12 mb-2.5">
        {activity.map(({ label, words, isToday }) => {
          const heightPct = Math.max((words / maxWords) * 100, words > 0 ? 8 : 4);
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1" title={`${words.toLocaleString()} words`}>
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isToday
                    ? "#1a1408"
                    : words > 0
                    ? "#c9a84c"
                    : "#ede8de",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex justify-between">
        {activity.map(({ label, isToday }) => (
          <div key={label} className="flex-1 text-center">
            {/* isToday: #1a1408 on white → 14:1 ✓   inactive: rgba(26,20,14,0.38) → 3.6:1 (decorative label) */}
            <span className={cn(
              "text-[10px]",
              isToday ? "font-semibold text-ink" : "text-ink-faint"
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Writer Snapshot ──────────────────────────────────────────────────────────

function WriterSnapshot({ books }: { books: Book[] }) {
  const totalWords    = books.reduce((s, b) => s + totalWordCount(b.chapters), 0);
  const totalChapters = books.reduce((s, b) => s + b.chapters.length, 0);
  const readingTime   = estimateReadingTime(totalWords);
  const avgChapter    = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;

  const genres  = books.reduce<Record<string, number>>((acc, b) => {
    acc[b.genre] = (acc[b.genre] ?? 0) + 1;
    return acc;
  }, {});
  const topGenre = Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const rows = [
    { label: "Primary genre",    value: topGenre },
    { label: "Total reading time", value: readingTime },
    { label: "Avg chapter",      value: avgChapter > 0 ? `${avgChapter.toLocaleString()} words` : "—" },
    { label: "In progress",      value: String(books.filter((b) => b.status === "ongoing").length) },
  ];

  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-5 flex-1">
      <h3 className="font-serif text-sm font-semibold text-ink mb-4">Writing Profile</h3>
      <div className="space-y-3.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            {/* rgba(26,20,14,0.58) on white → 5.2:1 ✓ AA */}
            <span className="text-xs text-ink-muted">{label}</span>
            <span className="text-xs font-medium text-ink text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-parchment-deep">
        {/* #7A5C14 on white → 5.7:1 ✓ AA */}
        <p className="text-[9px] uppercase tracking-[0.18em] font-semibold mb-1.5" style={{ color: "#7A5C14" }}>
          AI Book Summary
        </p>
        <p className="text-[11px] text-ink-muted italic leading-relaxed">
          Personalized insights into your narrative patterns — coming soon.
        </p>
      </div>
    </div>
  );
}

// ─── Recent Manuscripts List ──────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  draft:     "bg-ink-faint",
  ongoing:   "bg-gold",
  completed: "bg-sage",
};

function RecentManuscripts({ books }: { books: Book[] }) {
  if (books.length === 0) return null;
  const recent = books.slice(0, 4);

  return (
    <div className="rounded-xl border border-parchment-deep bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-deep">
        <h3 className="font-serif text-sm font-semibold text-ink">Recent Manuscripts</h3>
        <Link
          href="/library"
          className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          View all in Library
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div>
        {recent.map((book, i) => {
          const words = totalWordCount(book.chapters);
          const pct   = progressPercent(words, book.targetWordCount);
          const dot   = STATUS_DOT[book.status] ?? STATUS_DOT.draft;

          return (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className={cn(
                "flex items-center gap-4 px-5 py-3.5 hover:bg-parchment-warm/50 transition-colors",
                i < recent.length - 1 && "border-b border-parchment-deep"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{book.title}</p>
                <p className="text-[11px] text-ink-muted">
                  {book.genre}
                  <span className="mx-1.5 opacity-40">·</span>
                  {words.toLocaleString()} words
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-[3px] rounded-full bg-parchment-deep overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full bg-ink-faint" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-ink-muted w-10 text-right">{pct}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks]           = useState<Book[]>([]);
  const [booksReady, setBooksReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hour, setHour]             = useState(new Date().getHours());

  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);

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

  const totalWords    = books.reduce((s, b) => s + totalWordCount(b.chapters), 0);
  const completedBooks = books.filter((b) => b.status === "completed").length;
  const streak        = computeStreak(books);
  const totalChapters = books.reduce((s, b) => s + b.chapters.length, 0);

  const firstName = user?.name.split(" ")[0] ?? "Writer";
  const greeting  = getGreeting(hour);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-14">
        <TopBar onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-8 max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              {/* #7A5C14 on parchment → 5.6:1 ✓ AA */}
              <p className="text-[11px] font-sans uppercase tracking-[0.20em] mb-2" style={{ color: "#7A5C14" }}>
                {today}
              </p>
              {/* #1a1408 on parchment → 15.4:1 ✓ AAA */}
              <h1 className="font-serif text-[2.25rem] font-semibold text-ink leading-none tracking-tight">
                {greeting}, {firstName}.
              </h1>
            </div>
            <Link href="/books/new" className="shrink-0 mt-2">
              <button className="flex items-center gap-1.5 bg-ink text-parchment px-4 py-2 rounded-lg font-sans font-medium text-sm hover:bg-ink-soft transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                New Manuscript
              </button>
            </Link>
          </div>

          {/* ── Stats Strip ────────────────────────────────────────────────── */}
          <div className="mb-8">
            <StatStrip
              totalWords={totalWords}
              completedBooks={completedBooks}
              streak={streak}
              totalChapters={totalChapters}
            />
          </div>

          {/* ── Main Grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_268px] gap-5 mb-5">
            {/* Left — Currently Writing */}
            <CurrentlyWriting book={featured} />

            {/* Right — Activity + Snapshot stacked */}
            <div className="flex flex-col gap-5">
              <WeeklyActivity books={books} />
              <WriterSnapshot books={books} />
            </div>
          </div>

          {/* ── Recent Manuscripts ─────────────────────────────────────────── */}
          <RecentManuscripts books={sorted} />

        </div>
      </main>
    </div>
  );
}
