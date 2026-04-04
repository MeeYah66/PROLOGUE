import { countWords } from "@/lib/utils";
import {
  htmlToSafeBlocks,
  safeBlocksToHtml,
} from "@/lib/sanitization/chapter-content";

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

type PdfJsTextItem = { str?: string };
type PdfJsTextContent = { items: PdfJsTextItem[] };
type PdfJsPage = { getTextContent: () => Promise<PdfJsTextContent> };
type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};
type PdfJsLoadingTask = {
  promise: Promise<PdfJsDocument>;
  destroy: () => Promise<void>;
};
type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (options: Record<string, unknown>) => PdfJsLoadingTask;
};

const CHAPTER_HEADING_PATTERN =
  /^(chapter|chap\.?|part|book|prologue|epilogue)\s+([a-z0-9ivxlcdm\-: ]+)?$/i;
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+/;
const SERVER_PDF_SIZE_HINT_BYTES = 4 * 1024 * 1024;
const MAX_IMPORT_FILE_BYTES = 20 * 1024 * 1024;
const MAX_IMPORT_CHAPTERS = 400;
const MAX_IMPORT_WORDS = 1_500_000;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeExtractedPdfText(value: string): string {
  return normalizeNewlines(value)
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
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
  const safeContent = safeBlocksToHtml(htmlToSafeBlocks(content));
  return {
    id: makeId(),
    title: cleanText(title) || "Untitled Section",
    content: safeContent,
    wordCount: countWords(safeContent),
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
  async function parsePdfInBrowser(): Promise<string> {
    const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as PdfJsModule;

    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      const version = pdfjs.version ?? "4.10.38";
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: true,
      isEvalSupported: false,
      stopAtErrors: false,
      disableFontFace: false,
      disableWorker: false,
    });

    try {
      const pdf = await loadingTask.promise;
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (typeof item.str === "string" ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (pageText) pages.push(pageText);
      }

      return normalizeExtractedPdfText(pages.join("\n\n"));
    } finally {
      await loadingTask.destroy().catch(() => undefined);
    }
  }

  async function parsePdfViaApi(): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/import/parse-pdf", {
      method: "POST",
      body: formData,
    });

    const raw = await response.text();
    const payload = (() => {
      try {
        return raw ? (JSON.parse(raw) as { text?: string; error?: string }) : null;
      } catch {
        return null;
      }
    })();

    if (!response.ok) {
      const detail =
        payload?.error ||
        (raw && raw.length < 220 ? raw : "") ||
        `PDF parse request failed (${response.status}).`;
      throw new Error(detail);
    }

    return normalizeExtractedPdfText(payload?.text ?? "");
  }

  let extractedText = "";
  const parserErrors: string[] = [];
  const prefersBrowserParsing = file.size > SERVER_PDF_SIZE_HINT_BYTES;

  if (prefersBrowserParsing) {
    try {
      extractedText = await parsePdfInBrowser();
    } catch (error) {
      parserErrors.push(
        `Browser parser: ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  if (!extractedText) {
    try {
      extractedText = await parsePdfViaApi();
    } catch (error) {
      parserErrors.push(
        `Server parser: ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  if (!extractedText && !prefersBrowserParsing) {
    try {
      extractedText = await parsePdfInBrowser();
    } catch (error) {
      parserErrors.push(
        `Browser parser: ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  if (!extractedText) {
    throw new Error(
      parserErrors[0] ||
        "We could not read that PDF. If it is image-based, export with OCR enabled or use .docx/.txt."
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

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error("File is too large. Please upload a file under 20 MB.");
  }
  const parsed =
    fileType === "docx" ? await parseDocx(file) :
    fileType === "txt" ? await parseTxt(file) :
    await parsePdf(file);

  if (parsed.chapters.length > MAX_IMPORT_CHAPTERS) {
    throw new Error(
      `This manuscript has too many sections (${parsed.chapters.length}). Keep it under ${MAX_IMPORT_CHAPTERS} chapters per import.`
    );
  }

  if (parsed.totalWords > MAX_IMPORT_WORDS) {
    throw new Error(
      `This manuscript is too large (${parsed.totalWords.toLocaleString()} words). Please split it into smaller imports.`
    );
  }

  return parsed;
}
