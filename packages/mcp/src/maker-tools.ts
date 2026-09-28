import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  applySiteAll,
  createSite,
  decodeSiteFile,
  describeSite,
  encodeSiteFile,
  parseSite,
  randomId,
  resolveAgentOperations,
  type AgentSiteOperation,
  type SiteFile,
} from "@skryensya/maker-model";
import { z } from "zod";
import { provenance } from "./manifest.js";

/*
 * THE MAKER, OVER MCP (decision 31: a prompt speaks only in operations).
 *
 * Two tools on the site the Maker app has open, shared through one file: `maker_read` returns it as
 * an outline with identities, `maker_apply` takes Maker operations and nothing else. There is no
 * field anywhere in this vocabulary for a coordinate, a length or a style, so "put these two
 * buttons next to each other" can only arrive as a wrap in an Inline, and the browser decides the
 * rest.
 *
 * STDIO ONLY, and only from a checkout: the file lives beside the repository, and the Maker's dev
 * server watches it and shows every applied change live, as one undoable step.
 */

const place = z.object({
  parent: z.string().describe("Id of the node whose slot receives it."),
  slot: z.string().describe('The slot: "children" almost always; a named slot like "actions" otherwise.'),
  index: z.number().int().min(0).describe("The gap among that slot's current children: 0 is before the first."),
});

const signatureRef = z.object({ contract: z.string(), signature: z.string() });
const optionValue = z.union([z.string(), z.number(), z.boolean()]);

const pageOperation = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("insert"),
    at: place,
    tree: z.record(z.string(), z.unknown()).optional().describe("A usage tree, as validate_ui takes it."),
    signature: signatureRef.optional().describe("Or a catalogue signature, inserted as its preset."),
  }),
  z.object({ type: z.literal("move"), child: z.string(), to: place }),
  z.object({ type: z.literal("remove"), child: z.string() }),
  z.object({
    type: z.literal("wrap"),
    children: z.array(z.string()).min(1).describe("Contiguous siblings of one slot, in order."),
    with: signatureRef.extend({ options: z.record(z.string(), optionValue).optional() }).describe("The container: Stack, Inline, Grid, Box, Wrapper…"),
  }),
  z.object({ type: z.literal("unwrap"), node: z.string() }),
  z.object({ type: z.literal("setOption"), node: z.string(), name: z.string(), value: optionValue.optional().describe("Omit to go back to the default.") }),
  z.object({ type: z.literal("setAttr"), node: z.string(), name: z.string(), value: z.string().optional() }),
  z.object({ type: z.literal("setText"), node: z.string(), slot: z.string().optional(), text: z.string() }),
]);

const siteOperation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page"), page: z.string().describe("Page id."), operations: z.array(pageOperation).min(1) }),
  z.object({ type: z.literal("addPage"), name: z.string(), path: z.string(), index: z.number().int().min(0).optional() }),
  z.object({ type: z.literal("removePage"), page: z.string() }),
  z.object({ type: z.literal("renamePage"), page: z.string(), name: z.string() }),
  z.object({ type: z.literal("setPagePath"), page: z.string(), path: z.string() }),
  z.object({ type: z.literal("movePage"), page: z.string(), index: z.number().int().min(0) }),
]);

const makerOutput = z.object({
  ...{ schemaVersion: z.string(), sourceHash: z.string() },
  revision: z.number().describe("The site file's revision this answer describes."),
  outline: z.string().describe("The site: every page, node and text run with its id, and what is pending."),
  refused: z.string().optional().describe("Why nothing was applied, when the operations were refused."),
});

/**
 * The site on disk. A missing file starts an empty site and saves it at once, so the ids this read
 * hands out are the ones the next call finds. A file that exists and does not read as a site is
 * NEVER replaced: that would throw away someone's work; the tools report it instead.
 */
