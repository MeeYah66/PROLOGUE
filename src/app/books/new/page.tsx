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
  { id: 1, title: "Manuscript", note: "Project setup" },
  { id: 2, title: "Cover", note: "Visual direction" },
  { id: 3, title: "Review", note: "Ready to create" },
] as const;

const STEP_COPY: Record<number, { eyebrow: string; title: string; description: string }> = {
  1: {
    eyebrow: "Step 1",
    title: "Manuscript Information",
    description: "Confirm your details to begin writing in a structured workspace.",
  },
  2: {
    eyebrow: "Step 2",
    title: "Cover Direction",
    description: "Choose a visual direction for your manuscript cover before you enter the studio.",
  },
  3: {
    eyebrow: "Step 3",
    title: "Review and Create",
    description: "Review your setup and create your manuscript workspace.",
  },
};

interface StepPanelProps {
  sectionTitle: string;
  children: React.ReactNode;
  className?: string;
}

function StepPanel({
  sectionTitle,
  children,
  className,
}: StepPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-parchment-warm/50 pt-4 overflow-hidden border border-parchment-deep shadow-[0px_2px_8px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <p className="px-4 text-[10px] uppercase tracking-[0.18em] font-semibold text-amber-label mb-3">
        {sectionTitle}
      </p>
      <div className="[&>div]:rounded-t-2xl [&>div]:rounded-b-none [&>div]:border-0 [&>div]:shadow-none">
        {children}
      </div>
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
  const fieldClassName =
    "h-10 rounded-lg border-parchment-deep/80 bg-white text-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] focus:border-gold/50 focus:ring-gold/15";

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
    <div className="flex min-h-screen" style={{ background: "var(--page-gradient)" }}>
      <AppNav />
      <main className="flex-1 md:ml-48">
        <header className="sticky top-0 z-30 h-12 border-b border-parchment-deep bg-parchment/95 backdrop-blur-sm">
          <div className="mx-auto grid h-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="justify-self-start">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 rounded-full px-3.5 text-ink-muted">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>

            <div className="hidden items-center gap-2.5 md:flex">
              {STEP_META.map((item, index) => {
                const isComplete = step > item.id;
                const isActive = step === item.id;
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                        isComplete
                          ? "bg-ink text-parchment"
                          : isActive
                            ? "bg-ink text-parchment"
                            : "border border-parchment-deep bg-white text-ink-faint"
                      )}
                    >
                      {isComplete ? <Check className="h-3 w-3" /> : item.id}
                    </span>
                    <span className={cn("text-[13px]", isActive ? "font-medium text-ink" : "text-ink-faint")}>
                      {item.title}
                    </span>
                    {index < STEP_META.length - 1 && <span className="mx-1 h-px w-6 bg-parchment-deep" />}
                  </div>
                );
              })}
            </div>

            <div className="justify-self-end">
              <Link href="/library">
                <Button size="sm" variant="outline" className="rounded-full px-4">
                  Save & Exit
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
              {step === 1 && (
                <div className="animate-fade-in space-y-5">
                  <div className="px-1 sm:px-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                      {STEP_COPY[1].eyebrow}
                    </p>
                    <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink">
                      {STEP_COPY[1].title}
                    </h1>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {STEP_COPY[1].description}
                    </p>
                  </div>

                  <StepPanel
                    sectionTitle="Manuscript Information"
                  >
                    <div className="rounded-t-2xl rounded-b-none border border-parchment-deep bg-white p-5 sm:p-6">
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="author">Author Name</Label>
                          <Input
                            id="author"
                            placeholder="Your pen name or real name"
                            value={form.authorName}
                            onChange={(e) => update("authorName", e.target.value)}
                            className={fieldClassName}
                          />
                        </div>

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

                        <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/35 p-4">
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
                    </div>
                  </StepPanel>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in space-y-5">
                  <div className="px-1 sm:px-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                      {STEP_COPY[2].eyebrow}
                    </p>
                    <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink">
                      {STEP_COPY[2].title}
                    </h1>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {STEP_COPY[2].description}
                    </p>
                  </div>

                  <StepPanel sectionTitle="Cover Direction">
                    <div className="rounded-t-2xl rounded-b-none border border-parchment-deep bg-white p-5 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {COVER_STYLES.map((style) => {
                          const selected = form.coverStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => update("coverStyle", style.id)}
                              className={cn(
                                "group overflow-hidden rounded-lg border text-left transition-all",
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
                    </div>
                  </StepPanel>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in space-y-5">
                  <div className="px-1 sm:px-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-label">
                      {STEP_COPY[3].eyebrow}
                    </p>
                    <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink">
                      {STEP_COPY[3].title}
                    </h1>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {STEP_COPY[3].description}
                    </p>
                  </div>

                  <StepPanel sectionTitle="Review">
                    <div className="rounded-t-2xl rounded-b-none border border-parchment-deep bg-white p-5 sm:p-6">
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg border border-parchment-deep/80">
                          <div className="h-32 px-5 py-4" style={{ backgroundColor: selectedStyle.bg }}>
                            <p className="font-serif text-xl font-semibold leading-tight text-parchment">{form.title}</p>
                            <p className="mt-1 text-sm" style={{ color: selectedStyle.accent }}>
                              {form.authorName || "Author"}
                            </p>
                          </div>
                          <dl className="divide-y divide-parchment-deep/80 bg-white">
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Genre</dt>
                              <dd className="font-medium text-ink">{form.genre}</dd>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Status</dt>
                              <dd className="font-medium capitalize text-ink">{form.status}</dd>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Target word count</dt>
                              <dd className="font-medium text-ink">{form.targetWordCount.toLocaleString()} words</dd>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Cover style</dt>
                              <dd className="font-medium text-ink">{selectedStyle.label}</dd>
                            </div>
                          </dl>
                        </div>

                        {form.blurb.trim().length > 0 && (
                          <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/35 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Blurb</p>
                            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{form.blurb}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </StepPanel>
                </div>
              )}

          {/* Navigation */}
          <div className="mt-7 flex items-center justify-between border-t border-parchment-deep/75 pt-5">
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
      </main>
    </div>
  );
}

