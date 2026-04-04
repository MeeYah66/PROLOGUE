import DOMPurify from "isomorphic-dompurify";
import type { Config as DOMPurifyConfig } from "dompurify";

type SafeBlockType = "paragraph" | "heading" | "blockquote" | "unordered-list" | "ordered-list";

export interface SafeContentBlock {
  type: SafeBlockType;
  text?: string;
  level?: 1 | 2 | 3;
  items?: string[];
}

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
];

const STRICT_SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: ALLOWED_TAGS,
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "svg", "math"],
  FORBID_ATTR: ["style", "class", "id"],
  KEEP_CONTENT: true,
};

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

function fallbackText(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

export function sanitizeChapterHtml(input: string): string {
  const dirty = input?.trim() ?? "";
  if (!dirty) return "<p></p>";

  const sanitized = DOMPurify.sanitize(dirty, STRICT_SANITIZE_CONFIG);
  const safe = typeof sanitized === "string" ? sanitized.trim() : String(sanitized ?? "").trim();
  return safe || "<p></p>";
}

function parseNodeText(node: Element): string {
  return cleanText(node.textContent ?? "");
}

export function htmlToSafeBlocks(input: string): SafeContentBlock[] {
  const sanitized = sanitizeChapterHtml(input);

  if (typeof window === "undefined") {
    const text = cleanText(fallbackText(sanitized));
    return text ? [{ type: "paragraph", text }] : [{ type: "paragraph", text: "" }];
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(`<article>${sanitized}</article>`, "text/html");
  const root = doc.querySelector("article");
  if (!root) return [{ type: "paragraph", text: "" }];

  const blocks: SafeContentBlock[] = [];
  const children = Array.from(root.children);

  for (const node of children) {
    const tag = node.tagName.toLowerCase();

    if (tag === "p") {
      blocks.push({ type: "paragraph", text: parseNodeText(node) });
      continue;
    }

    if (tag === "blockquote") {
      blocks.push({ type: "blockquote", text: parseNodeText(node) });
      continue;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const level = Number(tag.slice(1)) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, text: parseNodeText(node) });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll(":scope > li"))
        .map((li) => parseNodeText(li))
        .filter(Boolean);
      blocks.push({
        type: tag === "ol" ? "ordered-list" : "unordered-list",
        items: items.length > 0 ? items : [""],
      });
      continue;
    }

    const fallback = parseNodeText(node);
    if (fallback) blocks.push({ type: "paragraph", text: fallback });
  }

  if (blocks.length === 0) {
    const text = cleanText(doc.body.textContent ?? "");
    blocks.push({ type: "paragraph", text });
  }

  return blocks;
}

export function safeBlocksToHtml(blocks: SafeContentBlock[]): string {
  if (blocks.length === 0) return "<p></p>";

  const html = blocks
    .map((block) => {
      if (block.type === "heading") {
        const level = block.level ?? 2;
        return `<h${level}>${escapeHtml(block.text ?? "")}</h${level}>`;
      }
      if (block.type === "blockquote") {
        return `<blockquote><p>${escapeHtml(block.text ?? "")}</p></blockquote>`;
      }
      if (block.type === "unordered-list") {
        const items = (block.items ?? [""]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (block.type === "ordered-list") {
        const items = (block.items ?? [""]).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `<ol>${items}</ol>`;
      }
      return `<p>${escapeHtml(block.text ?? "")}</p>`;
    })
    .join("");

  return html || "<p></p>";
}
