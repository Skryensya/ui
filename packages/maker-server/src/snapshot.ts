import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { parse } from "parse5";

/*
 * A SITE, READ FOR CLONING. The Maker's agent is asked to rebuild a page it can see on the web with the design system's own
 * components, so what it needs is what a person would describe: the sections in order, their headings and words, the
 * links and buttons, the images, the brand colour. Not the markup, which is what it must NOT copy.
 *
 * The page is fetched here, on the server, because a browser cannot read another site's HTML (CORS), and that makes this the
 * one place that can be talked into fetching something it should not: an address on the server's own network. So only public
 * http(s) addresses are fetched, every redirect is checked again, the answer is capped in size and time, and what comes back is
 * a summary (text), never the bytes. The page is NOT run: a site that draws itself with JavaScript shows up as the shell it
 * ships, and the result says so.
 */

export type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "button"; text: string }
  | { kind: "image"; alt: string; src: string }
  | { kind: "list"; items: string[] }
  | { kind: "form"; fields: string[] };

/** What a section is FOR, guessed from its tag, its words and its shape: how the page is organised, not how it is made. */
export type Role = "navigation" | "hero" | "logos" | "features" | "steps" | "pricing" | "testimonials" | "stats" | "faq" | "cta" | "contact" | "footer" | "content";

/** A repeated unit (a feature, a plan, a testimonial, a step): the same shape three or more times in a row. */
export type Item = { heading: string; text?: string; action?: string; href?: string; image?: string };

export type Section = { tag: string; role: Role; label?: string; blocks: Block[]; /** Present when the section is a repeated set of the same unit. */ items?: Item[] };

export type Snapshot = {
  url: string;
  title: string;
  description?: string;
  language?: string;
  themeColor?: string;
  /** The page as a map: the headings in order with their level, so the hierarchy survives. */
  outline: { level: number; text: string }[];
  /** The primary navigation (header/nav links, de-duplicated, in order) and the footer's links. */
  navigation: { primary: { text: string; href: string }[]; footer: { text: string; href: string }[] };
  /** The actions the page leads with: short button and link labels from the header and the first sections. */
  primaryActions: string[];
  /** The roles of the sections in order: the page's information architecture at a glance. */
  structure: Role[];
  siteName?: string;
  image?: string;
  sections: Section[];
  /** True when the page ships almost no text: it most likely draws itself with JavaScript, which is not run. */
  likelyScripted: boolean;
  truncated: boolean;
};

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 4;
const MAX_BLOCKS = 220;

export class SnapshotError extends Error {}

/** Addresses a public site never lives on: this machine, its network, link-local and cloud metadata ranges. */
export function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    if (a === "::1" || a === "::") return true;
    if (a.startsWith("fe80") || a.startsWith("fc") || a.startsWith("fd")) return true;
    const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateAddress(mapped[1]!) : false;
  }
  const [a, b] = address.split(".").map(Number) as [number, number];
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function assertPublic(target: URL): Promise<void> {
  if (target.protocol !== "http:" && target.protocol !== "https:") throw new SnapshotError("Only http and https addresses can be read.");
  if (target.username || target.password) throw new SnapshotError("Addresses with credentials are not read.");
  const host = target.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) throw new SnapshotError("That address is not public.");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => { throw new SnapshotError(`Could not find ${host}.`); })).map((entry) => entry.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new SnapshotError("That address is not public.");
}

async function fetchHtml(start: URL, fetcher: typeof fetch): Promise<{ url: URL; html: string; truncated: boolean }> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(current);
    const response = await fetcher(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0 (compatible; SkryensyaMaker/1.0; +clone-reader)" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new SnapshotError("The site redirected without saying where.");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new SnapshotError(`The site answered ${response.status}.`);
    const type = response.headers.get("content-type") ?? "";
    if (!/html|xml/.test(type)) throw new SnapshotError(`That address is not a web page (${type || "unknown type"}).`);
    const reader = response.body?.getReader();
    if (!reader) throw new SnapshotError("The site sent no content.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    let truncated = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { truncated = true; await reader.cancel(); break; }
      chunks.push(value);
    }
    return { url: current, html: new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks)), truncated };
  }
  throw new SnapshotError("The site redirected too many times.");
}

type Node = { nodeName: string; tagName?: string; value?: string; attrs?: { name: string; value: string }[]; childNodes?: Node[] };
const attr = (node: Node, name: string) => node.attrs?.find((entry) => entry.name === name)?.value;
const clean = (text: string, max = 280) => text.replace(/\s+/g, " ").trim().slice(0, max);

function textOf(node: Node): string {
  if (node.nodeName === "#text") return node.value ?? "";
  if (["script", "style", "noscript", "template", "svg"].includes(node.nodeName)) return "";
  return (node.childNodes ?? []).map(textOf).join(" ");
}

