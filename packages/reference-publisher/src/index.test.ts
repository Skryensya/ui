import { readFile } from "node:fs/promises";
import { expect, it, vi } from "vitest";
import { ingestFixture } from "@skryensya/reference-model/testing";
import type {
  PublicationRequest,
  PublicationPreview,
} from "@skryensya/reference-model";
import {
  createPublisher,
  type CatalogueRepository,
  type PublicationGitHub,
} from "./index.js";
import { githubPublisher } from "./github.js";
const request: PublicationRequest = {
  kind: "fixed",
  exampleId: "curated-reference",
  title: { en: "Reference", es: "Referencia" },
  purpose: { en: "Show a quota", es: "Mostrar una cuota" },
  tree: { contract: "typography", signature: "Text", children: "Storage" },
};
function fixture(valid = true) {
  const repo: CatalogueRepository = {
    async head() {
      return "a".repeat(40);
    },
    async read(_sha, path) {
      return readFile(new URL(`../../../${path}`, import.meta.url), "utf8");
    },
    validate: vi.fn(async () => ({
      valid,
      output: valid ? "compiler gates passed" : "invalid usage tree",
    })),
  };
  const github: PublicationGitHub = {
    create: vi.fn(async () => ({
      branch: "reference/test",
      commitSha: "b".repeat(40),
      prNumber: 1,
      prUrl: "https://github.com/test/repo/pull/1",
    })),
    merged: vi.fn(async () => true),
    reconcile: vi.fn(async () => undefined),
  };
  const ingest = { ...ingestFixture(), status: "accepted" as const };
  return { repo, github, ingest, publisher: createPublisher(repo, github) };
}
it("creates stable previews and touches only the curated file and catalogue registry", async () => {
  const f = fixture();
  const p = await f.publisher.preview(f.ingest, request);
  expect(p).toEqual(await f.publisher.preview(f.ingest, request));
  expect(p.files.map((file) => file.path)).toEqual([
    "contracts/examples/fixed/reference-curated-reference.ts",
    "contracts/examples/fixed/index.ts",
  ]);
  expect(p.files[1].content).toContain(
    "[reference_curated_reference, ...legacySnippets",
  );
  expect(p.files[0].content).not.toContain("screenshot");
  await expect(
    f.publisher.preview({ ...f.ingest, status: "review" }, request),
  ).rejects.toThrow("accepted");
});
it("requires human selection and mode-specific inputs; new use retains the existing pattern", async () => {
  const f = fixture();
  f.ingest.classification!.scale = { value: "fragment", source: "human" };
  const p = await f.publisher.preview(f.ingest, {
    ...request,
    tree: undefined,
    kind: "use",
    patternId: "heading-stack",
    content: {
      title: { en: "Quota", es: "Cuota" },
      subtitle: { en: "Storage", es: "Almacenamiento" },
      eyebrow: { en: "Usage", es: "Uso" },
    },
  });
  expect(p.files[0].content).toContain('"pattern": "heading-stack"');
  expect(p.files[1].content).toContain('module.pattern.id === "heading-stack"');
  expect(p.files).toHaveLength(2);
  await expect(
    f.publisher.preview(f.ingest, { ...request, kind: "pattern" }),
  ).rejects.toThrow("New pattern requires");
  const pattern = await f.publisher.preview(f.ingest, {
    ...request,
    kind: "pattern",
    tree: { contract: "typography", signature: "Text", children: "{{title}}" },
    fields: { title: { en: "Title", es: "Título" } },
    content: { title: { en: "Storage", es: "Almacenamiento" } },
    layout: { en: "A text fragment", es: "Un fragmento de texto" },
  });
  expect(pattern.files[0].content).toContain("definePattern");
  expect(pattern.files[0].content).toContain('"{{title}}"');
});
it("never contacts GitHub when validation fails, digest changes or paths escape the catalogue", async () => {
  const f = fixture(false);
  const p = await f.publisher.preview(f.ingest, request);
  await expect(
    f.publisher.publish(
      p,
      { ...f.ingest, revision: p.revision + 1, status: "publishing" },
      "attempt",
    ),
  ).rejects.toThrow("validation failed");
  expect(f.github.create).not.toHaveBeenCalled();
  expect(
    (
      await f.publisher.validate({
        ...p,
        files: [{ path: "../../README.md", content: "overwrite" }],
      })
    ).valid,
  ).toBe(false);
});
it("creates Git trees, a non-main branch and a PR; only a verified merged PR completes publication", async () => {
  const calls: { path: string; method: string; body: unknown }[] = [];
  const transport: typeof fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ path, method: init?.method ?? "GET", body });
    return Response.json(
      path.includes("/git/ref/")
        ? { object: { sha: "a".repeat(40) } }
        : path.includes("/git/commits/")
          ? { sha: "a".repeat(40), tree: { sha: "tree" } }
          : path.endsWith("/git/trees")
            ? { sha: "new-tree" }
            : path.endsWith("/git/commits")
              ? { sha: "new-commit" }
              : path.includes("/pulls/")
                ? {
                    merged: true,
                    head: { sha: "new-commit" },
                    base: { ref: "main" },
                  }
                : path.endsWith("/pulls")
                  ? {
                      number: 9,
                      html_url: "https://github.com/org/repo/pull/9",
                    }
                  : {},
    );
  };
  const github = githubPublisher(
    { owner: "org", repo: "repo", token: "secret" },
    transport,
  );
  const f = fixture(),
    p = await f.publisher.preview(f.ingest, request);
  const result = await github.create(p, f.ingest, "attempt");
  expect(result.branch).toBe(`reference/${f.ingest.id}/attempt`);
  expect(calls.some((c) => c.method === "PATCH")).toBe(false);
  expect(
    (
      calls.find((c) => c.path.endsWith("/git/trees"))!.body as {
        tree: unknown[];
      }
    ).tree,
  ).toHaveLength(2);
  expect(
    await github.merged({
      ...result,
      id: f.ingest.id,
      ingestId: f.ingest.id,
      exampleId: request.exampleId,
      kind: "fixed",
      generatedFiles: [],
      status: "pr-open",
      createdAt: f.ingest.createdAt,
      updatedAt: f.ingest.updatedAt,
    }),
  ).toBe(true);
});
