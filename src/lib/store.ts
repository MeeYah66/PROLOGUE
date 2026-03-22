/**
 * Supabase-backed store.
 * Every function is async and takes a userId so data is isolated per account.
 * RLS policies enforce that users can only access their own rows.
 */

import { createClient } from "@/lib/supabase/client";
import type { Book, Chapter, BookNotes } from "@/lib/types";

// ─── Internal helpers ──────────────────────────────────────────────────────

function newId(): string {
  return crypto.randomUUID();
}

// Map a DB book row (with joined chapters + book_notes) → Book
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any): Book {
  const notesRow = Array.isArray(row.book_notes)
    ? row.book_notes[0]
    : row.book_notes;

  const notes: BookNotes = {
    arc:        notesRow?.arc        ?? "",
    timeline:   notesRow?.timeline   ?? "",
    characters: notesRow?.characters ?? [],
    world:      notesRow?.world_notes ?? [],
    arcs:       [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapters: Chapter[] = (row.chapters ?? []).map((ch: any) => mapChapter(ch));

  return {
    id:                   row.id,
    title:                row.title,
    subtitle:             row.subtitle ?? undefined,
    genre:                row.genre,
    blurb:                row.blurb ?? "",
    authorName:           row.author_name ?? "",
    status:               row.status,
    cover:                row.cover ?? {
      style: "minimal",
      titleColor: "#1a1a1a",
      authorColor: "#6b6b6b",
      alignment: "left",
      backgroundColor: "#f0ece6",
      overlayOpacity: 0.5,
    },
    chapters:             chapters.sort((a, b) => a.number - b.number),
    notes,
    targetWordCount:      row.target_word_count ?? 80000,
    lastEditedChapterId:  row.last_edited_chapter_id ?? undefined,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

// Map a DB chapter row → Chapter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChapter(ch: any): Chapter {
  return {
    id:           ch.id,
    number:       ch.number,
    title:        ch.title ?? "",
    content:      ch.content ?? "",
    summary:      ch.summary ?? undefined,
    status:       ch.status ?? "draft",
    wordCount:    ch.word_count ?? 0,
    povCharacter: ch.pov ?? undefined,
    sceneLabel:   ch.scene ?? undefined,
    createdAt:    ch.created_at,
    updatedAt:    ch.updated_at,
  };
}

const BOOK_SELECT = `
  *,
  chapters(id, number, title, content, status, word_count, summary, pov, scene, created_at, updated_at),
  book_notes(arc, timeline, characters, world_notes)
`.trim();

// ─── Public API ────────────────────────────────────────────────────────────

export async function getBooks(userId: string): Promise<Book[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getBooks error:", error);
    return [];
  }

  return (data ?? []).map(mapBook);
}

export async function getBook(userId: string, bookId: string): Promise<Book | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .eq("user_id", userId)
    .eq("id", bookId)
    .single();

  if (error || !data) return undefined;
  return mapBook(data);
}

export async function saveBook(userId: string, book: Book): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  // Update books table (exclude chapters and notes — they live in separate tables)
  const { error: bookError } = await supabase
    .from("books")
    .update({
      title:                 book.title,
      subtitle:              book.subtitle ?? null,
      genre:                 book.genre,
      blurb:                 book.blurb,
      author_name:           book.authorName,
      status:                book.status,
      target_word_count:     book.targetWordCount,
      cover:                 book.cover,
      last_edited_chapter_id: book.lastEditedChapterId ?? null,
      updated_at:            now,
    })
    .eq("id", book.id)
    .eq("user_id", userId);

  if (bookError) console.error("saveBook (books) error:", bookError);

  // Upsert book_notes
  const { error: notesError } = await supabase
    .from("book_notes")
    .upsert(
      {
        book_id:     book.id,
        user_id:     userId,
        arc:         book.notes.arc,
        timeline:    book.notes.timeline,
        characters:  book.notes.characters,
        world_notes: book.notes.world,
      },
      { onConflict: "book_id" }
    );

  if (notesError) console.error("saveBook (book_notes) error:", notesError);
}

export async function createBook(
  userId: string,
  data: Omit<Book, "id" | "createdAt" | "updatedAt" | "chapters" | "notes">
): Promise<Book> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const id  = newId();

  const { error: bookError } = await supabase.from("books").insert({
    id,
    user_id:               userId,
    title:                 data.title,
    subtitle:              data.subtitle ?? null,
    genre:                 data.genre,
    blurb:                 data.blurb,
    author_name:           data.authorName,
    status:                data.status,
    target_word_count:     data.targetWordCount,
    cover:                 data.cover,
    last_edited_chapter_id: null,
    created_at:            now,
    updated_at:            now,
  });

  if (bookError) throw new Error(bookError.message);

  const { error: notesError } = await supabase.from("book_notes").insert({
    book_id:     id,
    user_id:     userId,
    arc:         "",
    timeline:    "",
    characters:  [],
    world_notes: [],
  });

  if (notesError) console.error("createBook (book_notes) error:", notesError);

  const book: Book = {
    ...data,
    id,
    chapters: [],
    notes: { arc: "", timeline: "", characters: [], world: [], arcs: [] },
    createdAt: now,
    updatedAt: now,
  };

  return book;
}

export async function deleteBook(userId: string, bookId: string): Promise<void> {
  const supabase = createClient();
  // Cascade on the DB handles chapters + book_notes deletion
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)
    .eq("user_id", userId);

  if (error) console.error("deleteBook error:", error);
}

export async function updateChapter(userId: string, bookId: string, chapter: Chapter): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error: chapterError } = await supabase.from("chapters").upsert({
    id:         chapter.id,
    book_id:    bookId,
    user_id:    userId,
    number:     chapter.number,
    title:      chapter.title,
    content:    chapter.content,
    status:     chapter.status,
    word_count: chapter.wordCount,
    summary:    chapter.summary ?? null,
    pov:        chapter.povCharacter ?? null,
    scene:      chapter.sceneLabel ?? null,
    created_at: chapter.createdAt,
    updated_at: now,
  });

  if (chapterError) console.error("updateChapter error:", chapterError);

  const { error: bookError } = await supabase
    .from("books")
    .update({
      last_edited_chapter_id: chapter.id,
      updated_at:             now,
    })
    .eq("id", bookId)
    .eq("user_id", userId);

  if (bookError) console.error("updateChapter (books) error:", bookError);
}

export async function deleteChapter(userId: string, bookId: string, chapterId: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error: chapterError } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId)
    .eq("book_id", bookId)
    .eq("user_id", userId);

  if (chapterError) console.error("deleteChapter error:", chapterError);

  const { error: bookError } = await supabase
    .from("books")
    .update({ updated_at: now })
    .eq("id", bookId)
    .eq("user_id", userId);

  if (bookError) console.error("deleteChapter (books) error:", bookError);
}

export async function reorderChapters(userId: string, bookId: string, chapterIds: string[]): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  await Promise.all(
    chapterIds.map((id, i) =>
      supabase
        .from("chapters")
        .update({ number: i + 1, updated_at: now })
        .eq("id", id)
        .eq("book_id", bookId)
        .eq("user_id", userId)
    )
  );
}
