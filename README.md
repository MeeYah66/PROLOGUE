# Prologue

A writing workspace for authors. Draft a book chapter by chapter, give it a cover, then export it or share a preview with readers.

**Live:** https://prologue-self.vercel.app

## What it does

- **Library.** Every manuscript in one place, with a dashboard to start a new one or pick up where you left off.
- **Chapter editor.** A rich-text editor with a chapter sidebar, an outline view and notes for each book.
- **Import.** Bring in an existing manuscript from a `.docx`, `.pdf` or `.txt` file.
- **Covers.** Upload a cover image (JPEG, PNG or WebP) for each book.
- **Preview and export.** Read the book as a reader would, then save it as a PDF, a Word-compatible `.doc`, or plain text, print it, or create a public preview link.
- **Writing habits.** An optional daily word goal and a choice of editor text size.
- **Ambient sound.** Rain, café, forest and fireplace, generated in the browser with the Web Audio API, plus a lo-fi stream.
- **Accounts.** Email sign-up with verification, light and dark themes, and sanitised input on everything users paste or import.

## Built with

Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Tiptap (editor), Supabase (auth, Postgres and storage), mammoth and pdf.js (import), DOMPurify.

## Run it locally

1. Install dependencies.
   ```bash
   npm install
   ```
2. Create a Supabase project. Run [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql) in its SQL editor, then add a public storage bucket named `covers`.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL and anon key.
4. Start the dev server.
   ```bash
   npm run dev
   ```

## Author

Designed and built by Islamiyat Badrudeen.
