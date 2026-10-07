import { z } from "zod";
import type { PublicationGitHub } from "./index.js";
const refSchema = z.object({ object: z.object({ sha: z.string() }) });
const commitSchema = z.object({
  sha: z.string(),
  tree: z.object({ sha: z.string() }),
});
const shaSchema = z.object({ sha: z.string() });
const prSchema = z.object({ number: z.number().int(), html_url: z.url() });
export function githubPublisher(
  config: { owner: string; repo: string; token: string; base?: string },
  transport: typeof fetch = fetch,
): PublicationGitHub {
  const base = config.base ?? "main";
  const prefix = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
  async function api(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<unknown> {
    const response = await transport(prefix + path, {
      method,
      headers: {
        authorization: `Bearer ${config.token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new Error(`GitHub ${method} ${path}: ${response.status}`);
    return response.json();
  }
  return {
    async create(p, ingest, attemptId) {
      const ref = refSchema.parse(
        await api(`/git/ref/heads/${encodeURIComponent(base)}`),
      );
      if (ref.object.sha !== p.baseSha)
        throw new Error("Catalogue base changed; refresh and preview again");
      const parent = commitSchema.parse(await api(`/git/commits/${p.baseSha}`));
      const tree = shaSchema.parse(
        await api("/git/trees", "POST", {
          base_tree: parent.tree.sha,
          tree: p.files.map((f) => ({
            path: f.path,
            mode: "100644",
            type: "blob",
            content: f.content,
          })),
        }),
      );
      const commit = shaSchema.parse(
        await api("/git/commits", "POST", {
          message: `feat(examples): publish reference ${p.exampleId}`.slice(
            0,
            100,
          ),
          tree: tree.sha,
          parents: [p.baseSha],
        }),
      );
      const branch = `reference/${ingest.id}/${attemptId}`;
      await api("/git/refs", "POST", {
        ref: `refs/heads/${branch}`,
        sha: commit.sha,
      });
      const pr = prSchema.parse(
        await api("/pulls", "POST", {
          title: `Reference: ${p.exampleId}`,
          head: branch,
          base,
          body: [
            "## Reference publication",
            `Source: ${ingest.source.url}`,
            `Captured: ${ingest.capture.capturedAt}`,
            `Ingest: ${ingest.id}`,
            `Kind: ${p.kind}`,
            `Classification: ${JSON.stringify(ingest.classification)}`,
            "Generated files:",
            ...p.files.map((f) => `- \`${f.path}\``),
            "Validation: passed existing compiler check (contracts, filing, both locales, accessibility, stylesheets).",
            `Preview digest: ${p.digest}`,
            "```text",
            p.validation.output.slice(-12000).replaceAll("```", "'''"),
            "```",
          ].join("\n"),
        }),
      );
      return {
        branch,
        commitSha: commit.sha,
        prNumber: pr.number,
        prUrl: pr.html_url,
      };
    },
    async reconcile(publication) {
      if (
        !publication.branch ||
        !publication.branch.startsWith(`reference/${publication.ingestId}/`)
      )
        throw new Error("Invalid publication branch");
      const results = z
        .array(
          z.object({
            number: z.number().int(),
            html_url: z.url(),
            head: z.object({ ref: z.string(), sha: z.string() }),
            base: z.object({ ref: z.string() }),
          }),
        )
        .parse(
          await api(
            `/pulls?state=all&head=${encodeURIComponent(`${config.owner}:${publication.branch}`)}&base=${encodeURIComponent(base)}`,
          ),
        );
      const pr = results.find(
        (p) => p.head.ref === publication.branch && p.base.ref === base,
      );
      return pr
        ? {
            branch: publication.branch,
            commitSha: pr.head.sha,
            prNumber: pr.number,
            prUrl: pr.html_url,
          }
        : undefined;
    },
    async merged(publication) {
      if (!publication.prNumber || !publication.commitSha) return false;
      const result = z
        .object({
          merged: z.boolean(),
          head: z.object({ sha: z.string() }),
          base: z.object({ ref: z.string() }),
        })
        .parse(await api(`/pulls/${publication.prNumber}`));
      return (
        result.merged &&
        result.head.sha === publication.commitSha &&
        result.base.ref === base
      );
    },
  };
}
