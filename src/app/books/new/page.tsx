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
  { id: "minimal",  label: "Minimal",  description: "Clean, typographic",   icon: <Feather className="w-4 h-4" />,  bg: "#f0ece6", accent: "#2d2d2d" },
  { id: "classic",  label: "Classic",  description: "Timeless, editorial",  icon: <BookOpen className="w-4 h-4" />, bg: "#1a3a52", accent: "#c9e4f0" },
  { id: "ethereal", label: "Ethereal", description: "Atmospheric, moody",   icon: <Moon className="w-4 h-4" />,    bg: "#1a1410", accent: "#c9a84c" },
  { id: "bold",     label: "Bold",     description: "Dramatic, striking",   icon: <Flame className="w-4 h-4" />,   bg: "#2d1a1a", accent: "#e87c5a" },
];

const GENRE_ICONS: Record<string, React.ReactNode> = {
  Fantasy: <Sparkles className="w-3.5 h-3.5" />,
  Romance: <Heart className="w-3.5 h-3.5" />,
  "Science Fiction": <Layers className="w-3.5 h-3.5" />,
};

const STEPS = ["Details", "Style", "Confirm"];

// ─── Field component ────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</label>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Bare input style ────────────────────────────────────────────────────────
const bareInput = "w-full bg-transparent border-0 border-b border-parchment-deep focus:border-ink/30 focus:outline-none text-ink placeholder:text-ink-faint/50 pb-2 transition-colors text-sm";
const bareInputLg = "w-full bg-transparent border-0 border-b border-parchment-deep focus:border-ink/30 focus:outline-none text-ink placeholder:text-ink-faint/50 pb-2 transition-colors font-serif text-xl font-semibold";

