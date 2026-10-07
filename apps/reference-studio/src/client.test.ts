import { expect, it } from "vitest";
import { createClient, idFromHash, navigationFilter } from "./client";
import { ingestFixture } from "@skryensya/reference-model/testing";
it("sends server filters, preserves revisions in edits and decisions, and parses previews", async () => {
  const i = ingestFixture();
  const calls: { path: string; body?: Record<string, unknown> }[] = [];
  const transport: typeof fetch = async (url, init) => {
    expect((init?.headers as Record<string, string>).authorization).toBe(
      "Bearer secret",
    );
    const path = String(url),
      body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ path, body });
    return Response.json(
      path.includes("publication/preview")
        ? {
            ingestId: i.id,
            revision: i.revision,
            exampleId: "test",
            kind: "fixed",
            baseSha: "sha",
            files: [
              { path: "contracts/examples/fixed/test.ts", content: "curated" },
            ],
            digest: "digest",
            validation: { valid: true, output: "passed" },
          }
        : path.includes("?")
          ? [i]
          : i,
    );
  };
  const client = createClient(
    { server: "https://reference.example", token: "secret" },
    transport,
  );
  expect(
    await client.list({
      subject: "card",
      scale: "component",
      minConfidence: 0.8,
    }),
  ).toEqual([i]);
  expect(calls[0].path).toContain("subject=card");
  await client.classification(i, {
    subject: { value: "hero", source: "human" },
  });
  await client.decide(i, "accept");
  await client.decide(i, "reject");
  expect(calls.slice(1).every((c) => c.body?.baseRevision === i.revision)).toBe(
    true,
  );
  expect(
    (
      await client.preview(i, {
        kind: "fixed",
        exampleId: "test",
        title: { en: "Test", es: "Prueba" },
        purpose: { en: "Show", es: "Mostrar" },
      })
    ).files[0].content,
  ).toBe("curated");
  expect(idFromHash(`#/ingests/${i.id}`)).toBe(i.id);
  expect(navigationFilter("Inbox")).toEqual({ inbox: "true" });
});
it("surfaces conflicts and rejects malformed server records", async () => {
  const client = createClient(
    { server: "https://reference.example", token: "secret" },
    async () => new Response("Obsolete revision", { status: 409 }),
  );
  await expect(client.decide(ingestFixture(), "accept")).rejects.toThrow("409");
  const invalid = createClient(
    { server: "https://reference.example", token: "secret" },
    async () => Response.json({ id: "not-an-ingest" }),
  );
  await expect(invalid.get("id")).rejects.toThrow();
});
