"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
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

export default function NewBookPage() {
  const router    = useRouter();
  const { user }  = useAuth();
  const [step, setStep] = useState(1);
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

  return (
    <div className="flex min-h-screen bg-parchment">
      <AppNav />
      <main className="flex-1 ml-48">
        {/* Top bar */}
        <div className="border-b border-parchment-deep px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-ink-muted">
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <span className={step === 1 ? "text-ink font-medium" : ""}>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={step === 2 ? "text-ink font-medium" : ""}>Style</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={step === 3 ? "text-ink font-medium" : ""}>Confirm</span>
          </div>
          <div className="w-28" />
        </div>

        <div className="max-w-2xl mx-auto px-8 py-12">
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-semibold text-ink mb-2">
                  Tell us about your book
                </h1>
                <p className="text-ink-faint text-sm">
                  These details will appear on your cover and throughout your workspace.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="The name of your book"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="text-base h-11 font-serif"
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre *</Label>
                    <Select value={form.genre} onValueChange={(v) => update("genre", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>
                            <span className="flex items-center gap-2">
                              {GENRE_ICONS[g]}
                              {g}
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
                      onValueChange={(v) => update("status", v)}
                    >
                      <SelectTrigger>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blurb">Blurb / Summary</Label>
                  <Textarea
                    id="blurb"
                    placeholder="Write a short description of your book — the hook that makes a reader want to continue..."
                    value={form.blurb}
                    onChange={(e) => update("blurb", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">
                    Target Word Count
                    <span className="ml-2 text-ink-faint font-normal">
                      ({form.targetWordCount.toLocaleString()} words)
                    </span>
                  </Label>
                  <input
                    type="range"
                    min={10000}
                    max={200000}
                    step={5000}
                    value={form.targetWordCount}
                    onChange={(e) => update("targetWordCount", Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                  <div className="flex justify-between text-xs text-ink-faint">
                    <span>Short Story (10k)</span>
                    <span>Novel (80k)</span>
                    <span>Epic (200k)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-semibold text-ink mb-2">
                  Choose a cover style
                </h1>
                <p className="text-ink-faint text-sm">
                  You can always customise this later in the Cover Design section.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {COVER_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => update("coverStyle", style.id)}
                    className={cn(
                      "group relative rounded-xl overflow-hidden border-2 transition-all text-left",
                      form.coverStyle === style.id
                        ? "border-gold shadow-md"
                        : "border-parchment-deep hover:border-parchment-warm"
                    )}
                  >
                    {/* Preview */}
                    <div
                      className="h-36 flex flex-col justify-end p-4"
                      style={{ backgroundColor: style.bg }}
                    >
                      <div
                        className="font-serif text-sm font-semibold"
                        style={{ color: "#f5f0e8" }}
                      >
                        {form.title || "Book Title"}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: style.accent }}>
                        {form.authorName || "Author Name"}
                      </div>
                    </div>
                    {/* Label */}
                    <div className="px-3 py-2.5 bg-parchment">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-muted">{style.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-ink">{style.label}</p>
                          <p className="text-xs text-ink-faint">{style.description}</p>
                        </div>
                      </div>
                    </div>
                    {form.coverStyle === style.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-semibold text-ink mb-2">
                  Ready to begin
                </h1>
                <p className="text-ink-faint text-sm">
                  Your workspace will be created and you can start writing immediately.
                </p>
              </div>

              <div className="rounded-xl border border-parchment-deep overflow-hidden mb-6">
                {/* Mini cover preview */}
                <div
                  className="h-28 flex items-end px-5 py-4"
                  style={{
                    backgroundColor:
                      COVER_STYLES.find((s) => s.id === form.coverStyle)?.bg ?? "#f0ece6",
                  }}
                >
                  <div>
                    <p className="font-serif text-lg font-semibold text-parchment leading-tight">
                      {form.title}
                    </p>
                    {form.authorName && (
                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color:
                            COVER_STYLES.find((s) => s.id === form.coverStyle)?.accent ?? "#c9a84c",
                        }}
                      >
                        {form.authorName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-faint">Genre</span>
                    <span className="text-ink font-medium">{form.genre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-faint">Status</span>
                    <span className="text-ink font-medium capitalize">{form.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-faint">Target</span>
                    <span className="text-ink font-medium">
                      {form.targetWordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-faint">Cover Style</span>
                    <span className="text-ink font-medium capitalize">{form.coverStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-parchment-deep">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} size="lg">
                <Feather className="w-4 h-4" />
                Create & Start Writing
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