function read(path: string): SiteFile | { readonly unreadable: string } {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") return { unreadable: `Cannot read ${path}: ${(error as Error).message}` };
    const fresh: SiteFile = { revision: 0, site: createSite(provenance.sourceHash, randomId) };
    write(path, fresh);
    return fresh;
  }
  const file = decodeSiteFile(text);
  if (!file) return { unreadable: `${path} is not a Maker site file; it was left untouched.` };
  const opened = parseSite(JSON.stringify(file.site), provenance.sourceHash, randomId);
  if (!opened.ok) return { unreadable: `${path} holds no readable site (${opened.reason}); it was left untouched.` };
  return { revision: file.revision, site: opened.site };
}

/** Write through a temporary file and a rename, so the Maker never reads half a site. */
function write(path: string, file: SiteFile): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, encodeSiteFile(file));
  renameSync(temporary, path);
}

function answer(value: z.infer<typeof makerOutput>, isError = false) {
  return {
    content: [{ type: "text" as const, text: value.refused ? `${value.refused}\n\n${value.outline}` : value.outline }],
    structuredContent: value,
    ...(isError ? { isError: true } : {}),
  };
}

export function registerMakerTools(server: McpServer, sitePath: string): void {
  server.registerTool(
    "maker_read",
    {
      title: "Read the site open in the Maker",
      description:
        "The site the Maker app is editing, as an outline: each page (`page <id> \"name\" /path`), then " +
        "one line per node (`<id> contract/Signature option=value …`), text runs as `<id> \"text\"`, and " +
        "what is pending with the ids it concerns. Read it before maker_apply: operations address nodes " +
        "and pages by these ids.",
      inputSchema: z.object({}),
      outputSchema: makerOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const file = read(sitePath);
      if ("unreadable" in file) return answer({ ...provenance, revision: -1, outline: "", refused: file.unreadable }, true);
      return answer({ ...provenance, revision: file.revision, outline: describeSite(file.site) });
    },
  );

  server.registerTool(
    "maker_apply",
    {
      title: "Change the site open in the Maker, by operations",
      description:
        "Apply Maker operations to the open site, all or none, as one undoable step in the Maker. " +
        "Layout is STRUCTURE: to put things side by side, wrap them in an Inline; one above another, a " +
        "Stack; in columns, a Grid (minColumn lets its own width decide how many); a width ceiling is a " +
        "Box's measure; spacing is the container's gap or a Box's padding. There is no x, y, width, " +
        "margin or style anywhere, and an operation the contract refuses (an option a signature does not " +
        "declare, a Wrapper inside a Wrapper, a block inside a heading) refuses the whole request with " +
        "the reason. Pass `revision` from maker_read so a change the person made meanwhile is not " +
        "overwritten; on a mismatch nothing is applied and the current outline comes back.",
      inputSchema: z.object({
        revision: z.number().int().min(0).optional().describe("The revision maker_read returned."),
        operations: z.array(siteOperation).min(1),
      }),
      outputSchema: makerOutput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args) => {
      /* zod checked the shape; a `tree` is typed as a usage tree here, and the contract judges it
         when it is placed (an unknown signature has no place anywhere). */
      const operations = args.operations as unknown as AgentSiteOperation[];
      const file = read(sitePath);
      if ("unreadable" in file) return answer({ ...provenance, revision: -1, outline: "", refused: file.unreadable }, true);
      const current = { ...provenance, revision: file.revision, outline: describeSite(file.site) };
      if (args.revision !== undefined && args.revision !== file.revision) {
        return answer({ ...current, refused: `The site is at revision ${file.revision}, not ${args.revision}: it changed since you read it. Nothing was applied; re-read the outline below.` }, true);
      }
      const resolved = resolveAgentOperations(file.site, operations, randomId);
      if (!resolved.ok) return answer({ ...current, refused: resolved.reason }, true);
      const applied = applySiteAll(file.site, resolved.value);
      if (!applied.ok) return answer({ ...current, refused: applied.reason }, true);
      const next: SiteFile = { revision: file.revision + 1, site: applied.site };
      write(sitePath, next);
      return answer({ ...provenance, revision: next.revision, outline: describeSite(next.site) });
    },
  );
}
