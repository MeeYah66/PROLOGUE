-- ============================================================
-- Prologue — Supabase SQL Schema
-- Copy-paste this entire file into the Supabase SQL editor.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
-- uuid-ossp is available by default in Supabase; pgcrypto as fallback
-- crypto.randomUUID() is used from the client, so no server-side UUID gen needed.

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.books (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  subtitle                TEXT,
  genre                   TEXT NOT NULL DEFAULT '',
  blurb                   TEXT NOT NULL DEFAULT '',
  author_name             TEXT NOT NULL DEFAULT '',
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed')),
  target_word_count       INTEGER NOT NULL DEFAULT 80000,
  cover                   JSONB NOT NULL DEFAULT '{"style":"minimal","titleColor":"#1a1a1a","authorColor":"#6b6b6b","alignment":"left","backgroundColor":"#f0ece6","overlayOpacity":0.5}'::jsonb,
  last_edited_chapter_id  UUID,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number      INTEGER NOT NULL DEFAULT 1,
  title       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'revised', 'final')),
  word_count  INTEGER NOT NULL DEFAULT 0,
  summary     TEXT,
  pov         TEXT,
  scene       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     UUID NOT NULL UNIQUE REFERENCES public.books(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arc         TEXT NOT NULL DEFAULT '',
  timeline    TEXT NOT NULL DEFAULT '',
  characters  JSONB NOT NULL DEFAULT '[]'::jsonb,
  world_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_books_user_id         ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_updated_at      ON public.books(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id      ON public.chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_id      ON public.chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_book_notes_book_id    ON public.book_notes(book_id);
CREATE INDEX IF NOT EXISTS idx_book_notes_user_id    ON public.book_notes(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.books       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_notes  ENABLE ROW LEVEL SECURITY;

-- books policies
DROP POLICY IF EXISTS "Users can view their own books"   ON public.books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.books;

CREATE POLICY "Users can view their own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- chapters policies
DROP POLICY IF EXISTS "Users can view their own chapters"   ON public.chapters;
DROP POLICY IF EXISTS "Users can insert their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can update their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can delete their own chapters" ON public.chapters;

CREATE POLICY "Users can view their own chapters"
  ON public.chapters FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = chapters.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = chapters.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own chapters"
  ON public.chapters FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = chapters.book_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = chapters.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own chapters"
  ON public.chapters FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = chapters.book_id
        AND b.user_id = auth.uid()
    )
  );

-- book_notes policies
DROP POLICY IF EXISTS "Users can view their own book notes"   ON public.book_notes;
DROP POLICY IF EXISTS "Users can insert their own book notes" ON public.book_notes;
DROP POLICY IF EXISTS "Users can update their own book notes" ON public.book_notes;
DROP POLICY IF EXISTS "Users can delete their own book notes" ON public.book_notes;

CREATE POLICY "Users can view their own book notes"
  ON public.book_notes FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_notes.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own book notes"
  ON public.book_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_notes.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own book notes"
  ON public.book_notes FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_notes.book_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_notes.book_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own book notes"
  ON public.book_notes FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_notes.book_id
        AND b.user_id = auth.uid()
    )
  );

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_set_updated_at      ON public.books;
DROP TRIGGER IF EXISTS chapters_set_updated_at   ON public.chapters;
DROP TRIGGER IF EXISTS book_notes_set_updated_at ON public.book_notes;

CREATE TRIGGER books_set_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER chapters_set_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER book_notes_set_updated_at
  BEFORE UPDATE ON public.book_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this separately in the Supabase Dashboard > Storage, or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to manage their own covers
-- Path pattern: {user_id}/{book_id}/cover.{ext}

DROP POLICY IF EXISTS "Authenticated users can upload covers"       ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their covers" ON storage.objects;
DROP POLICY IF EXISTS "Public can read cover images"                ON storage.objects;

CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update their covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete their covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can read cover images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');
