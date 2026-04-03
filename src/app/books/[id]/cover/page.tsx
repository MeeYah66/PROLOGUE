"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Feather,
  Image as ImageIcon,
  ScrollText,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Check,
} from "lucide-react";
import { getBook, saveBook } from "@/lib/store";
import { uploadCoverImage, deleteCoverImage } from "@/lib/supabase/storage";
import { useAuth } from "@/lib/auth/context";
import type { Book, CoverStyle, CoverAlignment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function WorkspaceNav({ bookId, bookTitle, genre }: { bookId: string; bookTitle: string; genre: string }) {
  const navLinks = [
    { icon: Feather, label: "Write", href: `/books/${bookId}` },
    { icon: ScrollText, label: "Outline", href: `/books/${bookId}/outline` },
    { icon: Eye, label: "Preview", href: `/books/${bookId}/preview` },
    { icon: ImageIcon, label: "Cover", href: `/books/${bookId}/cover`, active: true },
  ];
  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-parchment-deep bg-parchment/95 backdrop-blur-sm z-30 shrink-0">
      <div className="flex items-center gap-2">
        <Link href="/"><Button variant="ghost" size="icon-sm" className="text-ink-faint"><ArrowLeft className="w-3.5 h-3.5" /></Button></Link>
        <div className="h-3.5 w-px bg-parchment-deep" />
        <BookOpen className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
        <span className="text-sm font-serif font-semibold text-ink truncate max-w-[200px]">{bookTitle}</span>
        <span className="text-xs text-ink-faint hidden sm:inline">· {genre}</span>
      </div>
      <div className="flex items-center gap-0.5 bg-parchment-warm rounded-lg p-1">
        {navLinks.map(({ icon: Icon, label, href, active }) => (
          <Link key={href} href={href}>
            <button className={cn(
              "px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
              active ? "bg-parchment text-ink shadow-sm font-medium" : "text-ink-muted hover:text-ink"
            )}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          </Link>
        ))}
      </div>
      <div className="w-32" />
    </header>
  );
}

const COVER_STYLES: { id: CoverStyle; label: string; description: string }[] = [
  { id: "minimal", label: "Minimal", description: "Clean typographic" },
  { id: "classic", label: "Classic", description: "Timeless editorial" },
  { id: "ethereal", label: "Ethereal", description: "Atmospheric moody" },
  { id: "bold", label: "Bold", description: "Dramatic striking" },
];

const STYLE_PRESETS: Record<CoverStyle, { bg: string; titleColor: string; authorColor: string }> = {
  minimal: { bg: "#f0ece6", titleColor: "#1a1a1a", authorColor: "#6b6b6b" },
  classic: { bg: "#1a3a52", titleColor: "#ffffff", authorColor: "#c9e4f0" },
  ethereal: { bg: "#1a1410", titleColor: "#f5f0e8", authorColor: "#c9a84c" },
  bold: { bg: "#2d1a1a", titleColor: "#ffffff", authorColor: "#e87c5a" },
};

