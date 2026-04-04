"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Feather,
  Image as ImageIcon,
  Plus,
  Trash2,
  User,
  Globe,
  ScrollText,
  List,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getBook, saveBook } from "@/lib/store";
import { useAuth } from "@/lib/auth/context";
import type { Book, CharacterNote, WorldNote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function WorkspaceNav({
  bookId,
  bookTitle,
  genre,
  onOpenChapters,
}: {
  bookId: string;
  bookTitle: string;
  genre: string;
  onOpenChapters: () => void;
}) {
  const navLinks = [
    { icon: Feather, label: "Write", href: `/books/${bookId}` },
    { icon: ScrollText, label: "Outline", href: `/books/${bookId}/outline`, active: true },
    { icon: Eye, label: "Preview", href: `/books/${bookId}/preview` },
    { icon: ImageIcon, label: "Cover", href: `/books/${bookId}/cover` },
  ];

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 border-b border-parchment-deep bg-parchment/95 backdrop-blur-sm z-30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="icon-sm" className="text-ink-faint">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <div className="h-3.5 w-px bg-parchment-deep" />
          <BookOpen className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.5} />
          <span className="text-sm font-serif font-semibold text-ink truncate max-w-[140px] sm:max-w-[200px]">
            {bookTitle}
          </span>
          <span className="text-xs text-ink-faint hidden sm:inline">| {genre}</span>
        </div>

        <div className="hidden md:flex items-center gap-0.5 bg-parchment-warm rounded-lg p-1">
          {navLinks.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href}>
              <button
                className={cn(
                  "px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
                  active
                    ? "bg-parchment text-ink shadow-sm font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="w-3 h-3" /> {label}
              </button>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end md:w-32">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-ink-faint hover:text-ink"
            onClick={onOpenChapters}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <div className="md:hidden border-b border-parchment-deep bg-parchment/90">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5">
          {navLinks.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href} className="shrink-0">
              <span
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md flex items-center gap-1.5 transition-colors",
                  active
                    ? "text-ink bg-parchment-warm font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="w-3 h-3" /> {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function CharacterCard({ char, onDelete }: { char: CharacterNote; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-parchment-deep bg-parchment overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-parchment-warm/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-parchment-warm flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-ink">{char.name}</p>
            <p className="text-xs text-ink-faint">
              {char.role}
              {char.age ? ` | ${char.age}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {char.traits.slice(0, 2).map((t) => (
            <Badge key={t} variant="default" className="text-xs hidden sm:flex">
              {t}
            </Badge>
          ))}
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-ink-faint" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-parchment-deep animate-fade-in">
          <p className="text-sm text-ink-muted mt-3 leading-relaxed">{char.description}</p>
          {char.appearance && <p className="text-xs text-ink-faint mt-2 italic">{char.appearance}</p>}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {char.traits.map((t) => (
              <Badge key={t} variant="default" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
          <button
            onClick={onDelete}
            className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Remove character
          </button>
        </div>
      )}
    </div>
  );
}

export default function OutlinePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [addingChar, setAddingChar] = useState(false);
  const [addingWorld, setAddingWorld] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    role: "",
    description: "",
    traits: "",
    age: "",
    appearance: "",
  });
  const [newWorld, setNewWorld] = useState({
    title: "",
    content: "",
    category: "location" as WorldNote["category"],
  });

  useEffect(() => {
    if (!user) return;
    getBook(user.id, bookId).then((b) => {
      if (!b) {
        router.push("/");
        return;
      }
      setBook(b);
    });
  }, [bookId, user, router]);

  if (!book) return null;
  const currentBook = book;

  async function save(updated: Book) {
    if (!user) return;
    await saveBook(user.id, updated);
    setBook({ ...updated });
  }

  function handleArcChange(value: string) {
    save({ ...currentBook, notes: { ...currentBook.notes, arc: value } });
  }

  function handleTimelineChange(value: string) {
    save({ ...currentBook, notes: { ...currentBook.notes, timeline: value } });
  }

  function handleAddChar() {
    if (!newChar.name.trim()) return;
    const char: CharacterNote = {
      id: `char-${Date.now()}`,
      name: newChar.name,
      role: newChar.role,
      description: newChar.description,
      traits: newChar.traits
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      age: newChar.age || undefined,
      appearance: newChar.appearance || undefined,
    };
    save({
      ...currentBook,
      notes: { ...currentBook.notes, characters: [...currentBook.notes.characters, char] },
    });
    setNewChar({ name: "", role: "", description: "", traits: "", age: "", appearance: "" });
    setAddingChar(false);
  }

  function handleDeleteChar(id: string) {
    save({
      ...currentBook,
      notes: { ...currentBook.notes, characters: currentBook.notes.characters.filter((c) => c.id !== id) },
    });
  }

  function handleAddWorld() {
    if (!newWorld.title.trim()) return;
    const entry: WorldNote = {
      id: `world-${Date.now()}`,
      title: newWorld.title,
      content: newWorld.content,
      category: newWorld.category,
    };
    save({ ...currentBook, notes: { ...currentBook.notes, world: [...currentBook.notes.world, entry] } });
    setNewWorld({ title: "", content: "", category: "location" });
    setAddingWorld(false);
  }

  function handleDeleteWorld(id: string) {
    save({
      ...currentBook,
      notes: { ...currentBook.notes, world: currentBook.notes.world.filter((w) => w.id !== id) },
    });
  }

  const CATEGORY_COLORS: Record<string, string> = {
    location: "bg-blue-50 text-blue-700",
    magic: "bg-purple-50 text-purple-700",
    lore: "bg-amber-50 text-amber-700",
    politics: "bg-red-50 text-red-700",
    other: "bg-gray-50 text-gray-700",
  };

  const chapterList = (
    <>
      <div className="px-4 py-3 border-b border-parchment-deep flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Chapters</p>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden text-ink-faint hover:text-ink"
          onClick={() => setMobileChaptersOpen(false)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2 px-2">
          {book.chapters.map((ch) => (
            <div
              key={ch.id}
              className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-parchment-warm/60 transition-colors"
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  ch.status === "final"
                    ? "bg-emerald-400"
                    : ch.status === "revised"
                    ? "bg-blue-400"
                    : "bg-amber-400"
                )}
              />
              <div className="min-w-0">
                <p className="text-xs text-ink-faint">Ch. {ch.number}</p>
                <p className="text-sm text-ink font-medium leading-tight truncate">{ch.title}</p>
                {ch.summary && <p className="text-xs text-ink-faint mt-0.5 line-clamp-2">{ch.summary}</p>}
              </div>
            </div>
          ))}
          {book.chapters.length === 0 && (
            <p className="text-xs text-ink-faint px-4 py-6 text-center">No chapters yet</p>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-parchment overflow-hidden">
      <WorkspaceNav
        bookId={bookId}
        bookTitle={book.title}
        genre={book.genre}
        onOpenChapters={() => setMobileChaptersOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className="hidden md:flex w-56 border-r border-parchment-deep flex-col bg-parchment shrink-0">
          {chapterList}
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              <div className="mb-5 md:mb-6">
                <h1 className="font-serif text-xl sm:text-2xl font-semibold text-ink">{book.title}</h1>
                <p className="text-sm text-ink-faint mt-1">Story notes, characters, and world building</p>
              </div>

              <Tabs defaultValue="arc">
                <TabsList className="mb-5 md:mb-6 w-full justify-start overflow-x-auto whitespace-nowrap px-1">
                  <TabsTrigger value="arc" className="shrink-0">
                    <ScrollText className="w-3.5 h-3.5 mr-1.5" /> Story Arc
                  </TabsTrigger>
                  <TabsTrigger value="characters" className="shrink-0">
                    <User className="w-3.5 h-3.5 mr-1.5" /> Characters ({book.notes.characters.length})
                  </TabsTrigger>
                  <TabsTrigger value="world" className="shrink-0">
                    <Globe className="w-3.5 h-3.5 mr-1.5" /> World ({book.notes.world.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="arc">
                  <div className="space-y-4 md:space-y-6 animate-fade-in">
                    <div className="rounded-xl border border-parchment-deep p-4 md:p-5">
                      <h3 className="font-serif text-base font-semibold text-ink mb-3">Story Arc</h3>
                      <Textarea
                        value={book.notes.arc}
                        onChange={(e) => handleArcChange(e.target.value)}
                        placeholder="Describe your story's three-act structure, major turning points, and overall arc..."
                        rows={6}
                        className="text-sm"
                      />
                    </div>
                    <div className="rounded-xl border border-parchment-deep p-4 md:p-5">
                      <h3 className="font-serif text-base font-semibold text-ink mb-3">Timeline</h3>
                      <Textarea
                        value={book.notes.timeline}
                        onChange={(e) => handleTimelineChange(e.target.value)}
                        placeholder="Chronicle key dates and events in your story's timeline..."
                        rows={6}
                        className="text-sm"
                      />
                    </div>
                    {book.chapters.some((c) => c.summary) && (
                      <div className="rounded-xl border border-parchment-deep p-4 md:p-5">
                        <h3 className="font-serif text-base font-semibold text-ink mb-4">Chapter Summaries</h3>
                        <div className="space-y-3">
                          {book.chapters
                            .filter((c) => c.summary)
                            .map((ch) => (
                              <div key={ch.id} className="flex gap-3">
                                <span className="text-xs text-ink-faint pt-0.5 w-12 shrink-0">Ch. {ch.number}</span>
                                <div>
                                  <p className="text-sm font-medium text-ink mb-0.5">{ch.title}</p>
                                  <p className="text-sm text-ink-muted leading-relaxed">{ch.summary}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="characters">
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setAddingChar(true)} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Character
                      </Button>
                    </div>
                    {book.notes.characters.length === 0 ? (
                      <div className="text-center py-10 sm:py-14 md:py-16">
                        <div className="w-12 h-12 rounded-full bg-parchment-warm flex items-center justify-center mx-auto mb-4">
                          <User className="w-5 h-5 text-ink-faint" />
                        </div>
                        <p className="text-ink-faint text-sm">No characters yet.</p>
                        <p className="text-ink-faint text-xs mt-1">Add the people who populate your story.</p>
                      </div>
                    ) : (
                      book.notes.characters.map((char) => (
                        <CharacterCard key={char.id} char={char} onDelete={() => handleDeleteChar(char.id)} />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="world">
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setAddingWorld(true)} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Entry
                      </Button>
                    </div>
                    {book.notes.world.length === 0 ? (
                      <div className="text-center py-10 sm:py-14 md:py-16">
                        <div className="w-12 h-12 rounded-full bg-parchment-warm flex items-center justify-center mx-auto mb-4">
                          <Globe className="w-5 h-5 text-ink-faint" />
                        </div>
                        <p className="text-ink-faint text-sm">No world notes yet.</p>
                        <p className="text-ink-faint text-xs mt-1">Document locations, lore, magic systems, and more.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {book.notes.world.map((entry) => (
                          <div key={entry.id} className="rounded-xl border border-parchment-deep p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-semibold text-ink">{entry.title}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[entry.category])}>
                                  {entry.category}
                                </span>
                                <button
                                  onClick={() => handleDeleteWorld(entry.id)}
                                  className="text-ink-faint hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-ink-muted leading-relaxed">{entry.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </div>

      {mobileChaptersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileChaptersOpen(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="Close chapters panel"
          />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-[320px] bg-parchment border-r border-parchment-deep shadow-2xl flex flex-col">
            {chapterList}
          </div>
        </div>
      )}

      <Dialog open={addingChar} onOpenChange={setAddingChar}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input value={newChar.name} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} placeholder="Character name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Input value={newChar.role} onChange={(e) => setNewChar({ ...newChar, role: e.target.value })} placeholder="Protagonist, Ally..." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Age</Label>
                <Input value={newChar.age} onChange={(e) => setNewChar({ ...newChar, age: e.target.value })} placeholder="e.g. 34" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Traits (comma-separated)</Label>
                <Input value={newChar.traits} onChange={(e) => setNewChar({ ...newChar, traits: e.target.value })} placeholder="brave, loyal..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea value={newChar.description} onChange={(e) => setNewChar({ ...newChar, description: e.target.value })} rows={3} placeholder="Who are they? What drives them?" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Appearance</Label>
              <Input value={newChar.appearance} onChange={(e) => setNewChar({ ...newChar, appearance: e.target.value })} placeholder="Physical description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddingChar(false)}>Cancel</Button>
            <Button onClick={handleAddChar} disabled={!newChar.name.trim()}>Add Character</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addingWorld} onOpenChange={setAddingWorld}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add World Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={newWorld.title} onChange={(e) => setNewWorld({ ...newWorld, title: e.target.value })} placeholder="e.g. The Ember Throne" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <select
                value={newWorld.category}
                onChange={(e) => setNewWorld({ ...newWorld, category: e.target.value as WorldNote["category"] })}
                className="flex h-10 w-full rounded-md border border-parchment-deep bg-parchment px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink/20"
              >
                {["location", "magic", "lore", "politics", "other"].map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea value={newWorld.content} onChange={(e) => setNewWorld({ ...newWorld, content: e.target.value })} rows={4} placeholder="Describe this element of your world..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddingWorld(false)}>Cancel</Button>
            <Button onClick={handleAddWorld} disabled={!newWorld.title.trim()}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
