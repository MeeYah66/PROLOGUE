import { NextResponse } from "next/server";
import { createRequire } from "node:module";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
type PdfParseFunction = (
  buffer: Buffer,
  options?: Record<string, unknown>
) => Promise<{ text: string; numpages: number }>;

type PdfjsTextItem = { str?: string };
type Pdf2JsonParser = new (
  context?: unknown,
  needRawText?: boolean,
  password?: string
) => {
  on: (
    event: "pdfParser_dataError" | "pdfParser_dataReady",
    handler: (payload: unknown) => void
  ) => void;
  parseBuffer: (buffer: Buffer, verbosity?: number) => void;
  destroy?: () => void;
};

type Pdf2JsonOutput = {
  Pages?: Array<{
    Texts?: Array<{
      x?: number;
      y?: number;
      R?: Array<{ T?: string }>;
    }>;
  }>;
};

function normalizeExtractedText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function decodePdfToken(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
}

async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  const pdfParse = require("pdf-parse") as PdfParseFunction;
  const result = await pdfParse(buffer);
  return normalizeExtractedText(result.text ?? "");
}

async function extractWithPdfJs(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    stopAtErrors: false,
    disableFontFace: true,
  });

  try {
    const pdf = await loadingTask.promise;
    const pageChunks: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const items = textContent.items as PdfjsTextItem[];
      const pageText = items
        .map((item) => (typeof item.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) pageChunks.push(pageText);
    }

    return normalizeExtractedText(pageChunks.join("\n\n"));
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }
}

async function extractWithPdf2Json(buffer: Buffer): Promise<string> {
  const PDFParser = require("pdf2json") as Pdf2JsonParser;

  const parsed = await new Promise<Pdf2JsonOutput>((resolve, reject) => {
    const parser = new PDFParser(null, true);

    parser.on("pdfParser_dataError", (payload) => {
      parser.destroy?.();
      if (
        payload &&
        typeof payload === "object" &&
        "parserError" in payload &&
        payload.parserError instanceof Error
      ) {
        reject(payload.parserError);
        return;
      }
      reject(new Error("pdf2json could not parse this PDF."));
    });

    parser.on("pdfParser_dataReady", (payload) => {
      parser.destroy?.();
      resolve(payload as Pdf2JsonOutput);
    });

    parser.parseBuffer(buffer);
  });

  const pages = parsed.Pages ?? [];
  if (pages.length === 0) return "";

  const allPages = pages.map((page) => {
    const textBlocks = [...(page.Texts ?? [])].sort((a, b) => {
      const yA = a.y ?? 0;
      const yB = b.y ?? 0;
      if (Math.abs(yA - yB) > 0.2) return yA - yB;
      return (a.x ?? 0) - (b.x ?? 0);
    });

    const rows = new Map<number, string[]>();

    for (const block of textBlocks) {
      const raw = (block.R ?? [])
        .map((run) => decodePdfToken(run.T ?? ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!raw) continue;

      const rowKey = Math.round((block.y ?? 0) * 5) / 5;
      const row = rows.get(rowKey) ?? [];
      row.push(raw);
      rows.set(rowKey, row);
    }

    return [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, fragments]) => fragments.join(" ").trim())
      .filter(Boolean)
      .join("\n");
  });

  return normalizeExtractedText(allPages.join("\n\n"));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF file was provided." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    const isPdf = mime === "application/pdf" || fileName.endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported by this endpoint." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    const parserErrors: string[] = [];

    try {
      text = await extractWithPdfJs(buffer);
    } catch (error) {
      parserErrors.push(
        `PDF.js: ${
          error instanceof Error ? error.message : "Primary parser failed."
        }`
      );
    }

    if (!text) {
      try {
        text = await extractWithPdfParse(buffer);
      } catch (error) {
        parserErrors.push(
          `pdf-parse: ${
            error instanceof Error ? error.message : "Fallback parser failed."
          }`
        );
      }
    }

    if (!text) {
      try {
        text = await extractWithPdf2Json(buffer);
      } catch (error) {
        parserErrors.push(
          `pdf2json: ${
            error instanceof Error ? error.message : "Fallback parser failed."
          }`
        );
      }
    }

    if (!text) {
      const detail = parserErrors[0];
      return NextResponse.json(
        {
          error: detail
            ? `We could not detect readable text in this PDF. ${detail}`
            : "We could not detect readable text in this PDF. If it contains scanned pages/images, run OCR and export as searchable PDF, .docx, or .txt.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while parsing PDF.";

    return NextResponse.json(
      {
        error:
          message ||
          "We could not process that PDF right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
