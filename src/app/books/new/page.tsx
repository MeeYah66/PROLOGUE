"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Feather,
  Flame,
  Heart,
  Layers,
  Loader2,
  Moon,
  Sparkles,
} from "lucide-react";
import { GENRES } from "@/lib/data/mockData";
import { createBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { BookStatus, CoverStyle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean, typographic",
    icon: <Feather className="w-5 h-5" />,
    bg: "#f0ece6",
    accent: "#2d2d2d",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Timeless, editorial",
    icon: <BookOpen className="w-5 h-5" />,
    bg: "#1a3a52",
    accent: "#c9e4f0",
  },
  {
    id: "ethereal",
    label: "Ethereal",
    description: "Atmospheric, moody",
    icon: <Moon className="w-5 h-5" />,
    bg: "#1a1410",
    accent: "#c9a84c",
  },
  {
    id: "bold",
    label: "Bold",
    description: "Dramatic, striking",
    icon: <Flame className="w-5 h-5" />,
    bg: "#2d1a1a",
    accent: "#e87c5a",
  },
];

const GENRE_ICONS: Record<string, React.ReactNode> = {
  Fantasy: <Sparkles className="w-3.5 h-3.5" />,
  Romance: <Heart className="w-3.5 h-3.5" />,
  "Science Fiction": <Layers className="w-3.5 h-3.5" />,
};

const STEP_META = [
  { id: 1, title: "Details", note: "Project setup" },
  { id: 2, title: "Style", note: "Visual direction" },
  { id: 3, title: "Review", note: "Ready to create" },
] as const;

const STEP_COPY: Record<number, { eyebrow: string; title: string; description: string }> = {
  1: {
    eyebrow: "Step 1 - Manuscript details",
    title: "Frame the foundation of your new manuscript",
    description:
      "Capture the core metadata once so your writing studio, cover, and exports stay consistent from day one.",
  },
  2: {
    eyebrow: "Step 2 - Cover direction",
    title: "Choose an initial visual language",
    description:
      "Pick a cover mood that reflects your story. You can refine typography, color, and layout after the workspace is created.",
  },
  3: {
    eyebrow: "Step 3 - Review and create",
    title: "Final check before opening the writing studio",
    description:
      "Review your setup and create the manuscript workspace. You can still edit all of these values later.",
  },
};

