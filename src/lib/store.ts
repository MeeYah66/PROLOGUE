/**
 * Supabase-backed store.
 * Every function is async and takes a userId so data is isolated per account.
 * RLS policies enforce that users can only access their own rows.
 */

import { createClient } from "@/lib/supabase/client";
import type { Book, Chapter, BookNotes } from "@/lib/types";
import {
  htmlToSafeBlocks,
  safeBlocksToHtml,
} from "@/lib/sanitization/chapter-content";

// ─── Internal helpers ──────────────────────────────────────────────────────

function newId(): string {
  return crypto.randomUUID();
}

export class StoreConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreConflictError";
  }
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
  const safeContent = safeBlocksToHtml(htmlToSafeBlocks(ch.content ?? ""));
  return {
    id:           ch.id,
    number:       ch.number,
    title:        ch.title ?? "",
    content:      safeContent,
    summary:      ch.summary ?? undefined,
    status:       ch.status ?? "draft",
    wordCount:    ch.word_count ?? 0,
    povCharacter: ch.pov ?? undefined,
    sceneLabel:   ch.scene ?? undefined,
    createdAt:    ch.created_at,
    updatedAt:    ch.updated_at,
  };
}

const BOOK_LIST_SELECT = `
  *,
  chapters(id, number, title, status, word_count, summary, pov, scene, created_at, updated_at),
  book_notes(arc, timeline, characters, world_notes)
`.trim();

const BOOK_DETAIL_SELECT = `
  *,
  chapters(id, number, title, content, status, word_count, summary, pov, scene, created_at, updated_at),
  book_notes(arc, timeline, characters, world_notes)
`.trim();

// ─── Public API ────────────────────────────────────────────────────────────

