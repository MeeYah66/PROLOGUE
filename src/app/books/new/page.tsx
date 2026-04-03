"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Feather,
  Heart,
  Layers,
  Loader2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { GENRES } from "@/lib/data/mockData";
import { createBook, saveBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { BookStatus, CoverAlignment, CoverStyle } from "@/lib/types";
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
import {
  LINEN_COVER_OPTIONS,
  LinenBookThumbnail,
} from "@/components/cover/LinenBookThumbnail";
import { uploadCoverImage } from "@/lib/supabase/storage";

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
  const penName = user?.name?.trim() || "";
  const defaultCover = LINEN_COVER_OPTIONS[0];
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    genre: "",
    blurb: "",
    authorName: penName,
    status: "draft" as BookStatus,
    targetWordCount: 80000,
    coverStyle: defaultCover.id as CoverStyle,
    coverTitleColor: defaultCover.titleColor,
    coverAuthorColor: defaultCover.authorColor,
    coverBackgroundColor: defaultCover.bg,
    coverAlignment: "left" as CoverAlignment,
    coverOverlayOpacity: 0.5,
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!penName) return;
    setForm((prev) => (
      prev.authorName.trim().length > 0
        ? prev
        : { ...prev, authorName: penName }
    ));
  }, [penName]);

  useEffect(() => {
    return () => {
      if (coverImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(coverImageUrl);
      }
    };
  }, [coverImageUrl]);

  const canProceed = step === 1 ? form.title.trim().length > 0 && form.genre.length > 0 : true;
  const selectedStyle = LINEN_COVER_OPTIONS.find((style) => style.id === form.coverStyle) ?? LINEN_COVER_OPTIONS[0];
  const resolvedAuthorName = form.authorName.trim() || penName;
  const fieldClassName =
    "h-10 rounded-lg border-parchment-deep/85 bg-white text-[0.95rem] shadow-none focus:border-parchment-deep/85 focus:ring-0 dark:border-parchment-deep dark:bg-parchment/60 dark:focus:border-parchment-deep";

  function applyCoverStyle(styleId: CoverStyle) {
    const style = LINEN_COVER_OPTIONS.find((item) => item.id === styleId);
    if (!style) return;
    setForm((prev) => ({
      ...prev,
      coverStyle: style.id,
      coverTitleColor: style.titleColor,
      coverAuthorColor: style.authorColor,
      coverBackgroundColor: style.bg,
    }));
  }

  function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (coverImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(coverImageUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setCoverImageFile(file);
    setCoverImageUrl(nextUrl);
  }

  function clearCoverImage() {
    if (coverImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(coverImageUrl);
    }
    setCoverImageFile(null);
    setCoverImageUrl(undefined);
    if (coverFileRef.current) coverFileRef.current.value = "";
  }

  async function handleCreate() {
    if (!user || isCreating) return;
    setIsCreating(true);
    try {
      const book = await createBook(user.id, {
        title: form.title,
        subtitle: form.subtitle || undefined,
        genre: form.genre,
        blurb: form.blurb,
        authorName: resolvedAuthorName,
        status: form.status,
        targetWordCount: form.targetWordCount,
        cover: {
          style: form.coverStyle,
          titleColor: form.coverTitleColor,
          authorColor: form.coverAuthorColor,
          alignment: form.coverAlignment,
          backgroundColor: form.coverBackgroundColor,
          overlayOpacity: form.coverOverlayOpacity,
        },
      });

      if (coverImageFile) {
        try {
          const imageUrl = await uploadCoverImage(book.id, coverImageFile);
          await saveBook(user.id, {
            ...book,
            cover: {
              ...book.cover,
              imageUrl,
            },
          });
        } catch (error) {
          console.error("Unable to upload cover image during creation:", error);
        }
      }

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
                      <p className="mb-4 text-xs text-ink-muted">
                        Choose a style, upload a cover image, and fine-tune text placement now.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {LINEN_COVER_OPTIONS.map((style) => {
                          const selected = form.coverStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => applyCoverStyle(style.id)}
                              className={cn(
                                "group rounded-xl border bg-white p-4 text-left transition-all",
                                selected
                                  ? "border-gold/65 shadow-[0_16px_34px_-24px_rgba(201,168,76,0.82)]"
                                  : "border-parchment-deep/90 hover:border-gold/40 hover:shadow-[0_16px_32px_-26px_rgba(26,20,14,0.5)]"
                              )}
                            >
                              <div className="rounded-lg border border-parchment-deep/65 bg-parchment-warm/30 px-4 py-5">
                                <LinenBookThumbnail
                                  title={form.title}
                                  subtitle={form.subtitle}
                                  author={resolvedAuthorName}
                                  style={style.id}
                                  imageUrl={coverImageUrl}
                                  alignment={form.coverAlignment}
                                  variant="builder"
                                  className="mx-auto h-[206px] w-[148px] sm:h-[220px] sm:w-[160px]"
                                />
                              </div>

                              <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
                                <div>
                                  <p className="text-sm font-medium text-ink">{style.label}</p>
                                  <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                                    {style.description}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-all",
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

                      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/30 p-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Cover Image</Label>
                            {coverImageUrl ? (
                              <div className="flex items-center gap-3 rounded-md border border-parchment-deep bg-white p-2">
                                <div className="relative h-16 w-12 overflow-hidden rounded border border-parchment-deep/80">
                                  <LinenBookThumbnail
                                    title={form.title}
                                    subtitle={form.subtitle}
                                    author={resolvedAuthorName}
                                    style={form.coverStyle}
                                    imageUrl={coverImageUrl}
                                    alignment={form.coverAlignment}
                                    titleColor={form.coverTitleColor}
                                    subtitleColor={form.coverAuthorColor}
                                    authorColor={form.coverAuthorColor}
                                    imageOpacity={form.coverOverlayOpacity * 0.28}
                                    className="h-full w-full"
                                    variant="mini"
                                  />
                                </div>
                                <div className="flex-1 text-xs text-ink-muted">
                                  Image selected
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={clearCoverImage} className="h-8 px-2 text-ink-faint">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => coverFileRef.current?.click()}
                                className="w-full rounded-md border border-dashed border-parchment-deep bg-white px-3 py-2.5 text-xs text-ink-muted hover:border-gold/40 hover:text-ink transition-colors inline-flex items-center justify-center gap-2"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Upload cover image
                              </button>
                            )}
                            {coverImageUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => coverFileRef.current?.click()}
                                className="h-8 text-xs"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Replace image
                              </Button>
                            )}
                            <input
                              ref={coverFileRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="hidden"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Text Alignment</Label>
                            <div className="flex items-center gap-1 rounded-md border border-parchment-deep bg-white p-1">
                              {([
                                { value: "left", icon: AlignLeft },
                                { value: "center", icon: AlignCenter },
                                { value: "right", icon: AlignRight },
                              ] as { value: CoverAlignment; icon: React.ElementType }[]).map(({ value, icon: Icon }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => update("coverAlignment", value)}
                                  className={cn(
                                    "flex-1 h-8 rounded-sm inline-flex items-center justify-center transition-colors",
                                    form.coverAlignment === value
                                      ? "bg-parchment-warm text-ink"
                                      : "text-ink-muted hover:text-ink"
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Title</Label>
                              <input
                                type="color"
                                value={form.coverTitleColor}
                                onChange={(e) => update("coverTitleColor", e.target.value)}
                                className="h-9 w-full rounded border border-parchment-deep bg-white p-1 cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Author</Label>
                              <input
                                type="color"
                                value={form.coverAuthorColor}
                                onChange={(e) => update("coverAuthorColor", e.target.value)}
                                className="h-9 w-full rounded border border-parchment-deep bg-white p-1 cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Background</Label>
                              <input
                                type="color"
                                value={form.coverBackgroundColor}
                                onChange={(e) => update("coverBackgroundColor", e.target.value)}
                                className="h-9 w-full rounded border border-parchment-deep bg-white p-1 cursor-pointer"
                              />
                            </div>
                          </div>

                          {coverImageUrl && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Overlay Darkness · {Math.round(form.coverOverlayOpacity * 100)}%</Label>
                              <input
                                type="range"
                                min={0}
                                max={0.9}
                                step={0.05}
                                value={form.coverOverlayOpacity}
                                onChange={(e) => update("coverOverlayOpacity", Number(e.target.value))}
                                className="w-full accent-gold"
                              />
                            </div>
                          )}
                        </div>

                        <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/30 p-4">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-amber-label mb-2">Live Preview</p>
                          <div
                            className="rounded-md border border-parchment-deep/70 bg-white px-4 py-5"
                            style={{ backgroundColor: form.coverBackgroundColor }}
                          >
                            <LinenBookThumbnail
                              title={form.title}
                              subtitle={form.subtitle}
                              author={resolvedAuthorName}
                              style={form.coverStyle}
                              imageUrl={coverImageUrl}
                              alignment={form.coverAlignment}
                              titleColor={form.coverTitleColor}
                              subtitleColor={form.coverAuthorColor}
                              authorColor={form.coverAuthorColor}
                              imageOpacity={form.coverOverlayOpacity * 0.28}
                              variant="builder"
                              className="mx-auto h-[206px] w-[148px] sm:h-[220px] sm:w-[160px]"
                            />
                          </div>
                          <p className="mt-2 text-[11px] text-ink-faint">
                            Same controls continue in Cover inside the writing studio.
                          </p>
                        </div>
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
                      <p className="mb-4 text-xs text-ink-muted">
                        Final check before creating your manuscript workspace.
                      </p>
                      <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
                        <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/28 p-4">
                          <LinenBookThumbnail
                            title={form.title}
                            subtitle={form.subtitle}
                            author={resolvedAuthorName}
                            style={selectedStyle.id}
                            imageUrl={coverImageUrl}
                            alignment={form.coverAlignment}
                            titleColor={form.coverTitleColor}
                            subtitleColor={form.coverAuthorColor}
                            authorColor={form.coverAuthorColor}
                            imageOpacity={form.coverOverlayOpacity * 0.28}
                            variant="builder"
                            className="mx-auto h-[206px] w-[148px] sm:h-[220px] sm:w-[160px]"
                          />
                          <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-amber-label">
                            Selected Cover
                          </p>
                          <p className="mt-1 text-sm font-medium text-ink">{selectedStyle.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                            {selectedStyle.description}
                          </p>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-parchment-deep/80 bg-white">
                          <dl className="divide-y divide-parchment-deep/80">
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Title</dt>
                              <dd className="max-w-[65%] truncate font-medium text-ink">{form.title}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Subtitle</dt>
                              <dd className="max-w-[65%] truncate font-medium text-ink">
                                {form.subtitle.trim() || "None"}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Author</dt>
                              <dd className="max-w-[65%] truncate font-medium text-ink">
                                {resolvedAuthorName}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Genre</dt>
                              <dd className="max-w-[65%] truncate font-medium text-ink">{form.genre}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Status</dt>
                              <dd className="font-medium capitalize text-ink">{form.status}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                              <dt className="text-ink-faint">Target words</dt>
                              <dd className="font-medium text-ink">{form.targetWordCount.toLocaleString()} words</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                        {form.blurb.trim().length > 0 && (
                          <div className="rounded-lg border border-parchment-deep/80 bg-parchment-warm/35 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Blurb</p>
                            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{form.blurb}</p>
                          </div>
                        )}
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