interface SectionCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-parchment-deep/90 bg-white/90 p-5 shadow-[0_24px_50px_-40px_rgba(26,20,16,0.6)] sm:p-6",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-serif text-[1.24rem] font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function NewBookPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
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

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = step === 1 ? form.title.trim().length > 0 && form.genre.length > 0 : true;
  const selectedStyle = COVER_STYLES.find((style) => style.id === form.coverStyle) ?? COVER_STYLES[0];
  const progressPercent = Math.round((step / STEP_META.length) * 100);
  const fieldClassName =
    "h-11 rounded-xl border-parchment-deep/90 bg-white text-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] focus:border-gold/55 focus:ring-gold/20";

  async function handleCreate() {
    if (!user || isCreating) return;
    setIsCreating(true);
    try {
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
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_15%_0%,#fffdf9_0%,#faf7f0_35%,#f6f1e8_100%)]">
      <AppNav />
      <main className="flex-1 md:ml-48">
        <header className="sticky top-0 z-30 border-b border-parchment-deep/85 bg-parchment/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full px-4 text-ink-muted hover:bg-white/80 hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </Link>

            <div className="hidden items-center gap-3 lg:flex">
              {STEP_META.map((item, index) => {
                const isComplete = step > item.id;
                const isActive = step === item.id;

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                        isComplete
                          ? "bg-ink text-parchment"
                          : isActive
                            ? "bg-parchment-warm text-ink ring-1 ring-gold/45"
                            : "bg-white text-ink-faint ring-1 ring-parchment-deep"
                      )}
                    >
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : item.id}
                    </div>
                    <div className="leading-tight">
                      <p
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-[0.11em]",
                          isActive ? "text-ink" : "text-ink-faint"
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-ink-faint">{item.note}</p>
                    </div>
                    {index < STEP_META.length - 1 && <div className="h-px w-8 bg-parchment-deep" />}
                  </div>
                );
              })}
            </div>

            <div className="rounded-full border border-parchment-deep/80 bg-white/90 px-3 py-1 text-xs text-ink-muted lg:hidden">
              Step {step} of {STEP_META.length}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative overflow-hidden rounded-[30px] border border-parchment-deep/90 bg-white/75 shadow-[0_50px_120px_-65px_rgba(26,20,16,0.65)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white/50 via-parchment-warm/60 to-white/50" />

            <div className="relative p-5 sm:p-8 lg:p-10">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-parchment-deep/75 pb-6">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-label">
                    {STEP_COPY[step].eyebrow}
                  </p>
                  <h1 className="mt-2 font-serif text-[1.82rem] font-semibold leading-tight text-ink sm:text-[2.05rem]">
                    {STEP_COPY[step].title}
                  </h1>
                  <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ink-muted sm:text-[0.95rem]">
                    {STEP_COPY[step].description}
                  </p>
                </div>

                <div className="w-full rounded-2xl border border-parchment-deep/85 bg-white/92 p-4 sm:w-60">
                  <div className="mb-2 flex items-center justify-between text-xs text-ink-muted">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-parchment-deep/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold/85 via-gold to-gold-dark transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
          {step === 1 && (
            <div className="grid animate-fade-in gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div className="space-y-5">
                <SectionCard
                  eyebrow="Identity"
                  title="Manuscript basics"
                  description="Give your manuscript a title and subtitle so every downstream surface has a clear anchor."
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="The name of your book"
                        value={form.title}
                        onChange={(e) => update("title", e.target.value)}
                        className={cn(fieldClassName, "text-base font-serif")}
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        placeholder="Optional subtitle or series name"
                        value={form.subtitle}
                        onChange={(e) => update("subtitle", e.target.value)}
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow="Context"
                  title="Publishing context"
                  description="Set the metadata your readers and collaborators will see first."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Genre *</Label>
                      <Select value={form.genre} onValueChange={(value) => update("genre", value)}>
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              <span className="flex items-center gap-2">
                                {GENRE_ICONS[genre]}
                                {genre}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Writing Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(value) => update("status", value as BookStatus)}
                      >
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="ongoing">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="author">Author Name</Label>
                      <Input
                        id="author"
                        placeholder="Your pen name or real name"
                        value={form.authorName}
                        onChange={(e) => update("authorName", e.target.value)}
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow="Narrative"
                  title="Story positioning"
                  description="Capture the hook and intended scale of this manuscript."
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="blurb">Blurb / Summary</Label>
                      <Textarea
                        id="blurb"
                        placeholder="Write a short description of your book - the hook that makes a reader want to continue..."
                        value={form.blurb}
                        onChange={(e) => update("blurb", e.target.value)}
                        rows={5}
                        className="rounded-xl border-parchment-deep/90 bg-white text-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] focus:border-gold/55 focus:ring-gold/20"
                      />
                    </div>

                    <div className="rounded-xl border border-parchment-deep/85 bg-parchment-warm/45 p-4">
                      <Label htmlFor="target" className="flex items-center justify-between text-sm">
                        <span>Target Word Count</span>
                        <span className="font-normal text-ink-muted">
                          {form.targetWordCount.toLocaleString()} words
                        </span>
                      </Label>
                      <input
                        id="target"
                        type="range"
                        min={10000}
                        max={200000}
                        step={5000}
                        value={form.targetWordCount}
                        onChange={(e) => update("targetWordCount", Number(e.target.value))}
                        className="mt-3 w-full accent-gold"
                      />
                      <div className="mt-2 flex justify-between text-xs text-ink-faint">
                        <span>10k</span>
                        <span>80k</span>
                        <span>200k</span>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <aside className="h-fit lg:sticky lg:top-28">
                <section className="rounded-2xl border border-parchment-deep/90 bg-white/92 p-5 shadow-[0_24px_50px_-40px_rgba(26,20,16,0.6)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                    Live summary
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-ink">
                    {form.title || "Untitled manuscript"}
                  </h3>
                  <p className="mt-1 text-sm text-ink-faint">{form.subtitle || "Subtitle not set yet"}</p>

                  <div className="mt-4 overflow-hidden rounded-xl border border-parchment-deep/90">
                    <div className="h-24 px-4 py-3" style={{ backgroundColor: selectedStyle.bg }}>
                      <p className="font-serif text-base font-semibold leading-tight text-parchment">
                        {form.title || "Book title"}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: selectedStyle.accent }}>
                        {form.authorName || "Author name"}
                      </p>
                    </div>
                    <dl className="divide-y divide-parchment-deep/80 bg-parchment/55">
                      <div className="flex items-center justify-between px-3 py-2 text-xs">
                        <dt className="text-ink-faint">Genre</dt>
                        <dd className="font-medium text-ink">{form.genre || "Not selected"}</dd>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 text-xs">
                        <dt className="text-ink-faint">Status</dt>
                        <dd className="font-medium capitalize text-ink">{form.status}</dd>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 text-xs">
                        <dt className="text-ink-faint">Target</dt>
                        <dd className="font-medium text-ink">{form.targetWordCount.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {step === 2 && (
            <div className="grid animate-fade-in gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
              <section className="rounded-2xl border border-parchment-deep/90 bg-white/92 p-5 shadow-[0_24px_50px_-40px_rgba(26,20,16,0.6)] sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                  Cover direction
                </p>
                <h2 className="mt-1 font-serif text-[1.24rem] font-semibold text-ink">
                  Choose your initial cover mood
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Select one concept to start. Your typography and colors here shape the first impression in your library.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {COVER_STYLES.map((style) => {
                    const selected = form.coverStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => update("coverStyle", style.id)}
                        className={cn(
                          "group overflow-hidden rounded-xl border text-left transition-all",
                          selected
                            ? "border-gold/70 bg-parchment/40 shadow-[0_14px_30px_-20px_rgba(201,168,76,0.75)]"
                            : "border-parchment-deep hover:border-gold/35 hover:bg-white"
                        )}
                      >
                        <div className="h-40 px-4 py-4" style={{ backgroundColor: style.bg }}>
                          <p className="font-serif text-base font-semibold text-parchment">
                            {form.title || "Book title"}
                          </p>
                          <p className="mt-1 text-xs" style={{ color: style.accent }}>
                            {form.authorName || "Author name"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-parchment-deep/85 bg-white/92 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-ink-muted">{style.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-ink">{style.label}</p>
                              <p className="text-xs text-ink-faint">{style.description}</p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-all",
                              selected
                                ? "border-gold bg-gold text-parchment"
                                : "border-parchment-deep text-transparent group-hover:text-ink-faint"
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="h-fit lg:sticky lg:top-28">
                <section className="rounded-2xl border border-parchment-deep/90 bg-white/92 p-5 shadow-[0_24px_50px_-40px_rgba(26,20,16,0.6)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                    Selected style
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{selectedStyle.label}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{selectedStyle.description}</p>

                  <div className="mt-4 rounded-xl border border-parchment-deep/90 p-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-ink-faint">Color pairing</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="h-10 flex-1 rounded-lg border border-parchment-deep/80"
                        style={{ backgroundColor: selectedStyle.bg }}
                      />
                      <div
                        className="h-10 w-16 rounded-lg border border-parchment-deep/80"
                        style={{ backgroundColor: selectedStyle.accent }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                      This palette becomes your default cover mood. You can fine-tune every color and layout in the cover editor.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {step === 3 && (
            <div className="grid animate-fade-in gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
              <section className="space-y-5">
                <SectionCard
                  eyebrow="Review"
                  title="Manuscript configuration"
                  description="Validate your choices before creating the workspace."
                  className="bg-white/92"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-parchment-deep/85 bg-parchment-warm/35 px-4 py-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Title</p>
                        <p className="mt-1 font-serif text-lg font-semibold text-ink">{form.title}</p>
                        {form.subtitle && <p className="text-sm text-ink-muted">{form.subtitle}</p>}
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                        Edit
                      </Button>
                    </div>

                    <dl className="overflow-hidden rounded-xl border border-parchment-deep/85 bg-white/80">
                      <div className="flex items-center justify-between border-b border-parchment-deep/80 px-4 py-3 text-sm">
                        <dt className="text-ink-faint">Genre</dt>
                        <dd className="font-medium text-ink">{form.genre}</dd>
                      </div>
                      <div className="flex items-center justify-between border-b border-parchment-deep/80 px-4 py-3 text-sm">
                        <dt className="text-ink-faint">Status</dt>
                        <dd className="font-medium capitalize text-ink">{form.status}</dd>
                      </div>
                      <div className="flex items-center justify-between border-b border-parchment-deep/80 px-4 py-3 text-sm">
                        <dt className="text-ink-faint">Target word count</dt>
                        <dd className="font-medium text-ink">{form.targetWordCount.toLocaleString()} words</dd>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-sm">
                        <dt className="text-ink-faint">Cover style</dt>
                        <dd className="font-medium text-ink">{selectedStyle.label}</dd>
                      </div>
                    </dl>

                    {form.blurb.trim().length > 0 && (
                      <div className="rounded-xl border border-parchment-deep/85 bg-parchment-warm/35 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Blurb</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{form.blurb}</p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </section>

              <aside className="h-fit lg:sticky lg:top-28">
                <section className="overflow-hidden rounded-2xl border border-parchment-deep/90 bg-white/92 shadow-[0_24px_50px_-40px_rgba(26,20,16,0.6)]">
                  <div className="h-40 px-5 py-5" style={{ backgroundColor: selectedStyle.bg }}>
                    <p className="font-serif text-xl font-semibold leading-tight text-parchment">{form.title}</p>
                    <p className="mt-1 text-sm" style={{ color: selectedStyle.accent }}>
                      {form.authorName || "Author"}
                    </p>
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Ready</p>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      Create this manuscript now and move directly into the writing editor.
                    </p>
                    <Button
                      type="button"
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="mt-2 w-full"
                      size="lg"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating workspace...
                        </>
                      ) : (
                        <>
                          <Feather className="h-4 w-4" />
                          Create & Start Writing
                        </>
                      )}
                    </Button>
                  </div>
                </section>
              </aside>
            </div>
          )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-parchment-deep/75 pt-6">
                {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < STEP_META.length ? (
                  <Button
                    type="button"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={!canProceed}
                    size="lg"
                    className="rounded-xl px-6"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreate}
                    size="lg"
                    disabled={isCreating}
                    className="rounded-xl px-6"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating workspace...
                      </>
                    ) : (
                      <>
                        <Feather className="h-4 w-4" />
                        Create & Start Writing
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

