import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { decodeSiteFile } from "@skryensya/maker-model";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * The Maker's tools through a real client, against the built binary, on a site file of their own
 * (`MAKER_SITE`), never the checkout's.
 */

const binary = join(import.meta.dirname, "..", "dist", "index.js");
const sitePath = join(mkdtempSync(join(tmpdir(), "maker-site-")), "site.maker.json");
let client: Client;

type Out = { revision: number; outline: string; refused?: string };
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  return { ...(result.structuredContent as Out), isError: result.isError === true };
};

beforeAll(async () => {
  client = new Client({ name: "maker-tools-test", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: "node", args: [binary], env: { ...process.env, MAKER_SITE: sitePath } as Record<string, string> }));
}, 60_000);

afterAll(async () => {
  await client.close();
});

const idOf = (outline: string, signature: string) => new RegExp(`(\\S+) ${signature.replace(/[.]/g, "\\\\.")}`).exec(outline)?.[1];

describe("maker tools", () => {
  it("reads an empty site before anything was saved", async () => {
    const read = await call("maker_read");
    expect(read.revision).toBe(0);
    expect(read.outline).toMatch(/^page \S+ "Home" \/\n\s+\S+ layout\/Main$/);
  });

  it("applies structure, writes the file one revision up, and reads it back", async () => {
    const read = await call("maker_read");
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const main = idOf(read.outline, "layout/Main")!;
    const applied = await call("maker_apply", {
      revision: read.revision,
      operations: [
        {
          type: "page",
          page,
          operations: [
            { type: "insert", at: { parent: main, slot: "children", index: 0 }, tree: { contract: "layout", signature: "Stack", children: [
              { contract: "button", signature: "Button.action", children: "One" },
              { contract: "button", signature: "Button.action", children: "Two" },
            ] } },
          ],
        },
      ],
    });
    expect(applied.isError).toBe(false);
    expect(applied.revision).toBe(1);
    const file = decodeSiteFile(readFileSync(sitePath, "utf8"))!;
    expect(file.revision).toBe(1);
    expect(applied.outline).toContain("layout/Stack");
  });

  it('turns "put the two buttons side by side" into a wrap in an Inline', async () => {
    const read = await call("maker_read");
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const buttons = [...read.outline.matchAll(/(\S+) button\/Button\.action/g)].map((match) => match[1]!);
    const applied = await call("maker_apply", {
      revision: read.revision,
      operations: [{ type: "page", page, operations: [{ type: "wrap", children: buttons, with: { contract: "layout", signature: "Inline", options: { gap: "sm" } } }] }],
    });
    expect(applied.isError).toBe(false);
    expect(applied.outline).toMatch(/layout\/Inline gap="sm"\n\s+\S+ button\/Button\.action/);
  });

  it("refuses, whole and with the reason, what the contract refuses", async () => {
    const read = await call("maker_read");
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const stack = idOf(read.outline, "layout/Stack")!;
    const refused = await call("maker_apply", {
      revision: read.revision,
      operations: [{ type: "page", page, operations: [
        { type: "setOption", node: stack, name: "gap", value: "lg" },
        { type: "setOption", node: stack, name: "padding", value: "md" },
      ] }],
    });
    expect(refused.isError).toBe(true);
    expect(refused.refused).toMatch(/no option "padding"/);
    expect((await call("maker_read")).revision).toBe(read.revision);
  });

  it("offers no coordinate: an operation carrying one is not an operation", async () => {
    const read = await call("maker_read");
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const stack = idOf(read.outline, "layout/Stack")!;
    const result = await client.callTool({ name: "maker_apply", arguments: { operations: [{ type: "page", page, operations: [{ type: "setPosition", node: stack, x: 120, y: 80 }] }] } });
    expect(result.isError).toBe(true);
  });

  it("does not overwrite a change made since the agent read", async () => {
    const read = await call("maker_read");
    const file = decodeSiteFile(readFileSync(sitePath, "utf8"))!;
    writeFileSync(sitePath, JSON.stringify({ ...file, revision: file.revision + 1 }));
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const stale = await call("maker_apply", { revision: read.revision, operations: [{ type: "renamePage", page, name: "Inicio" }] });
    expect(stale.isError).toBe(true);
    expect(stale.refused).toMatch(/changed since you read it/);
  });

  it("never replaces a file it cannot read as a site", async () => {
    writeFileSync(sitePath, "{ not a site");
    const read = await call("maker_read");
    expect(read.isError).toBe(true);
    expect(read.refused).toMatch(/left untouched/);
    expect(readFileSync(sitePath, "utf8")).toBe("{ not a site");
  });
});