const SECTION_TAGS = new Set(["header", "nav", "main", "section", "article", "aside", "footer"]);
const SKIP = new Set(["script", "style", "noscript", "template", "head", "iframe", "svg", "canvas"]);


const ROLE_WORDS: [Role, RegExp][] = [
  ["pricing", /\b(pricing|plans?|per month|\/\s?mo|\/\s?month|billed|free trial|precios?|planes?)\b|[$€£]\s?\d/i],
  ["testimonials", /\b(testimonials?|what (our )?(customers|users|people) say|loved by|reviews?|opiniones|clientes dicen)\b|[“"].{20,}[”"]\s*[-\u2014\u2013]/i],
  ["faq", /\b(faq|frequently asked|questions|preguntas frecuentes)\b/i],
  ["steps", /\b(how it works|get started in|steps?|c[oó]mo funciona|paso)\b/i],
  ["stats", /\b\d[\d,.]*\s?(\+|%|k|m|x)\b.*\b\d[\d,.]*\s?(\+|%|k|m|x)\b/i],
  ["logos", /\b(trusted by|used by|as seen|partners?|customers include|conf[ií]an en)\b/i],
  ["contact", /\b(contact|get in touch|write to us|cont[aá]ct[ae]nos|newsletter|subscribe)\b/i],
  ["features", /\b(features?|benefits?|why |what you get|capabilities|caracter[ií]sticas|beneficios)\b/i],
];

/** Runs of heading + words (+ one action) repeated three or more times: cards, plans, quotes, steps. */
export function groupItems(blocks: Block[]): Item[] | undefined {
  /* The unit's heading level is the shallowest one that appears three or more times: the section's own title appears once. */
  const counts = new Map<number, number>();
  for (const block of blocks) if (block.kind === "heading") counts.set(block.level, (counts.get(block.level) ?? 0) + 1);
  const level = [...counts.entries()].filter(([, count]) => count >= 3).map(([lvl]) => lvl).sort((x, y) => x - y)[0];
  if (level === undefined) return undefined;
  const items: Item[] = [];
  for (let at = 0; at < blocks.length; at++) {
    const block = blocks[at]!;
    if (block.kind !== "heading" || block.level !== level) continue;
    const item: Item = { heading: block.text };
    for (let next = at + 1; next < blocks.length && blocks[next]!.kind !== "heading"; next++) {
      const follower = blocks[next]!;
      if (follower.kind === "text" && !item.text) item.text = follower.text;
      else if ((follower.kind === "link" || follower.kind === "button") && !item.action) { item.action = follower.text; if (follower.kind === "link") item.href = follower.href; }
      else if (follower.kind === "image" && !item.image) item.image = follower.src;
    }
    items.push(item);
  }
  return items.length <= 12 ? items : undefined;
}

export function roleOf(tag: string, blocks: Block[], index: number, total: number, items: Item[] | undefined): Role {
  if (tag === "nav" || tag === "header") return "navigation";
  if (tag === "footer") return "footer";
  const words = blocks.map((block) => ("text" in block ? block.text : block.kind === "list" ? block.items.join(" ") : block.kind === "form" ? block.fields.join(" ") : "")).join(" ");
  const heading = blocks.find((block) => block.kind === "heading");
  const actions = blocks.filter((block) => block.kind === "button" || block.kind === "link").length;
  const first = index <= 1 && heading && (heading as { level: number }).level === 1;
  if (first) return "hero";
  for (const [role, pattern] of ROLE_WORDS) if (pattern.test(words)) return role === "features" && !items ? "content" : role;
  if (items && items.length >= 3) return "features";
  if (index === total - 1 && actions > 0 && blocks.length <= 6) return "cta";
  if (blocks.length <= 5 && actions > 0 && heading && (heading as { level: number }).level <= 2) return "cta";
  return "content";
}

