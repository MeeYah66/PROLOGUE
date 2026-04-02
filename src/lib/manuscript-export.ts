import type { Book, Chapter } from "@/lib/types";

const CHAPTER_BLOCK_SELECTOR =
  "article p, article h1, article h2, article h3, article h4, article h5, article h6, article blockquote, article li";

function fallbackStripHtml(input: string): string {
  return input
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function htmlBlocks(input: string): string[] {
  if (typeof window === "undefined") {
    const fallback = fallbackStripHtml(input);
    return fallback ? fallback.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean) : [];
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(`<article>${input}</article>`, "text/html");
  const nodes = Array.from(doc.querySelectorAll(CHAPTER_BLOCK_SELECTOR));
  const blocks = nodes
    .map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (blocks.length > 0) return blocks;

  const fallback = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
  return fallback ? [fallback] : [];
}

function toPlainText(chapter: Chapter): string {
  const blocks = htmlBlocks(chapter.content);
  return blocks.join("\n\n");
}

function chapterList(book: Book): Chapter[] {
  return [...book.chapters].sort((a, b) => a.number - b.number);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chapterToHtml(chapter: Chapter): string {
  const blocks = htmlBlocks(chapter.content);
  if (blocks.length === 0) {
    return "<p>&nbsp;</p>";
  }

  return blocks.map((block) => `<p>${escapeHtml(block)}</p>`).join("\n");
}

export function manuscriptWordCount(book: Book): number {
  return chapterList(book).reduce((sum, chapter) => sum + chapter.wordCount, 0);
}

export function manuscriptFileName(book: Book): string {
  const base = (book.title || "manuscript")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "manuscript";
}

export function manuscriptToPlainText(book: Book): string {
  const lines: string[] = [];

  lines.push(book.title);
  if (book.subtitle) lines.push(book.subtitle);
  lines.push(`By ${book.authorName}`);
  lines.push("");

  for (const chapter of chapterList(book)) {
    lines.push(`CHAPTER ${chapter.number}: ${chapter.title}`);
    lines.push("");
    lines.push(toPlainText(chapter));
    lines.push("");
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function manuscriptToWordHtml(book: Book): string {
  const chapterHtml = chapterList(book)
    .map((chapter) => {
      return `
        <section style="margin: 0 0 46px 0;">
          <p style="margin: 0 0 8px 0; font-size: 10pt; letter-spacing: 0.1em; text-transform: uppercase; color: #7a5c14;">
            Chapter ${chapter.number}
          </p>
          <h2 style="margin: 0 0 16px 0; font-size: 20pt; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a;">
            ${escapeHtml(chapter.title)}
          </h2>
          <div style="font-size: 12pt; line-height: 1.7; color: #2d2d2d;">
            ${chapterToHtml(chapter)}
          </div>
        </section>
      `.trim();
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(book.title)}</title>
  </head>
  <body style="margin: 48px; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a;">
    <header style="margin-bottom: 42px;">
      <h1 style="margin: 0; font-size: 28pt;">${escapeHtml(book.title)}</h1>
      ${book.subtitle ? `<p style="margin: 8px 0 0 0; font-size: 13pt; font-style: italic; color: #5f5f5f;">${escapeHtml(book.subtitle)}</p>` : ""}
      <p style="margin: 14px 0 0 0; font-size: 11pt; color: #555;">${escapeHtml(book.authorName)}</p>
    </header>
    ${chapterHtml}
  </body>
</html>
`.trim();
}

export function manuscriptToPrintHtml(book: Book): string {
  const chapterHtml = chapterList(book)
    .map((chapter) => {
      return `
        <section class="chapter">
          <p class="chapter-label">Chapter ${chapter.number}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          <div class="chapter-body">
            ${chapterToHtml(chapter)}
          </div>
        </section>
      `.trim();
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(book.title)} - Print</title>
    <style>
      @page { size: A4; margin: 22mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #1a1a1a;
        background: #f8f6f2;
        font-family: Georgia, "Times New Roman", serif;
      }
      main {
        max-width: 780px;
        margin: 0 auto;
        background: #ffffff;
        min-height: 100vh;
        padding: 56px;
      }
      h1 {
        margin: 0;
        font-size: 40px;
        line-height: 1.1;
      }
      .subtitle {
        margin: 10px 0 0;
        font-size: 20px;
        color: #545454;
        font-style: italic;
      }
      .author {
        margin: 18px 0 42px;
        font-size: 16px;
        color: #444;
      }
      .chapter {
        page-break-inside: avoid;
        margin-bottom: 52px;
      }
      .chapter-label {
        margin: 0 0 10px;
        font-family: Inter, system-ui, sans-serif;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #7a5c14;
      }
      h2 {
        margin: 0 0 18px;
        font-size: 30px;
        line-height: 1.2;
      }
      .chapter-body p {
        margin: 0 0 16px;
        font-size: 16px;
        line-height: 1.85;
      }
      @media print {
        body { background: #fff; }
        main { padding: 0; max-width: none; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(book.title)}</h1>
        ${book.subtitle ? `<p class="subtitle">${escapeHtml(book.subtitle)}</p>` : ""}
        <p class="author">${escapeHtml(book.authorName)}</p>
      </header>
      ${chapterHtml}
    </main>
  </body>
</html>
`.trim();
}

