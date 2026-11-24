/*
 * The agent docs' Markdown, read for a person: the files `@skryensya/ai-compiler` renders from the
 * contracts use a small, fixed subset (headings, paragraphs, `-` lists, `|` tables, fenced code,
 * `code` and **bold**), so the site reads that subset into blocks and draws each with the kit's own
 * table and the site's code block, instead of pulling in a general Markdown renderer.
 * shortcut: no links, nesting or emphasis besides **bold**; widen it when the generator emits more.
 */

export type MarkdownBlock =
  | { readonly kind: "heading"; readonly level: number; readonly text: string; readonly id: string }
  | { readonly kind: "paragraph"; readonly text: string }
  | { readonly kind: "quote"; readonly text: string }
  | { readonly kind: "list"; readonly items: readonly string[] }
  | { readonly kind: "table"; readonly head: readonly string[]; readonly rows: readonly (readonly string[])[] }
  | { readonly kind: "code"; readonly lang: string; readonly code: string };

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* A table row's cells: split on `|` the generator did not escape, then unescape. */
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const start = ++i;
      while (i < lines.length && !lines[i]!.startsWith("```")) i++;
      blocks.push({ kind: "code", lang: fence[1] ?? "", code: lines.slice(start, i).join("\n") });
      i++;
      continue;
    }
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1]!.length, text: heading[2]!, id: slug(heading[2]!) });
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.startsWith("|")) rows.push(cells(lines[i++]!));
      const [head = [], , ...body] = rows;
      blocks.push({ kind: "table", head, rows: body });
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("- ")) items.push(lines[i++]!.slice(2));
      blocks.push({ kind: "list", items });
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push({ kind: "quote", text: line.slice(2) });
      i++;
      continue;
    }
    if (line.trim()) {
      const text: string[] = [];
      while (i < lines.length && lines[i]!.trim() && !/^(```|#{1,6} |\||- |> )/.test(lines[i]!)) text.push(lines[i++]!);
      blocks.push({ kind: "paragraph", text: text.join(" ") });
      continue;
    }
    i++;
  }
  return blocks;
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** One line of inline Markdown as HTML: `code` and **bold**, everything else escaped. */
export function inlineHtml(text: string): string {
  return text
    .split(/(`[^`]+`)/)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 1
        ? `<code>${escape(part.slice(1, -1))}</code>`
        : escape(part).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
    )
    .join("");
}

/** A paragraph that is nothing but bold ("**Use when**") is a label over what follows: a heading to a reader. */
export const boldLabel = (text: string): string | undefined => /^\*\*([^*]+)\*\*$/.exec(text.trim())?.[1];