export async function getBooks(
  userId: string,
  options?: { includeChapterContent?: boolean }
): Promise<Book[]> {
  const supabase = createClient();
  const selectFields = options?.includeChapterContent
    ? BOOK_DETAIL_SELECT
    : BOOK_LIST_SELECT;
  const { data, error } = await supabase
    .from("books")
    .select(selectFields)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load manuscripts: ${error.message}`);
  }

  return (data ?? []).map(mapBook);
}

export async function getBook(userId: string, bookId: string): Promise<Book | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_DETAIL_SELECT)
    .eq("user_id", userId)
    .eq("id", bookId)
    .single();

  if (error || !data) return undefined;
  return mapBook(data);
}

export async function saveBook(userId: string, book: Book): Promise<void> {
  const supabase = createClient();
  const expectedUpdatedAt = book.updatedAt;

  // Update books table (exclude chapters and notes — they live in separate tables)
  let bookUpdateQuery = supabase
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
    })
    .eq("id", book.id)
    .eq("user_id", userId);

  if (expectedUpdatedAt) {
    bookUpdateQuery = bookUpdateQuery.eq("updated_at", expectedUpdatedAt);
  }

  const {
    data: updatedBookRow,
    error: bookError,
  } = await bookUpdateQuery
    .select("updated_at")
    .maybeSingle();

  if (bookError) throw new Error(`Failed to save manuscript details: ${bookError.message}`);
  if (!updatedBookRow) {
    throw new StoreConflictError(
      "This manuscript changed in another session. Refresh to continue with the latest version."
    );
  }

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

  if (notesError) throw new Error(`Failed to save manuscript notes: ${notesError.message}`);

  book.updatedAt = updatedBookRow.updated_at;
}

export async function createBook(
  userId: string,
  data: Omit<Book, "id" | "createdAt" | "updatedAt" | "chapters" | "notes">,
  notesSeed?: BookNotes
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
    arc:         notesSeed?.arc ?? "",
    timeline:    notesSeed?.timeline ?? "",
    characters:  notesSeed?.characters ?? [],
    world_notes: notesSeed?.world ?? [],
  });

  if (notesError) {
    await supabase.from("books").delete().eq("id", id).eq("user_id", userId);
    throw new Error(`Failed to initialize manuscript notes: ${notesError.message}`);
  }

  const book: Book = {
    ...data,
    id,
    chapters: [],
    notes: notesSeed
      ? {
          arc: notesSeed.arc,
          timeline: notesSeed.timeline,
          characters: [...notesSeed.characters],
          world: [...notesSeed.world],
          arcs: [...notesSeed.arcs],
        }
      : { arc: "", timeline: "", characters: [], world: [], arcs: [] },
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

  if (error) throw new Error(`Failed to delete manuscript: ${error.message}`);
}

export async function updateChapter(
  userId: string,
  bookId: string,
  chapter: Chapter
): Promise<{ chapterUpdatedAt: string; bookUpdatedAt: string }> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const safeContent = safeBlocksToHtml(htmlToSafeBlocks(chapter.content ?? ""));
  const basePayload = {
    book_id: bookId,
    user_id: userId,
    number: chapter.number,
    title: chapter.title,
    content: safeContent,
    status: chapter.status,
    word_count: chapter.wordCount,
    summary: chapter.summary ?? null,
    pov: chapter.povCharacter ?? null,
    scene: chapter.sceneLabel ?? null,
    updated_at: now,
  };

  const { data: existingChapter, error: chapterLookupError } = await supabase
    .from("chapters")
    .select("id")
    .eq("id", chapter.id)
    .eq("book_id", bookId)
    .eq("user_id", userId)
    .maybeSingle();

  if (chapterLookupError) {
    throw new Error(`Failed to check chapter state: ${chapterLookupError.message}`);
  }

  let chapterUpdatedAt = now;
  if (existingChapter) {
    const {
      data: updatedChapter,
      error: chapterUpdateError,
    } = await supabase
      .from("chapters")
      .update(basePayload)
      .eq("id", chapter.id)
      .eq("book_id", bookId)
      .eq("user_id", userId)
      .eq("updated_at", chapter.updatedAt)
      .select("updated_at")
      .maybeSingle();

    if (chapterUpdateError) {
      throw new Error(`Failed to save chapter: ${chapterUpdateError.message}`);
    }
    if (!updatedChapter) {
      throw new StoreConflictError(
        "This chapter changed in another session. Refresh to continue with the latest version."
      );
    }
    chapterUpdatedAt = updatedChapter.updated_at;
  } else {
    const { error: chapterInsertError } = await supabase.from("chapters").insert({
      id: chapter.id,
      ...basePayload,
      created_at: chapter.createdAt,
    });
    if (chapterInsertError) {
      throw new Error(`Failed to save chapter: ${chapterInsertError.message}`);
    }
  }

  const {
    data: updatedBookRow,
    error: bookError,
  } = await supabase
    .from("books")
    .update({
      last_edited_chapter_id: chapter.id,
      updated_at:             now,
    })
    .eq("id", bookId)
    .eq("user_id", userId)
    .select("updated_at")
    .single();

  if (bookError) throw new Error(`Failed to update manuscript metadata: ${bookError.message}`);
  return {
    chapterUpdatedAt,
    bookUpdatedAt: updatedBookRow.updated_at,
  };
}

export async function insertBookChapters(
  userId: string,
  bookId: string,
  chapters: Chapter[]
): Promise<{ bookUpdatedAt: string; lastEditedChapterId: string | null } | undefined> {
  if (chapters.length === 0) return undefined;

  const supabase = createClient();
  const now = new Date().toISOString();
  const ordered = [...chapters].sort((a, b) => a.number - b.number);

  const rows = ordered.map((chapter) => ({
    id: chapter.id,
    book_id: bookId,
    user_id: userId,
    number: chapter.number,
    title: chapter.title,
    content: safeBlocksToHtml(htmlToSafeBlocks(chapter.content ?? "")),
    status: chapter.status,
    word_count: chapter.wordCount,
    summary: chapter.summary ?? null,
    pov: chapter.povCharacter ?? null,
    scene: chapter.sceneLabel ?? null,
    created_at: chapter.createdAt,
    updated_at: now,
  }));

  const { error: chaptersError } = await supabase.from("chapters").insert(rows);
  if (chaptersError) {
    throw new Error(`Failed to import chapters: ${chaptersError.message}`);
  }

  const lastEditedChapterId = ordered[ordered.length - 1]?.id ?? null;
  const {
    data: updatedBookRow,
    error: bookError,
  } = await supabase
    .from("books")
    .update({
      last_edited_chapter_id: lastEditedChapterId,
      updated_at: now,
    })
    .eq("id", bookId)
    .eq("user_id", userId)
    .select("updated_at")
    .single();

  if (bookError) {
    throw new Error(`Failed to finalize manuscript chapters: ${bookError.message}`);
  }
  return {
    bookUpdatedAt: updatedBookRow.updated_at,
    lastEditedChapterId,
  };
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

  if (chapterError) throw new Error(`Failed to delete chapter: ${chapterError.message}`);

  const { error: bookError } = await supabase
    .from("books")
    .update({ updated_at: now })
    .eq("id", bookId)
    .eq("user_id", userId);

  if (bookError) throw new Error(`Failed to refresh manuscript metadata: ${bookError.message}`);
}

export async function reorderChapters(userId: string, bookId: string, chapterIds: string[]): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const results = await Promise.all(
    chapterIds.map((id, i) =>
      supabase
        .from("chapters")
        .update({ number: i + 1, updated_at: now })
        .eq("id", id)
        .eq("book_id", bookId)
        .eq("user_id", userId)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(`Failed to reorder chapters: ${failed.error.message}`);
  }
}
