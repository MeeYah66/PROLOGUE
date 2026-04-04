"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Image as ImageIcon,
  List,
  Settings,
  Feather,
} from "lucide-react";
import { getBook, updateChapter, deleteChapter } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { Book, Chapter } from "@/lib/types";
import { countWords } from "@/lib/utils";
import { ChapterSidebar } from "@/components/workspace/ChapterSidebar";
import { WritingEditor } from "@/components/workspace/WritingEditor";
import { MetaPanel } from "@/components/workspace/MetaPanel";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function BookWorkspacePage() {
  const params    = useParams();
  const router    = useRouter();
  const { user }  = useAuth();
  const bookId    = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metaCollapsed, setMetaCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [mobileMetaOpen, setMobileMetaOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBook(user.id, bookId).then((b) => {
      if (!b) { router.push("/"); return; }
      setBook(b);
      setActiveChapterId(b.lastEditedChapterId ?? b.chapters[0]?.id ?? null);
    });
  }, [bookId, user]);

  if (!book) return null;

  const activeChapter = book.chapters.find((c) => c.id === activeChapterId) ?? null;

  async function refreshBook() {
    if (!user) return;
    const b = await getBook(user.id, bookId);
    if (b) setBook({ ...b });
  }

  async function handleChapterChange(updates: Partial<Chapter>) {
    if (!activeChapter || !user) return;
    const updated = { ...activeChapter, ...updates };
    await updateChapter(user.id, bookId, updated);
    await refreshBook();
  }

  async function handleAddChapter() {
    if (!user) return;
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      number: book!.chapters.length + 1,
      title: `Chapter ${book!.chapters.length + 1}`,
      content: "",
      status: "draft",
      wordCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await updateChapter(user.id, bookId, newChapter);
    await refreshBook();
    setActiveChapterId(newChapter.id);
  }

  async function handleDeleteChapter(id: string) {
    if (!user) return;
    await deleteChapter(user.id, bookId, id);
    await refreshBook();
    if (activeChapterId === id) {
      const remaining = (await getBook(user.id, bookId))?.chapters ?? [];
      setActiveChapterId(remaining[0]?.id ?? null);
    }
  }

  async function handleDuplicateChapter(id: string) {
    if (!book || !user) return;
    const original = book.chapters.find((c) => c.id === id);
    if (!original) return;
    const dup: Chapter = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      number: book.chapters.length + 1,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await updateChapter(user.id, bookId, dup);
    await refreshBook();
    setActiveChapterId(dup.id);
  }

  const navLinks = [
    { icon: List, label: "Outline", href: `/books/${bookId}/outline` },
    { icon: Eye, label: "Preview", href: `/books/${bookId}/preview` },
    { icon: ImageIcon, label: "Cover", href: `/books/${bookId}/cover` },
  ];

  return (
    <div className="flex flex-col h-screen bg-parchment overflow-hidden">
      {/* Top Bar */}
      <header
        className={cn(
          "flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 border-b border-parchment-deep bg-parchment/95 backdrop-blur-sm z-30 shrink-0 transition-opacity",
          focusMode && "opacity-0 hover:opacity-100"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="icon-sm" className="text-ink-faint hover:text-ink">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <div className="h-3.5 w-px bg-parchment-deep" />
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-ink-faint shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-serif font-semibold text-ink truncate max-w-[140px] sm:max-w-[200px]">
              {book.title}
            </span>
            <span className="text-xs text-ink-faint hidden sm:inline">| {book.genre}</span>
          </div>
        </div>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-parchment-warm rounded-lg p-1">
            <span className="px-3 py-1 text-xs font-medium text-ink bg-parchment rounded-md shadow-sm flex items-center gap-1.5">
              <Feather className="w-3 h-3" /> Write
            </span>
            {navLinks.map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href}>
                <button className="px-3 py-1 text-xs text-ink-muted hover:text-ink rounded-md flex items-center gap-1.5 transition-colors">
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-ink-faint hover:text-ink"
            onClick={() => setMobileChaptersOpen(true)}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          {activeChapter && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden text-ink-faint hover:text-ink"
              onClick={() => setMobileMetaOpen(true)}
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          )}
          <Link href={`/books/${bookId}/cover`}>
            <Button variant="outline" size="sm" className="text-xs h-7 hidden sm:inline-flex">
              Edit Cover
            </Button>
          </Link>
          <Link href={`/books/${bookId}/preview`}>
            <Button size="sm" className="text-xs h-7 gap-1.5">
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </Link>
        </div>
      </header>
      <div className="md:hidden border-b border-parchment-deep bg-parchment/90">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5">
          <span className="shrink-0 px-2.5 py-1 text-xs font-medium text-ink bg-parchment-warm rounded-md flex items-center gap-1.5">
            <Feather className="w-3 h-3" />
            Write
          </span>
          {navLinks.map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href} className="shrink-0">
              <span className="px-2.5 py-1 text-xs text-ink-muted hover:text-ink rounded-md flex items-center gap-1.5 transition-colors">
                <Icon className="w-3 h-3" />
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chapter sidebar */}
        <ChapterSidebar
          book={book}
          activeChapterId={activeChapterId}
          onSelectChapter={(id) => setActiveChapterId(id)}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onDuplicateChapter={handleDuplicateChapter}
          collapsed={sidebarCollapsed || focusMode}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          className="hidden md:flex"
        />

        {/* Writing editor */}
        <div className="flex-1 overflow-hidden">
          {activeChapter ? (
            <WritingEditor
              key={activeChapter.id}
              chapter={activeChapter}
              onChange={handleChapterChange}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((v) => !v)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-14 h-14 rounded-full bg-parchment-warm flex items-center justify-center">
                <Feather className="w-6 h-6 text-ink-faint" strokeWidth={1.2} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-ink mb-2">
                  No chapters yet
                </h3>
                <p className="text-sm text-ink-faint mb-5">
                  Add your first chapter to begin writing.
                </p>
                <Button onClick={handleAddChapter}>Add First Chapter</Button>
              </div>
            </div>
          )}
        </div>

        {/* Meta panel */}
        {activeChapter && (
          <MetaPanel
            book={book}
            chapter={activeChapter}
            onUpdateChapter={handleChapterChange}
            collapsed={metaCollapsed || focusMode}
            onToggleCollapse={() => setMetaCollapsed((v) => !v)}
            className="hidden md:flex"
          />
        )}
      </div>

      {mobileChaptersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileChaptersOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close chapters panel"
          />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px] bg-parchment border-r border-parchment-deep shadow-2xl">
            <ChapterSidebar
              book={book}
              activeChapterId={activeChapterId}
              onSelectChapter={(id) => {
                setActiveChapterId(id);
                setMobileChaptersOpen(false);
              }}
              onAddChapter={handleAddChapter}
              onDeleteChapter={handleDeleteChapter}
              onDuplicateChapter={handleDuplicateChapter}
              collapsed={false}
              onToggleCollapse={() => setMobileChaptersOpen(false)}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {mobileMetaOpen && activeChapter && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMetaOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close details panel"
          />
          <div className="absolute inset-y-0 right-0 w-[86vw] max-w-[320px] bg-parchment border-l border-parchment-deep shadow-2xl">
            <MetaPanel
              book={book}
              chapter={activeChapter}
              onUpdateChapter={handleChapterChange}
              collapsed={false}
              onToggleCollapse={() => setMobileMetaOpen(false)}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

