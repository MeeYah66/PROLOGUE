"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Feather,
  Flame,
  Heart,
  Layers,
  Moon,
  Sparkles,
} from "lucide-react";
import { GENRES } from "@/lib/data/mockData";
import { createBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { BookStatus, CoverStyle } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AppNav } from "@/components/layout/AppNav";

const COVER_STYLES: { id: CoverStyle; label: string; description: string; icon: React.ReactNode; bg: string; accent: string }[] = [
  { id: "minimal",  label: "Minimal",  description: "Clean, typographic",  icon: <Feather className="w-4 h-4" />,  bg: "#f0ece6", accent: "#2d2d2d" },
  { id: "classic",  label: "Classic",  description: "Timeless, editorial", icon: <BookOpen className="w-4 h-4" />, bg: "#1a3a52", accent: "#c9e4f0" },
  { id: "ethereal", label: "Ethereal", description: "Atmospheric, moody",  icon: <Moon className="w-4 h-4" />,    bg: "#1a1410", accent: "#c9a84c" },
  { id: "bold",     label: "Bold",     description: "Dramatic, striking",  icon: <Flame className="w-4 h-4" />,   bg: "#2d1a1a", accent: "#e87c5a" },
];

const GENRE_ICONS: Record<string, React.ReactNode> = {
  Fantasy: <Sparkles className="w-3.5 h-3.5" />,
  Romance: <Heart className="w-3.5 h-3.5" />,
  "Science Fiction": <Layers className="w-3.5 h-3.5" />,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{label}</label>
        {hint && <span className="text-[10px] text-ink-faint/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function NewBookPage() {
  const router   = useRouter();
  const { user } = useAuth();
  const [step, setStep]       = useState(1);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    genre: "",
    blurb: "",
    authorName: "",
    status: "draft" as BookStatus,
    targetWordCount: 80000,
    coverStyle: "minimal" as CoverStyle,
  });

  const update = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = step === 1
    ? form.title.trim().length > 0 && form.genre.length > 0
    : true;

  async function handleCreate() {
    if (!user) return;
    setCreating(true);
    const selectedStyle = COVER_STYLES.find((s) => s.id === form.coverStyle)!;
    const book = await createBook(user.id, {
      title: form.title,
      subtitle: form.subtitle || undefined,
      genre: form.genre,
      blurb: form.blurb,
      authorName: form.authorName || "Author",
      status: form.status,
      targetWordCount: form.targetWordCount,
      cover: {
        style: form.coverStyle,
        titleColor: "#f5f0e8",
        authorColor: selectedStyle.accent,
        alignment: "left",
        backgroundColor: selectedStyle.bg,
        overlayOpacity: 0.5,
      },
    });
    router.push(`/books/${book.id}`);
  }

  const selectedStyle = COVER_STYLES.find((s) => s.id === form.coverStyle)!;

  const LEFT_COPY = [
    { step: 1, headline: <>Every book starts\nsomewhere.</>, sub: "Give your manuscript its identity — a title, a world, a voice." },
    { step: 2, headline: <>Set the tone\nbefore word one.</>, sub: "The cover is the first impression. Choose a mood that matches your story." },
    { step: 3, headline: <>Your story is\nready to begin.</>, sub: "Everything is in place. Your workspace will be ready the moment you click." },
  ];
  const leftCopy = LEFT_COPY.find((l) => l.step === step)!;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#e8e4dd" }}>
      <AppNav />

      <div className="flex-1 ml-14 flex flex-col min-h-screen">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-8 py-4 flex items-center justify-between border-b border-black/[0.06]">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Library
            </button>
          </Link>

          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {["Details", "Style", "Confirm"].map((s, i) => {
              const n = i + 1;
              const active = n === step;
              const done   = n < step;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all",
                    active ? "bg-ink text-parchment" :
                    done   ? "bg-ink/10 text-ink-muted" :
                             "text-ink-faint"
                  )}>
                    {done && (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {s}
                  </div>
                  {i < 2 && <div className={cn("w-6 h-px", done ? "bg-ink/20" : "bg-black/10")} />}
                </div>
              );
            })}
          </div>

          <div className="w-28" />
        </div>

        {/* ── Main layout ──────────────────────────────────────────────────── */}
        <div className="flex flex-1">

          {/* LEFT — open, editorial, no container */}
          <div className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col justify-between px-10 xl:px-14 py-14 relative overflow-hidden">
            {/* Faint ruled-paper texture */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 27px, rgba(0,0,0,0.04) 27px, rgba(0,0,0,0.04) 28px)",
            }} />

            <div className="relative space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-px bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint font-medium">
                  Step {step} of 3
                </span>
              </div>

              <div>
                <h1 className="font-serif text-[2rem] xl:text-[2.25rem] font-semibold text-ink leading-[1.15] whitespace-pre-line">
                  {leftCopy.headline}
                </h1>
              </div>

              <p className="text-sm text-ink-muted leading-relaxed max-w-[240px]">
                {leftCopy.sub}
              </p>
            </div>

            {/* Live cover preview */}
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint mb-4">Cover preview</p>
              <div
                className="w-36 aspect-[2/3] rounded-[3px] relative overflow-hidden transition-all duration-500"
                style={{
                  backgroundColor: selectedStyle.bg,
                  boxShadow: "6px 8px 32px rgba(0,0,0,0.22), 2px 2px 0 rgba(0,0,0,0.07)",
                }}
              >
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.5) 100%)"
                }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-sm font-semibold leading-tight mb-1 transition-all" style={{ color: "#f5f0e8" }}>
                    {form.title || <span className="opacity-25">Your Title</span>}
                  </p>
                  <p className="text-[10px] transition-all" style={{ color: selectedStyle.accent }}>
                    {form.authorName || <span style={{ opacity: 0.25 }}>Author</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — elevated white workspace panel */}
          <div className="flex-1 flex items-stretch py-6 pr-6 pl-2 lg:pl-0">
            <div
              className="flex-1 flex flex-col rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "#faf8f5",
                boxShadow: "0 2px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Panel inner scroll area */}
              <div className="flex-1 overflow-y-auto px-8 xl:px-12 py-10">
                <div className="max-w-lg">

                  {/* ── Step 1: Details ───────────────────────────────── */}
                  {step === 1 && (
                    <div className="animate-fade-in space-y-8">

                      {/* Identity section */}
                      <div className="space-y-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint pb-1 border-b border-parchment-deep">
                          Identity
                        </p>
                        <Field label="Title" hint="Required">
                          <input
                            autoFocus
                            placeholder="The name of your book"
                            value={form.title}
                            onChange={(e) => update("title", e.target.value)}
                            className="w-full bg-transparent border-b border-parchment-deep focus:border-ink/40 focus:outline-none text-ink placeholder:text-ink-faint/40 pb-2 transition-colors font-serif text-xl font-semibold"
                          />
                        </Field>
                        <Field label="Subtitle" hint="Optional">
                          <input
                            placeholder="A subtitle or series name"
                            value={form.subtitle}
                            onChange={(e) => update("subtitle", e.target.value)}
                            className="w-full bg-transparent border-b border-parchment-deep focus:border-ink/40 focus:outline-none text-ink placeholder:text-ink-faint/40 pb-2 transition-colors text-sm"
                          />
                        </Field>
                        <Field label="Author Name">
                          <input
                            placeholder="Your pen name or real name"
                            value={form.authorName}
                            onChange={(e) => update("authorName", e.target.value)}
                            className="w-full bg-transparent border-b border-parchment-deep focus:border-ink/40 focus:outline-none text-ink placeholder:text-ink-faint/40 pb-2 transition-colors text-sm"
                          />
                        </Field>
                      </div>

                      {/* Story section */}
                      <div className="space-y-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint pb-1 border-b border-parchment-deep">
                          Story
                        </p>
                        <div className="grid grid-cols-2 gap-5">
                          <Field label="Genre" hint="Required">
                            <Select value={form.genre} onValueChange={(v) => update("genre", v)}>
                              <SelectTrigger className="border-0 border-b border-parchment-deep rounded-none px-0 h-9 text-sm focus:ring-0 shadow-none bg-transparent hover:bg-transparent focus:border-ink/40 text-ink">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                              <SelectContent>
                                {GENRES.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    <span className="flex items-center gap-2">{GENRE_ICONS[g]}{g}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Status">
                            <Select value={form.status} onValueChange={(v) => update("status", v)}>
                              <SelectTrigger className="border-0 border-b border-parchment-deep rounded-none px-0 h-9 text-sm focus:ring-0 shadow-none bg-transparent hover:bg-transparent focus:border-ink/40 text-ink">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="ongoing">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field label="Blurb" hint="Optional">
                          <Textarea
                            placeholder="The hook that makes a reader lean in — your story in two or three sentences."
                            value={form.blurb}
                            onChange={(e) => update("blurb", e.target.value)}
                            rows={3}
                            className="border-0 border-b border-parchment-deep rounded-none px-0 resize-none text-sm bg-transparent focus-visible:ring-0 focus-visible:border-ink/40 placeholder:text-ink-faint/40 shadow-none text-ink"
                          />
                        </Field>
                      </div>

                      {/* Ambition section */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint pb-1 border-b border-parchment-deep">
                          Ambition
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-ink-muted">Target word count</span>
                          <span className="font-serif text-sm font-semibold text-ink">{form.targetWordCount.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min={10000}
                          max={200000}
                          step={5000}
                          value={form.targetWordCount}
                          onChange={(e) => update("targetWordCount", Number(e.target.value))}
                          className="w-full accent-gold h-0.5 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-ink-faint">
                          <span>Short Story · 10k</span>
                          <span>Novel · 80k</span>
                          <span>Epic · 200k</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Style ─────────────────────────────────── */}
                  {step === 2 && (
                    <div className="animate-fade-in space-y-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint pb-1 border-b border-parchment-deep">
                        Cover Style
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {COVER_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => update("coverStyle", style.id)}
                            className={cn(
                              "group relative overflow-hidden rounded-xl transition-all text-left",
                              form.coverStyle === style.id
                                ? "ring-2 ring-gold ring-offset-2 ring-offset-[#faf8f5] shadow-md"
                                : "opacity-60 hover:opacity-90 hover:shadow-sm"
                            )}
                          >
                            <div className="h-28 flex flex-col justify-end p-3.5 relative" style={{ backgroundColor: style.bg }}>
                              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.38) 100%)" }} />
                              <div className="relative">
                                <p className="font-serif text-xs font-semibold leading-tight" style={{ color: "#f5f0e8" }}>
                                  {form.title || "Your Title"}
                                </p>
                                <p className="text-[9px] mt-0.5" style={{ color: style.accent }}>
                                  {form.authorName || "Author"}
                                </p>
                              </div>
                            </div>
                            <div className="px-3 py-2.5 bg-white border-t border-parchment-deep flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-ink-faint">{style.icon}</span>
                                <div>
                                  <p className="text-xs font-medium text-ink">{style.label}</p>
                                  <p className="text-[10px] text-ink-faint">{style.description}</p>
                                </div>
                              </div>
                              {form.coverStyle === style.id && (
                                <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0">
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Confirm ───────────────────────────────── */}
                  {step === 3 && (
                    <div className="animate-fade-in space-y-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint pb-1 border-b border-parchment-deep">
                        Your Manuscript
                      </p>

                      {/* Cover + title */}
                      <div className="flex gap-6 items-end">
                        <div
                          className="w-24 shrink-0 aspect-[2/3] rounded-[3px] relative overflow-hidden"
                          style={{
                            backgroundColor: selectedStyle.bg,
                            boxShadow: "4px 6px 20px rgba(0,0,0,0.18), 1px 1px 0 rgba(0,0,0,0.06)",
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.45) 100%)" }} />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="font-serif text-[10px] font-semibold leading-tight mb-0.5" style={{ color: "#f5f0e8" }}>{form.title}</p>
                            {form.authorName && <p className="text-[8px]" style={{ color: selectedStyle.accent }}>{form.authorName}</p>}
                          </div>
                        </div>
                        <div className="pb-1">
                          <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">{form.title}</h2>
                          {form.subtitle && <p className="text-sm text-ink-muted font-serif italic mt-0.5">{form.subtitle}</p>}
                          {form.authorName && <p className="text-xs text-ink-faint mt-2">{form.authorName}</p>}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="divide-y divide-parchment-deep">
                        {[
                          { label: "Genre",       value: form.genre },
                          { label: "Status",      value: form.status === "ongoing" ? "In Progress" : form.status.charAt(0).toUpperCase() + form.status.slice(1) },
                          { label: "Target",      value: `${form.targetWordCount.toLocaleString()} words` },
                          { label: "Cover Style", value: selectedStyle.label },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center py-3">
                            <span className="text-[10px] uppercase tracking-wider text-ink-faint font-medium">{label}</span>
                            <span className="text-sm text-ink font-medium">{value}</span>
                          </div>
                        ))}
                      </div>

                      {form.blurb && (
                        <div className="bg-parchment-warm/60 rounded-lg px-5 py-4">
                          <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-2 font-semibold">Blurb</p>
                          <p className="text-sm text-ink-muted leading-relaxed font-serif italic">"{form.blurb}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Panel footer / navigation ──────────────────────────── */}
              <div className="shrink-0 px-8 xl:px-12 py-5 border-t border-parchment-deep flex items-center justify-between bg-parchment/40">
                {step > 1 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canProceed}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all",
                      canProceed
                        ? "bg-ink text-parchment hover:bg-ink/90"
                        : "bg-parchment-deep text-ink-faint cursor-not-allowed"
                    )}
                  >
                    Continue
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-ink text-parchment hover:bg-ink/90 transition-all disabled:opacity-50"
                  >
                    {creating ? (
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <Feather className="w-3.5 h-3.5" />
                    )}
                    {creating ? "Creating…" : "Begin Writing"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
