"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Feather,
  Image as ImageIcon,
  List,
  ScrollText,
  X,
} from "lucide-react";
import { getBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { Book, Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { estimateReadingTime } from "@/lib/utils";

function WorkspaceNav({ bookId, bookTitle, genre }: { bookId: string; bookTitle: string; genre: string }) {
  const navLinks = [
    { icon: Feather, label: "Write", href: `/books/${bookId}` },
    { icon: ScrollText, label: "Outline", href: `/books/${bookId}/outline` },
    { icon: Eye, label: "Preview", href: `/books/${bookId}/preview`, active: true },
    { icon: ImageIcon, label: "Cover", href: `/books/${bookId}/cover` },
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

// Cover page spread
function CoverPage({ book }: { book: Book }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: book.cover.backgroundColor }}
    >
      {book.cover.imageUrl && (
        <>
          <Image src={book.cover.imageUrl} alt={book.title} fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,${book.cover.overlayOpacity}) 100%)`,
            }}
          />
        </>
      )}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-12",
          book.cover.alignment === "center" && "items-center text-center",
          book.cover.alignment === "left" && "items-start text-left",
          book.cover.alignment === "right" && "items-end text-right",
        )}
      >
        {book.subtitle && (
          <p
            className="text-sm tracking-widest uppercase mb-3 opacity-80"
            style={{ color: book.cover.authorColor }}
          >
            {book.subtitle}
          </p>
        )}
        <h1
          className="font-serif text-5xl font-bold leading-tight mb-4"
          style={{ color: book.cover.titleColor }}
        >
          {book.title}
        </h1>
        <p
          className="text-lg tracking-wide"
          style={{ color: book.cover.authorColor }}
        >
          {book.authorName}
        </p>
      </div>
    </div>
  );
}

// Title page
function TitlePage({ book }: { book: Book }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#faf8f5] p-12">
      <div className="text-center max-w-sm">
        <div className="w-12 h-px bg-ink-faint mx-auto mb-8" />
        <h1 className="font-serif text-4xl font-semibold text-ink mb-3 leading-tight">
          {book.title}
        </h1>
        {book.subtitle && (
          <p className="text-sm text-ink-muted mb-6 font-serif italic">{book.subtitle}</p>
        )}
        <div className="w-4 h-px bg-gold mx-auto mb-6" />
        <p className="text-base text-ink-muted font-serif">{book.authorName}</p>
        <div className="w-12 h-px bg-ink-faint mx-auto mt-8" />
      </div>
    </div>
  );
}

// Chapter page
function ChapterPage({ chapter }: { chapter: Chapter }) {
  return (
    <div className="w-full min-h-full bg-[#faf8f5] px-16 py-16">
      {/* Chapter header */}
      <div className="text-center mb-12">
        <p className="text-xs text-ink-faint tracking-widest uppercase mb-3 font-medium">
          Chapter {chapter.number}
        </p>
        <h2 className="font-serif text-3xl font-semibold text-ink leading-tight">
          {chapter.title}
        </h2>
        <div className="w-8 h-0.5 bg-gold mx-auto mt-4" />
      </div>

      {/* Content */}
      <div
        className="tiptap-editor book-page max-w-none"
        style={{
          fontFamily: "var(--font-lora)",
          fontSize: "1rem",
          lineHeight: "1.9",
          color: "#1a1a1a",
        }}
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />

      {/* End marker */}
      <div className="flex items-center gap-4 mt-12 pt-6 border-t border-parchment-deep">
        <div className="flex-1 h-px" />
        <span className="text-xs text-ink-faint">✦</span>
        <div className="flex-1 h-px" />
      </div>
    </div>
  );
}

type PreviewPage =
  | { type: "cover" }
  | { type: "title" }
  | { type: "chapter"; chapter: Chapter };

export default function PreviewPage() {
  const params   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const bookId   = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBook(user.id, bookId).then((b) => {
      if (!b) { router.push("/"); return; }
      setBook(b);
    });
  }, [bookId, user]);

  if (!book) return null;

  const pages: PreviewPage[] = [
    { type: "cover" },
    { type: "title" },
    ...book.chapters.map((ch): PreviewPage => ({ type: "chapter", chapter: ch })),
  ];

  const totalPages = pages.length;
  const page = pages[currentPage];

  const totalWords = book.chapters.reduce((s, c) => s + c.wordCount, 0);

  return (
    <div className="flex flex-col h-screen bg-[#e8e4de] overflow-hidden">
      <WorkspaceNav bookId={bookId} bookTitle={book.title} genre={book.genre} />

      <div className="flex flex-1 overflow-hidden">
        {/* TOC Sidebar */}
        {showToc && (
          <div className="w-56 border-r border-parchment-deep bg-parchment flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-deep">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Contents</p>
              <button onClick={() => setShowToc(false)} className="text-ink-faint hover:text-ink transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-2 px-2">
                {pages.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      i === currentPage ? "bg-parchment-warm text-ink font-medium" : "text-ink-muted hover:bg-parchment-warm/60 hover:text-ink"
                    )}
                  >
                    {p.type === "cover" ? "Cover" : p.type === "title" ? "Title Page" : (
                      <span>
                        <span className="text-xs text-ink-faint block">Ch. {p.chapter.number}</span>
                        {p.chapter.title}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Preview area */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-hidden">
          {/* Preview controls */}
          <div className="flex items-center gap-4 py-3 shrink-0">
            <button
              onClick={() => setShowToc((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-3 py-1.5 rounded-md hover:bg-parchment transition-colors"
            >
              <List className="w-3.5 h-3.5" />
              Contents
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-ink-faint w-20 text-center">
                {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-xs text-ink-faint">{totalWords.toLocaleString()} words · {estimateReadingTime(totalWords)} total read</span>
          </div>

          {/* Book page */}
          <div className="flex-1 w-full flex items-start justify-center px-8 pb-8 overflow-y-auto">
            <div
              className="w-full max-w-[640px] min-h-[800px] bg-[#faf8f5] shadow-xl rounded-sm overflow-hidden"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15), 4px 0 0 rgba(0,0,0,0.05)" }}
            >
              {page.type === "cover" && <div className="h-[800px]"><CoverPage book={book} /></div>}
              {page.type === "title" && <div className="h-[800px]"><TitlePage book={book} /></div>}
              {page.type === "chapter" && <ChapterPage chapter={page.chapter} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
