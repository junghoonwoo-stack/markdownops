import type { NotionBlock, NotionRichText } from "./types.js";

function rt(content: string): NotionRichText[] {
  // Notion limits a single rich_text segment to 2000 characters.
  if (content.length <= 2000) {
    return [{ type: "text", text: { content } }];
  }
  const out: NotionRichText[] = [];
  for (let i = 0; i < content.length; i += 2000) {
    out.push({ type: "text", text: { content: content.slice(i, i + 2000) } });
  }
  return out;
}

/**
 * Convert a Markdown body into Notion blocks. Recognizes:
 *   - "# ", "## ", "### " headings
 *   - "- " bulleted list items
 *   - "1. " (and any digit prefix) numbered list items
 *   - Everything else as a paragraph
 *
 * Tables and fenced code blocks become paragraphs in v1.
 */
export function markdownToBlocks(md: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const lines = md.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (line === "") continue;

    const h1 = line.match(/^# (.+)$/);
    if (h1) {
      blocks.push({ type: "heading_1", heading_1: { rich_text: rt(h1[1]) } });
      continue;
    }
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      blocks.push({ type: "heading_2", heading_2: { rich_text: rt(h2[1]) } });
      continue;
    }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      blocks.push({ type: "heading_3", heading_3: { rich_text: rt(h3[1]) } });
      continue;
    }
    const bullet = line.match(/^[-*] (.+)$/);
    if (bullet) {
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: rt(bullet[1]) },
      });
      continue;
    }
    const numbered = line.match(/^\d+\. (.+)$/);
    if (numbered) {
      blocks.push({
        type: "numbered_list_item",
        numbered_list_item: { rich_text: rt(numbered[1]) },
      });
      continue;
    }
    blocks.push({ type: "paragraph", paragraph: { rich_text: rt(line) } });
  }
  return blocks;
}

function plainTextOf(rt: NotionRichText[] | undefined): string {
  if (!rt) return "";
  return rt.map((t) => t.plain_text ?? t.text?.content ?? "").join("");
}

/** Reverse of markdownToBlocks. Lossy for non-recognized block types. */
export function blocksToMarkdown(blocks: NotionBlock[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    const t = b.type;
    const data = (b as Record<string, { rich_text?: NotionRichText[] }>)[t];
    const text = plainTextOf(data?.rich_text);
    if (t === "heading_1") out.push(`# ${text}`);
    else if (t === "heading_2") out.push(`## ${text}`);
    else if (t === "heading_3") out.push(`### ${text}`);
    else if (t === "bulleted_list_item") out.push(`- ${text}`);
    else if (t === "numbered_list_item") out.push(`1. ${text}`);
    else if (t === "paragraph") out.push(text);
    else if (text) out.push(text);
  }
  return out.join("\n\n");
}
