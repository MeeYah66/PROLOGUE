import { NextResponse } from "next/server";
import { createRequire } from "node:module";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
// pdf-parse exports a function directly: pdfParse(buffer) → { text, numpages, ... }
const pdfParse = require("pdf-parse") as (
  buffer: Buffer,
  options?: Record<string, unknown>
) => Promise<{ text: string; numpages: number }>;

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

    const result = await pdfParse(buffer);
    const text = (result.text ?? "").replace(/\u0000/g, "").trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "We could not extract readable text from this PDF. Try a text-based export or .docx version.",
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
