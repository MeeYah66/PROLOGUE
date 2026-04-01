"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Bell,
  Menu,
  Moon,
  Sun,
  PenLine,
  ArrowRight,
  Flame,
  BookMarked,
  ScrollText,
  Trophy,
  Target,
  X,
} from "lucide-react";

type CaptureTag = "idea" | "dialogue" | "scene" | "research";
type CaptureNote = { id: string; text: string; tag: CaptureTag; at: string };
import { getBooks } from "@/lib/store";
import type { Book } from "@/lib/types";
import { totalWordCount, estimateReadingTime, progressPercent } from "@/lib/utils";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme";
import { AmbientButton } from "@/components/ambient/AmbientButton";
import { NewManuscriptDialog } from "@/components/dashboard/NewManuscriptDialog";
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

function computeWordsToday(books: Book[]): number {
  const todayStr = new Date().toLocaleDateString("en-CA");
  return books.reduce((total, book) =>
    total + book.chapters
      .filter((ch) => localDateStr(ch.updatedAt) === todayStr)
      .reduce((s, ch) => s + ch.wordCount, 0),
    0
  );
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

// ─── Section Frame ────────────────────────────────────────────────────────────

function SectionFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-parchment-warm/50 pt-4 overflow-hidden border border-parchment-deep shadow-[0px_2px_8px_rgba(0,0,0,0.04)]", className)}>
      <p className="px-4 text-[10px] uppercase tracking-[0.18em] font-semibold text-amber-label mb-3">
        {title}
      </p>
      <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
        {children}
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { theme, toggle } = useTheme();
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
    <div className="inline-flex items-center flex-wrap gap-y-1">
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
      className="w-[56px] h-[90px] shrink-0 rounded-lg relative overflow-hidden"
      style={{ backgroundColor: book.cover.backgroundColor }}
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

function CurrentlyWriting({
  book,
  onCreateNew,
}: {
  book: Book | null;
  onCreateNew: () => void;
}) {
  if (!book) {
    return (
      <div className="rounded-xl border border-parchment-deep bg-white px-8 py-10 flex flex-col items-start text-left">
        <p className="font-serif text-xl font-semibold text-ink leading-snug mb-2">
          The cursor blinks,<br />waiting for you.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          You don&apos;t need a perfect first line. You just need a first line.
        </p>
        <Button size="sm" className="gap-1.5 bg-ink text-parchment hover:bg-ink-soft" onClick={onCreateNew}>
          <PenLine className="w-3.5 h-3.5" strokeWidth={1.8} />
          Begin your manuscript
        </Button>
      </div>
    );
  }

  const lastCh  = book.chapters.find((c) => c.id === book.lastEditedChapterId) ?? book.chapters.at(-1);
  const words   = totalWordCount(book.chapters);
  const pct     = progressPercent(words, book.targetWordCount);
  const snippet = lastCh ? extractSnippet(lastCh.content) : "";

  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-5 flex gap-4">
      <MiniCover book={book} />

      <div className="flex flex-col flex-1 min-w-0 gap-3">

        {/* Chapter label */}
        {lastCh && (
          <span className="text-[10px] text-ink-muted truncate">Ch. {lastCh.number} — {lastCh.title}</span>
        )}

        {/* Title */}
        <h3 className="font-serif text-[1.1rem] font-semibold text-ink leading-snug truncate">
          {book.title}
        </h3>

        {/* Snippet — Joan Didion re-entry */}
        {snippet && (
          <p className="font-serif text-[12px] italic leading-relaxed line-clamp-2 text-ink-muted border-l-2 border-parchment-deep pl-2.5">
            {snippet}
          </p>
        )}

        {/* Progress + CTA on same row */}
        <div className="flex items-center justify-between gap-6">
          <div className="w-[140px] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-ink-muted">{pct}% complete</span>
              <span className="text-[11px] font-medium text-ink">{words.toLocaleString()}w</span>
            </div>
            <div className="h-[3px] rounded-full bg-parchment-deep overflow-hidden">
              <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Link href={`/books/${book.id}`} className="shrink-0">
            <Button size="sm" variant="gold" className="gap-1.5 h-8 px-4 text-[13px] font-semibold rounded-lg">
              <PenLine className="w-3.5 h-3.5" strokeWidth={1.8} />
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Quick Capture ────────────────────────────────────────────────────────────

const TAGS: CaptureTag[] = ["idea", "dialogue", "scene", "research"];
const TAG_COLORS: Record<CaptureTag, string> = {
  idea:     "bg-gold/10 text-[#7A5C14]",
  dialogue: "bg-sage/10 text-sage-dark",
  scene:    "bg-parchment-deep text-ink-muted",
  research: "bg-ink/5 text-ink-muted",
};

function QuickCapture() {
  const [text, setText]         = useState("");
  const [tag, setTag]           = useState<CaptureTag>("idea");
  const [notes, setNotes]       = useState<CaptureNote[]>([]);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("prologue_captures");
      if (saved) setNotes(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function save(next: CaptureNote[]) {
    setNotes(next);
    try { localStorage.setItem("prologue_captures", JSON.stringify(next)); } catch { /* ignore */ }
  }

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const note: CaptureNote = { id: Date.now().toString(), text: trimmed, tag, at: new Date().toISOString() };
    save([note, ...notes]);
    setText("");
  }

  function handleRemove(id: string) {
    save(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-4">

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd(); }}
        placeholder="Capture a thought, line, or idea…"
        rows={2}
        className="w-full text-[13px] font-serif text-ink placeholder:text-ink-faint resize-none rounded-lg border border-parchment-deep bg-parchment-warm/40 px-3 py-2 focus:outline-none focus:border-ink-faint transition-colors leading-relaxed"
      />

      {/* Tags + save */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                "text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-md transition-colors font-medium",
                tag === t ? "bg-ink text-parchment" : "text-ink-muted hover:bg-parchment-warm"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="text-[11px] font-medium text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
        >
          Save ⌘↵
        </button>
      </div>

      {/* Recent captures */}
      {mounted && notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-parchment-deep space-y-2">
          {notes.slice(0, 3).map((n) => (
            <div key={n.id} className="flex items-start gap-2 group">
              <span className={cn("text-[8px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5", TAG_COLORS[n.tag])}>
                {n.tag}
              </span>
              <p className="text-[11px] text-ink-muted leading-relaxed flex-1 line-clamp-1 font-serif italic">
                {n.text}
              </p>
              <button
                onClick={() => handleRemove(n.id)}
                aria-label="Remove"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-ink shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Daily Goal ───────────────────────────────────────────────────────────────

function DailyGoal({ wordsToday }: { wordsToday: number }) {
  const [goal, setGoal]       = useState(0);
  const [hasGoal, setHasGoal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prologue_daily_goal");
      if (saved) {
        const n = parseInt(saved, 10);
        if (n > 0) { setGoal(n); setDraft(String(n)); setHasGoal(true); }
      }
    } catch { /* ignore */ }
  }, []);

  function applyGoal() {
    const n = parseInt(draft, 10);
    if (n > 0) {
      setGoal(n);
      setHasGoal(true);
      try { localStorage.setItem("prologue_daily_goal", String(n)); } catch { /* ignore */ }
    }
    setEditing(false);
  }

  const pct = hasGoal ? Math.min(Math.round((wordsToday / goal) * 100), 100) : 0;
  const met = hasGoal && wordsToday >= goal;

  // ── No goal set yet ─────────────────────────────────────────────────────────
  if (!hasGoal && !editing) {
    return (
      <div className="rounded-xl border border-parchment-deep/60 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <h3 className="font-serif text-sm font-semibold text-ink">Daily Goal</h3>
        </div>
        <p className="text-[12px] text-ink-muted leading-relaxed mb-3">
          Set a daily word target to build a consistent writing habit.
        </p>
        <button
          onClick={() => { setDraft("500"); setEditing(true); }}
          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink border border-dashed border-parchment-deep rounded-lg py-2 hover:bg-parchment-warm hover:border-ink-faint transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Set your daily goal
        </button>
      </div>
    );
  }

  // ── Goal input (first time or editing) ──────────────────────────────────────
  if (editing) {
    return (
      <div className="rounded-xl border border-parchment-deep/60 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <h3 className="font-serif text-sm font-semibold text-ink">Daily Goal</h3>
        </div>
        <p className="text-[11px] text-ink-muted mb-3">How many words do you want to write each day?</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyGoal(); if (e.key === "Escape") setEditing(false); }}
            placeholder="e.g. 500"
            min={50}
            max={10000}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="flex-1 text-sm border border-parchment-deep rounded-lg px-3 py-2 focus:outline-none focus:border-ink-faint text-ink placeholder:text-ink-faint"
          />
          <button
            onClick={applyGoal}
            disabled={!draft || parseInt(draft) <= 0}
            className="text-sm font-semibold text-parchment bg-ink px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>
        {hasGoal && (
          <button onClick={() => setEditing(false)} className="text-[10px] text-ink-faint hover:text-ink mt-2 transition-colors">
            Cancel
          </button>
        )}
      </div>
    );
  }

  // ── Goal set — show progress ─────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-parchment-deep bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <h3 className="font-serif text-sm font-semibold text-ink">Daily Goal</h3>
        </div>
        {met && <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: "#4f7a5e" }}>✓ Met</span>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="font-serif text-xl font-semibold text-ink">{wordsToday.toLocaleString()}</span>
        <span className="text-[11px] text-ink-muted">/ {goal.toLocaleString()} words today</span>
      </div>

      <div className="h-[3px] rounded-full bg-parchment-deep overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: met ? "rgb(var(--color-sage))" : "rgb(var(--color-bar-today))" }}
        />
      </div>

      <button
        onClick={() => { setDraft(String(goal)); setEditing(true); }}
        className="text-[10px] text-ink-faint hover:text-ink transition-colors"
      >
        {pct}% complete · tap to adjust goal
      </button>
    </div>
  );
}

// ─── Weekly Activity ──────────────────────────────────────────────────────────

function WeeklyActivity({ books }: { books: Book[] }) {
  const activity    = computeWeeklyActivity(books);
  const maxWords    = Math.max(...activity.map((d) => d.words), 1);
  const totalThisWeek = activity.reduce((s, d) => s + d.words, 0);

  return (
    <div className="rounded-xl border border-parchment-deep/60 bg-white p-4">
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
                    ? "rgb(var(--color-bar-today))"
                    : words > 0
                    ? "rgb(var(--color-gold))"
                    : "rgb(var(--color-bar-empty))",
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
    <div className="rounded-xl border border-parchment-deep/60 bg-white p-4 flex-1">
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
        <p className="text-[9px] uppercase tracking-[0.18em] font-semibold mb-1.5 text-amber-label">
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

const STATUS_ICON_BG: Record<string, string> = {
  draft:     "bg-parchment-deep text-ink-faint",
  ongoing:   "bg-gold/15 text-gold-dark",
  completed: "bg-sage/15 text-sage-dark",
};

function RecentManuscripts({ books }: { books: Book[] }) {
  if (books.length === 0) return null;
  const recent = books.slice(0, 4);

  return (
    <div className="bg-white p-4 space-y-2">
      <div className="flex justify-end mb-2">
        <Link
          href="/library"
          className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.map((book) => {
        const words   = totalWordCount(book.chapters);
        const pct     = progressPercent(words, book.targetWordCount);
        const iconBg  = STATUS_ICON_BG[book.status] ?? STATUS_ICON_BG.draft;

        return (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-parchment/60 hover:bg-parchment-warm transition-colors group"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
              <BookMarked className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate leading-snug">{book.title}</p>
              <p className="text-[11px] text-ink-muted leading-snug">
                {book.genre}
                <span className="mx-1.5 opacity-40">·</span>
                {words.toLocaleString()} words
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-ink-muted hidden sm:block">{pct}%</span>
              <div className="w-6 h-6 rounded-full border border-parchment-deep flex items-center justify-center text-ink-faint group-hover:border-ink-faint group-hover:text-ink transition-colors">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks]           = useState<Book[]>([]);
  const [booksReady, setBooksReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showNewManuscriptDialog, setShowNewManuscriptDialog] = useState(false);
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
      <div className="flex min-h-screen" style={{ background: "linear-gradient(to bottom, #f8f3ec 0%, #faf8f5 25%, #faf8f5 65%, #f6f7f9 100%)" }}>
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

  const totalWords     = books.reduce((s, b) => s + totalWordCount(b.chapters), 0);
  const completedBooks = books.filter((b) => b.status === "completed").length;
  const streak         = computeStreak(books);
  const totalChapters  = books.reduce((s, b) => s + b.chapters.length, 0);
  const wordsToday     = computeWordsToday(books);

  const firstName = user?.name.split(" ")[0] ?? "Writer";
  const greeting  = getGreeting(hour);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(to bottom, #f8f3ec 0%, #faf8f5 25%, #faf8f5 65%, #f6f7f9 100%)" }}>
      <AppNav mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <main className="flex-1 md:ml-48 pb-14">
        <TopBar onOpenNav={() => setMobileNavOpen(true)} />

        <div className="px-4 md:px-8 pt-8 max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 mb-7">
            <div>
              <p className="text-[11px] font-sans uppercase tracking-[0.20em] mb-2 text-amber-label">
                {today}
              </p>
              <h1 className="font-serif text-[2.25rem] font-semibold text-ink leading-none tracking-tight">
                {greeting}, {firstName}.
              </h1>
            </div>
            <button
              onClick={() => setShowNewManuscriptDialog(true)}
              className="shrink-0 mt-2 flex items-center gap-1.5 bg-ink text-parchment px-4 py-2 rounded-lg font-sans font-medium text-sm hover:bg-ink-soft transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              New Manuscript
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_268px] gap-5 items-start">
            {/* Left — Currently Writing + Quick Capture + Recent Manuscripts */}
            <div className="flex flex-col gap-5">
              <SectionFrame title="Currently Writing">
                <CurrentlyWriting book={featured} onCreateNew={() => setShowNewManuscriptDialog(true)} />
              </SectionFrame>
              <SectionFrame title="Quick Capture">
                <QuickCapture />
              </SectionFrame>
              <SectionFrame title="Recent Manuscripts">
                <RecentManuscripts books={sorted} />
              </SectionFrame>
            </div>

            {/* Right — Daily Goal + Activity + Snapshot in a shared frame */}
            <div className="rounded-2xl border border-parchment-deep/60 bg-white p-3 flex flex-col gap-3">
              <DailyGoal wordsToday={wordsToday} />
              <WeeklyActivity books={books} />
              <WriterSnapshot books={books} />
            </div>
          </div>

        </div>
      </main>
      <NewManuscriptDialog
        open={showNewManuscriptDialog}
        onOpenChange={setShowNewManuscriptDialog}
      />
    </div>
  );
}
