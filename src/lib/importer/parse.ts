import { countWords } from "@/lib/utils";

export type ImportFileType = "docx" | "txt" | "pdf";

export interface ParsedChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface ParsedManuscript {
  title: string;
  chapters: ParsedChapter[];
  headings: string[];
  sourceType: ImportFileType;
  totalWords: number;
}

const CHAPTER_HEADING_PATTERN =
  /^(chapter|chap\.?|part|book|prologue|epilogue)\s+([a-z0-9ivxlcdm\-: ]+)?$/i;
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(value: string): string {
  const normalized = normalizeNewlines(value).trim();
  if (!normalized) return "<p></p>";

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "<p></p>";

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function htmlToPlainText(value: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");
  return cleanText(doc.body.textContent ?? "");
}

function buildChapter(title: string, content: string): ParsedChapter {
  return {
    id: makeId(),
    title: cleanText(title) || "Untitled Section",
    content: content.trim() || "<p></p>",
    wordCount: countWords(content),
  };
}

function supportedByMime(file: File): ImportFileType | null {
  const mime = file.type.toLowerCase();
  if (
    mime.includes("wordprocessingml.document") ||
    mime.includes("application/msword")
  ) {
    return "docx";
  }
  if (mime === "text/plain") return "txt";
  if (mime === "application/pdf") return "pdf";
  return null;
}

export function getImportFileType(file: File): ImportFileType | null {
  const byMime = supportedByMime(file);
  if (byMime) return byMime;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "docx") return "docx";
  if (extension === "txt") return "txt";
  if (extension === "pdf") return "pdf";
  return null;
}

function looksLikeChapterBoundary(line: string): boolean {
  const text = cleanText(line);
  if (!text) return false;

  if (CHAPTER_HEADING_PATTERN.test(text)) return true;
  if (MARKDOWN_HEADING_PATTERN.test(text)) return true;

  const isUpperHeading =
    text.length <= 70 &&
    text === text.toUpperCase() &&
    /[A-Z]/.test(text) &&
    !/[.!?]/.test(text);

  return isUpperHeading;
}

function normalizeHeading(line: string): string {
  const withoutMarkdown = line.replace(MARKDOWN_HEADING_PATTERN, "");
  return cleanText(withoutMarkdown);
}

function detectTitleFromLines(lines: string[]): string | null {
  const firstMeaningful = lines.find((line) => cleanText(line).length > 0);
  if (!firstMeaningful) return null;

  const candidate = cleanText(firstMeaningful);
  if (!candidate) return null;
  if (candidate.length > 90) return null;
  if (looksLikeChapterBoundary(candidate)) return null;
  return candidate;
}