export function summarize(html: string, base: URL): Omit<Snapshot, "url" | "truncated"> {
  const document = parse(html) as unknown as Node;
  const meta: Record<string, string> = {};
  let title = "";
  let language: string | undefined;
  type Draft = Omit<Section, "role" | "items">;
  const sections: Draft[] = [];
  let current: Draft = { tag: "page", blocks: [] };
  let blocks = 0;
  let words = 0;
  const absolute = (value: string | undefined) => { try { return value ? new URL(value, base).href : ""; } catch { return ""; } };

  const push = (block: Block) => { if (blocks < MAX_BLOCKS) { current.blocks.push(block); blocks++; } };
  const open = (tag: string, label?: string) => {
    if (current.blocks.length > 0 || current.tag !== "page") sections.push(current);
    current = { tag, ...(label ? { label } : {}), blocks: [] };
  };

  const visit = (node: Node) => {
    const name = node.nodeName;
    if (name === "html") language = attr(node, "lang");
    if (name === "title") title = clean(textOf(node), 160);
    if (name === "meta") { const key = attr(node, "name") ?? attr(node, "property"); const content = attr(node, "content"); if (key && content) meta[key] = content; }
    if (SKIP.has(name) && name !== "head") return;
    if (SECTION_TAGS.has(name)) open(name, attr(node, "aria-label"));
    if (/^h[1-6]$/.test(name)) { const text = clean(textOf(node), 200); if (text) { push({ kind: "heading", level: Number(name[1]), text }); words += text.split(" ").length; } return; }
    if (name === "p" || name === "blockquote") { const text = clean(textOf(node)); if (text.length > 1) { push({ kind: "text", text }); words += text.split(" ").length; } return; }
    if (name === "a") { const text = clean(textOf(node), 120); const href = absolute(attr(node, "href")); if (text && href) push({ kind: "link", text, href }); return; }
    if (name === "button") { const text = clean(textOf(node) || attr(node, "aria-label") || "", 120); if (text) push({ kind: "button", text }); return; }
    if (name === "img") { const src = absolute(attr(node, "src") ?? attr(node, "data-src")); if (src) push({ kind: "image", alt: clean(attr(node, "alt") ?? "", 160), src }); return; }
    if (name === "ul" || name === "ol") {
      const items = (node.childNodes ?? []).filter((child) => child.nodeName === "li").map((child) => clean(textOf(child), 140)).filter(Boolean).slice(0, 12);
      if (items.length > 0 && items.every((item) => item.length < 140)) { push({ kind: "list", items }); words += items.join(" ").split(" ").length; return; }
    }
    if (name === "form") {
      const fields: string[] = [];
      const walk = (n: Node) => { if (["input", "textarea", "select"].includes(n.nodeName) && attr(n, "type") !== "hidden") fields.push(clean(attr(n, "aria-label") ?? attr(n, "placeholder") ?? attr(n, "name") ?? n.nodeName, 60)); (n.childNodes ?? []).forEach(walk); };
      walk(node);
      if (fields.length > 0) push({ kind: "form", fields: fields.slice(0, 10) });
    }
    (node.childNodes ?? []).forEach(visit);
    if (SECTION_TAGS.has(name)) open("page");
  };
  visit(document);
  if (current.blocks.length > 0) sections.push(current);

  const kept = sections.filter((section) => section.blocks.length > 0);
  const total = kept.length;
  const withRoles: Section[] = kept.map((section, index) => {
    const items = groupItems(section.blocks);
    return { ...section, role: roleOf(section.tag, section.blocks, index, total, items), ...(items ? { items } : {}) };
  });
  const seen = new Set<string>();
  const links = (list: Section[]) => list.flatMap((section) => section.blocks).filter((block): block is Extract<Block, { kind: "link" }> => block.kind === "link").filter((link) => { const key = `${link.text}|${link.href}`; if (seen.has(key)) return false; seen.add(key); return true; }).map(({ text, href }) => ({ text, href }));
  const primary = links(withRoles.filter((section) => section.role === "navigation")).slice(0, 14);
  seen.clear();
  const footer = links(withRoles.filter((section) => section.role === "footer")).slice(0, 24);
  const outline = withRoles.flatMap((section) => section.blocks).filter((block): block is Extract<Block, { kind: "heading" }> => block.kind === "heading").map(({ level, text }) => ({ level, text })).slice(0, 60);
  const primaryActions = [...new Set(withRoles.filter((section, index) => section.role === "navigation" || section.role === "hero" || index < 2).flatMap((section) => section.blocks).filter((block) => block.kind === "button" || (block.kind === "link" && block.text.length <= 28)).map((block) => ("text" in block ? block.text : "")))].filter(Boolean).slice(0, 5);

  return {
    title: title || meta["og:title"] || "",
    ...(meta.description || meta["og:description"] ? { description: clean(meta.description ?? meta["og:description"] ?? "", 300) } : {}),
    ...(language ? { language } : {}),
    ...(meta["theme-color"] ? { themeColor: meta["theme-color"] } : {}),
    ...(meta["og:site_name"] ? { siteName: clean(meta["og:site_name"], 80) } : {}),
    ...(meta["og:image"] ? { image: absolute(meta["og:image"]) } : {}),
    outline,
    navigation: { primary, footer },
    primaryActions,
    structure: withRoles.map((section) => section.role),
    sections: withRoles,
    likelyScripted: words < 40,
  };
}

export async function snapshotSite(address: string, fetcher: typeof fetch = fetch): Promise<Snapshot> {
  let start: URL;
  try { start = new URL(address); } catch { throw new SnapshotError("That is not a valid address."); }
  const { url, html, truncated } = await fetchHtml(start, fetcher);
  return { url: url.href, ...summarize(html, url), truncated };
}