export default function NewBookPage() {
  const router   = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
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

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav />
      <main className="flex-1 ml-14 flex flex-col">

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-parchment-deep px-8 py-3.5 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Library
            </button>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const active = n === step;
              const done   = n < step;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all",
                    active ? "bg-ink text-parchment font-medium" :
                    done   ? "text-ink-muted" : "text-ink-faint"
                  )}>
                    {done && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    {s}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("w-8 h-px", done ? "bg-ink-faint" : "bg-parchment-deep")} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-16" />
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left narrative panel */}
          <div
            className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col justify-between p-10 border-r border-parchment-deep relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #f5f1eb 0%, #ede8e0 60%, #e4ddd4 100%)",
            }}
          >
            {/* Faint texture lines */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 1px, transparent 1px, transparent 28px)",
            }} />

            <div className="relative">
              <div className="w-6 h-px bg-gold mb-8" />
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-4">
                {step === 1 ? "Step 1 of 3" : step === 2 ? "Step 2 of 3" : "Step 3 of 3"}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-ink leading-snug mb-3">
                {step === 1 && <>Every book starts<br />somewhere.</>}
                {step === 2 && <>Set the tone<br />before the first word.</>}
                {step === 3 && <>Your story is<br />ready to begin.</>}
              </h2>
              <p className="text-xs text-ink-faint leading-relaxed">
                {step === 1 && "Give your manuscript its identity. A title, a world, a voice."}
                {step === 2 && "The cover is the first impression. Choose a mood that matches your story."}
                {step === 3 && "Review the details before your workspace is created."}
              </p>
            </div>

            {/* Live cover preview */}
            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest text-ink-faint mb-3">Cover preview</p>
              <div
                className="w-full aspect-[2/3] rounded-sm relative overflow-hidden transition-all duration-500"
                style={{
                  backgroundColor: selectedStyle.bg,
                  boxShadow: "4px 4px 20px rgba(0,0,0,0.18), 1px 1px 0 rgba(0,0,0,0.08)",
                }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)"
                }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-sm font-semibold leading-tight mb-1 transition-all"
                    style={{ color: "#f5f0e8" }}>
                    {form.title || <span className="opacity-30">Your Title</span>}
                  </p>
                  <p className="text-[10px] transition-all" style={{ color: selectedStyle.accent }}>
                    {form.authorName || <span className="opacity-30">Author</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 max-w-xl mx-auto w-full px-8 xl:px-12 py-10">

              {/* ── Step 1: Details ─────────────────────────────────────── */}
              {step === 1 && (
                <div className="animate-fade-in space-y-10">

                  {/* Section: Identity */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint mb-5">Identity</p>
                      <Field label="Title" hint="Required">
                        <input
                          autoFocus
                          placeholder="The name of your book"
                          value={form.title}
                          onChange={(e) => update("title", e.target.value)}
                          className={bareInputLg}
                        />
                      </Field>
                    </div>
                    <Field label="Subtitle" hint="Optional">
                      <input
                        placeholder="A subtitle or series name"
                        value={form.subtitle}
                        onChange={(e) => update("subtitle", e.target.value)}
                        className={bareInput}
                      />
                    </Field>
                    <Field label="Author Name">
                      <input
                        placeholder="Your pen name or real name"
                        value={form.authorName}
                        onChange={(e) => update("authorName", e.target.value)}
                        className={bareInput}
                      />
                    </Field>
                  </div>

                  <div className="h-px bg-parchment-deep" />

                  {/* Section: Story */}
                  <div className="space-y-6">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint">Story</p>

                    <div className="grid grid-cols-2 gap-6">
                      <Field label="Genre" hint="Required">
                        <Select value={form.genre} onValueChange={(v) => update("genre", v)}>
                          <SelectTrigger className="border-0 border-b border-parchment-deep rounded-none px-0 h-9 text-sm focus:ring-0 shadow-none bg-transparent hover:bg-transparent">
                            <SelectValue placeholder="Select a genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENRES.map((g) => (
                              <SelectItem key={g} value={g}>
                                <span className="flex items-center gap-2">
                                  {GENRE_ICONS[g]}{g}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Status">
                        <Select value={form.status} onValueChange={(v) => update("status", v)}>
                          <SelectTrigger className="border-0 border-b border-parchment-deep rounded-none px-0 h-9 text-sm focus:ring-0 shadow-none bg-transparent hover:bg-transparent">
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
                        className="border-0 border-b border-parchment-deep rounded-none px-0 resize-none text-sm bg-transparent focus-visible:ring-0 focus-visible:border-ink/30 placeholder:text-ink-faint/50 shadow-none"
                      />
                    </Field>
                  </div>

                  <div className="h-px bg-parchment-deep" />

                  {/* Section: Ambition */}
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint">Ambition</p>
                      <span className="font-serif text-sm text-ink font-medium">{form.targetWordCount.toLocaleString()} words</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={200000}
                      step={5000}
                      value={form.targetWordCount}
                      onChange={(e) => update("targetWordCount", Number(e.target.value))}
                      className="w-full accent-gold h-0.5"
                    />
                    <div className="flex justify-between text-[10px] text-ink-faint">
                      <span>Short Story · 10k</span>
                      <span>Novel · 80k</span>
                      <span>Epic · 200k</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Style ────────────────────────────────────────── */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint mb-6">Cover style</p>
                  <div className="grid grid-cols-2 gap-3">
                    {COVER_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => update("coverStyle", style.id)}
                        className={cn(
                          "group relative overflow-hidden transition-all text-left rounded-lg",
                          form.coverStyle === style.id
                            ? "ring-2 ring-gold ring-offset-2 ring-offset-parchment"
                            : "opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className="h-32 flex flex-col justify-end p-4" style={{ backgroundColor: style.bg }}>
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3) 100%)" }} />
                          <div className="relative">
                            <p className="font-serif text-xs font-semibold leading-tight" style={{ color: "#f5f0e8" }}>
                              {form.title || "Your Title"}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: style.accent }}>
                              {form.authorName || "Author"}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-2.5 bg-parchment border-t border-parchment-deep flex items-center gap-2">
                          <span className="text-ink-faint">{style.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-ink">{style.label}</p>
                            <p className="text-[10px] text-ink-faint">{style.description}</p>
                          </div>
                          {form.coverStyle === style.id && (
                            <div className="ml-auto w-4 h-4 rounded-full bg-gold flex items-center justify-center">
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

              {/* ── Step 3: Confirm ──────────────────────────────────────── */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faint mb-8">Your manuscript</p>

                  {/* Large cover preview */}
                  <div className="flex gap-8 mb-10">
                    <div
                      className="w-28 shrink-0 aspect-[2/3] rounded-sm relative overflow-hidden"
                      style={{
                        backgroundColor: selectedStyle.bg,
                        boxShadow: "4px 4px 20px rgba(0,0,0,0.2), 1px 1px 0 rgba(0,0,0,0.08)",
                      }}
                    >
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-serif text-[10px] font-semibold leading-tight mb-0.5" style={{ color: "#f5f0e8" }}>{form.title}</p>
                        {form.authorName && <p className="text-[9px]" style={{ color: selectedStyle.accent }}>{form.authorName}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-1">
                      <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">{form.title}</h2>
                      {form.subtitle && <p className="text-sm text-ink-muted font-serif italic">{form.subtitle}</p>}
                      {form.authorName && <p className="text-xs text-ink-faint pt-1">{form.authorName}</p>}
                    </div>
                  </div>

                  <div className="space-y-0 divide-y divide-parchment-deep">
                    {[
                      { label: "Genre",        value: form.genre },
                      { label: "Status",       value: form.status === "ongoing" ? "In Progress" : form.status.charAt(0).toUpperCase() + form.status.slice(1) },
                      { label: "Target",       value: `${form.targetWordCount.toLocaleString()} words` },
                      { label: "Cover Style",  value: selectedStyle.label },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-3">
                        <span className="text-xs text-ink-faint uppercase tracking-wider">{label}</span>
                        <span className="text-sm text-ink font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {form.blurb && (
                    <div className="mt-6 pt-6 border-t border-parchment-deep">
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-2">Blurb</p>
                      <p className="text-sm text-ink-muted leading-relaxed font-serif italic">"{form.blurb}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Navigation ──────────────────────────────────────────── */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-parchment-deep">
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
                      "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                      canProceed
                        ? "bg-ink text-parchment hover:bg-ink-soft"
                        : "bg-parchment-warm text-ink-faint cursor-not-allowed"
                    )}
                  >
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-ink text-parchment hover:bg-ink-soft transition-all disabled:opacity-50"
                  >
                    {creating ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
      </main>
    </div>
  );
}