function chunkLongSingleChapter(chapter: ParsedChapter): ParsedChapter[] {
  if (chapter.wordCount < 2600) return [chapter];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<article>${chapter.content}</article>`, "text/html");
  const paragraphs = Array.from(doc.querySelectorAll("p"))
    .map((paragraph) => cleanText(paragraph.textContent ?? ""))
    .filter(Boolean);

  if (paragraphs.length < 6) return [chapter];

  const chunks: ParsedChapter[] = [];
  let current: string[] = [];
  let currentWords = 0;
  let index = 1;

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);
    current.push(paragraph);
    currentWords += paragraphWords;

    if (currentWords >= 1700) {
      chunks.push(
        buildChapter(`${chapter.title} - Part ${index}`, textToHtml(current.join("\n\n")))
      );
      index += 1;
      current = [];
      currentWords = 0;
    }
  }

  if (current.length > 0) {
    chunks.push(
      buildChapter(
        index === 1 ? chapter.title : `${chapter.title} - Part ${index}`,
        textToHtml(current.join("\n\n"))
      )
    );
  }

  return chunks.length > 1 ? chunks : [chapter];
}

function parseStructuredText(
  text: string,
  fallbackTitle = "Imported Manuscript"
): Pick<ParsedManuscript, "title" | "chapters" | "headings"> {
  const normalized = normalizeNewlines(text);
  const lines = normalized.split("\n");
  const title = detectTitleFromLines(lines) ?? fallbackTitle;

  const chapters: { title: string; lines: string[] }[] = [];
  const headings: string[] = [];

  let currentTitle = "Chapter 1";
  let currentLines: string[] = [];
  let consumedTitle = false;

  for (const rawLine of lines) {
    const line = rawLine ?? "";
    const trimmed = cleanText(line);

    if (!consumedTitle && trimmed && trimmed === title) {
      consumedTitle = true;
      continue;
    }

    if (trimmed && looksLikeChapterBoundary(trimmed)) {
      if (currentLines.join("").trim().length > 0) {
        chapters.push({ title: currentTitle, lines: currentLines });
      }
      currentTitle = normalizeHeading(trimmed) || `Chapter ${chapters.length + 1}`;
      headings.push(currentTitle);
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  if (currentLines.join("").trim().length > 0) {
    chapters.push({ title: currentTitle, lines: currentLines });
  }

  if (chapters.length === 0) {
    chapters.push({
      title: "Chapter 1",
      lines: [normalized],
    });
  }

  const parsedChapters = chapters
    .map((chapter, index) =>
      buildChapter(chapter.title || `Chapter ${index + 1}`, textToHtml(chapter.lines.join("\n")))
    )
    .flatMap((chapter) => chunkLongSingleChapter(chapter));

  return {
    title,
    headings,
    chapters: parsedChapters,
  };
}

function parseStructuredHtml(
  html: string,
  fallbackTitle = "Imported Manuscript"
): Pick<ParsedManuscript, "title" | "chapters" | "headings"> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<article>${html}</article>`, "text/html");
  const container = doc.querySelector("article");

  if (!container) {
    return parseStructuredText(htmlToPlainText(html), fallbackTitle);
  }

  const nodes = Array.from(container.childNodes);
  if (nodes.length === 0) {
    return parseStructuredText(htmlToPlainText(html), fallbackTitle);
  }

  let manuscriptTitle = fallbackTitle;
  let titleCaptured = false;

  const headings: string[] = [];
  const chapters: { title: string; chunks: string[] }[] = [];

  let currentTitle = "Chapter 1";
  let currentChunks: string[] = [];

  const pushCurrent = () => {
    const body = currentChunks.join("").trim();
    if (!body) return;
    chapters.push({ title: currentTitle, chunks: [...currentChunks] });
    currentChunks = [];
  };

  for (const node of nodes) {
    const isElement = node.nodeType === Node.ELEMENT_NODE;
    const element = isElement ? (node as HTMLElement) : null;
    const tag = element?.tagName.toLowerCase() ?? "";
    const headingText = element ? cleanText(element.textContent ?? "") : "";
    const isHeadingTag = /^h[1-6]$/.test(tag);

    if (isHeadingTag && headingText) {
      headings.push(headingText);

      if (!titleCaptured && tag === "h1" && !looksLikeChapterBoundary(headingText)) {
        manuscriptTitle = headingText;
        titleCaptured = true;
        continue;
      }

      const isBoundary =
        looksLikeChapterBoundary(headingText) ||
        (tag === "h2" && currentChunks.length > 0);

      if (isBoundary) {
        pushCurrent();
        currentTitle = normalizeHeading(headingText) || `Chapter ${chapters.length + 1}`;
        continue;
      }
    }

    if (element) {
      currentChunks.push(element.outerHTML);
    } else {
      const text = cleanText(node.textContent ?? "");
      if (text) currentChunks.push(`<p>${escapeHtml(text)}</p>`);
    }
  }

  pushCurrent();

  if (chapters.length === 0) {
    return parseStructuredText(htmlToPlainText(html), manuscriptTitle);
  }

  const parsedChapters = chapters.map((chapter, index) =>
    buildChapter(chapter.title || `Chapter ${index + 1}`, chapter.chunks.join(""))
  );

  return {
    title: manuscriptTitle,
    headings,
    chapters: parsedChapters,
  };
}

async function parseDocx(file: File): Promise<ParsedManuscript> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();

  const [{ value: html }, { value: text }] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ]);

  const parsed =
    html && cleanText(html).length > 0
      ? parseStructuredHtml(html, "Imported Manuscript")
      : parseStructuredText(text, "Imported Manuscript");

  const totalWords = parsed.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);

  return {
    sourceType: "docx",
    title: parsed.title,
    headings: parsed.headings,
    chapters: parsed.chapters,
    totalWords,
  };
}

async function parseTxt(file: File): Promise<ParsedManuscript> {
  const text = await file.text();
  const parsed = parseStructuredText(text, "Imported Manuscript");
  const totalWords = parsed.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);

  return {
    sourceType: "txt",
    title: parsed.title,
    headings: parsed.headings,
    chapters: parsed.chapters,
    totalWords,
  };
}

async function parsePdf(file: File): Promise<ParsedManuscript> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/import/parse-pdf", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { text?: string; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error ??
        "We could not read that PDF. Try exporting it as .docx or .txt."
    );
  }

  const extractedText = (payload?.text ?? "").trim();
  if (!extractedText) {
    throw new Error(
      "We could not extract readable text from this PDF. Try .docx for best results."
    );
  }

  const parsed = parseStructuredText(extractedText, "Imported Manuscript");
  const totalWords = parsed.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);

  return {
    sourceType: "pdf",
    title: parsed.title,
    headings: parsed.headings,
    chapters: parsed.chapters,
    totalWords,
  };
}

export async function parseManuscriptFile(file: File): Promise<ParsedManuscript> {
  const fileType = getImportFileType(file);

  if (!fileType) {
    throw new Error(
      "This file type is not supported yet. Please upload a .docx, .txt, or .pdf manuscript."
    );
  }

  if (fileType === "docx") return parseDocx(file);
  if (fileType === "txt") return parseTxt(file);
  return parsePdf(file);
}