export default function CoverDesignPage() {
  const params   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const bookId   = params.id as string;
  const fileRef  = useRef<HTMLInputElement>(null);
  const [book, setBook]         = useState<Book | null>(null);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBook(user.id, bookId).then((b) => {
      if (!b) { router.push("/"); return; }
      setBook(b);
    });
  }, [bookId, user]);

  if (!book) return null;

  async function update(updates: Partial<Book["cover"]>) {
    if (!book || !user) return;
    const updated = { ...book, cover: { ...book.cover, ...updates } };
    await saveBook(user.id, updated);
    setBook(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyStylePreset(style: CoverStyle) {
    const preset = STYLE_PRESETS[style];
    update({ style, ...preset });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !book) return;
    setUploading(true);
    try {
      const url = await uploadCoverImage(book.id, file);
      await update({ imageUrl: url, overlayOpacity: 0 });
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemoveImage() {
    if (!book) return;
    try {
      await deleteCoverImage(book.id);
    } catch {
      // Non-fatal — proceed to clear the URL regardless
    }
    await update({ imageUrl: undefined });
  }

  const { cover } = book;

  return (
    <div className="flex flex-col h-screen bg-parchment overflow-hidden">
      <WorkspaceNav bookId={bookId} bookTitle={book.title} genre={book.genre} />

      <div className="flex flex-1 overflow-hidden">
        {/* Controls panel */}
        <div className="w-72 border-r border-parchment-deep flex flex-col bg-parchment shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-deep">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Cover Design</p>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Cover image */}
              <div className="space-y-2">
                <Label className="text-xs">Cover Image</Label>
                {cover.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-parchment-warm">
                    <Image src={cover.imageUrl} alt="Cover" fill className="object-cover" />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 flex items-center justify-center text-white hover:bg-ink transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-[2/3] rounded-lg border-2 border-dashed border-parchment-deep hover:border-gold/40 hover:bg-parchment-warm/40 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin text-ink-faint" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span className="text-xs text-ink-faint">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-ink-faint group-hover:text-gold transition-colors" />
                        <span className="text-xs text-ink-faint group-hover:text-ink transition-colors">
                          Upload image
                        </span>
                        <span className="text-xs text-ink-faint/60">JPG, PNG, WEBP</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {cover.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-3.5 h-3.5" /> Replace Image
                  </Button>
                )}
              </div>

              <Separator />

              {/* Style presets */}
              <div className="space-y-2">
                <Label className="text-xs">Cover Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_STYLES.map((style) => {
                    const preset = STYLE_PRESETS[style.id];
                    return (
                      <button
                        key={style.id}
                        onClick={() => applyStylePreset(style.id)}
                        className={cn(
                          "relative rounded-lg overflow-hidden border-2 transition-all text-left",
                          cover.style === style.id ? "border-gold" : "border-parchment-deep hover:border-parchment-warm"
                        )}
                      >
                        <div
                          className="h-12 flex items-end p-1.5"
                          style={{ backgroundColor: preset.bg }}
                        >
                          <span className="text-[9px] font-serif font-semibold leading-tight" style={{ color: preset.titleColor }}>
                            {book.title.length > 12 ? book.title.slice(0, 12) + "…" : book.title}
                          </span>
                        </div>
                        <div className="px-1.5 py-1 bg-parchment">
                          <p className="text-[10px] font-medium text-ink">{style.label}</p>
                        </div>
                        {cover.style === style.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Text colors */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cover.titleColor}
                      onChange={(e) => update({ titleColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-parchment-deep"
                    />
                    <Input
                      value={cover.titleColor}
                      onChange={(e) => update({ titleColor: e.target.value })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Author Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cover.authorColor}
                      onChange={(e) => update({ authorColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-parchment-deep"
                    />
                    <Input
                      value={cover.authorColor}
                      onChange={(e) => update({ authorColor: e.target.value })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cover.backgroundColor}
                      onChange={(e) => update({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-parchment-deep"
                    />
                    <Input
                      value={cover.backgroundColor}
                      onChange={(e) => update({ backgroundColor: e.target.value })}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alignment */}
              <div className="space-y-2">
                <Label className="text-xs">Text Alignment</Label>
                <div className="flex items-center gap-1 bg-parchment-warm rounded-lg p-1">
                  {([
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                  ] as { value: CoverAlignment; icon: React.ElementType }[]).map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => update({ alignment: value })}
                      className={cn(
                        "flex-1 py-1.5 rounded-md flex items-center justify-center transition-all",
                        cover.alignment === value ? "bg-parchment text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>

        {/* Cover preview */}
        <div className="flex-1 flex items-center justify-center bg-[#e8e4de] overflow-hidden p-8">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{
              width: "min(340px, 100%)",
              aspectRatio: "2/3",
              boxShadow: "8px 8px 40px rgba(0,0,0,0.25), 2px 2px 0 rgba(0,0,0,0.1)",
              backgroundColor: cover.backgroundColor,
            }}
          >
            {cover.imageUrl && (
              <Image src={cover.imageUrl} alt="Cover" fill className="object-cover" />
            )}

            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-end p-8",
                cover.alignment === "center" && "items-center text-center",
                cover.alignment === "left" && "items-start text-left",
                cover.alignment === "right" && "items-end text-right",
              )}
            >
              {book.subtitle && (
                <p
                  className="text-xs tracking-widest uppercase mb-2 opacity-80"
                  style={{ color: cover.authorColor, fontFamily: "var(--font-inter)" }}
                >
                  {book.subtitle}
                </p>
              )}
              <h1
                className="font-serif text-3xl font-bold leading-tight mb-3"
                style={{ color: cover.titleColor, fontFamily: "var(--font-lora)" }}
              >
                {book.title}
              </h1>
              <p
                className="text-sm tracking-wide"
                style={{ color: cover.authorColor, fontFamily: "var(--font-inter)" }}
              >
                {book.authorName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
