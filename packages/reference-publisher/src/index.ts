import { createHash } from "node:crypto";
import {
  publicationRequestSchema,
  previewSchema,
  type ReferencePublisher,
  type ReferenceIngest,
  type PublicationRequest,
  type PublicationPreview,
  type PublicationValidation,
  type GeneratedFile,
  type PublicationResult,
  type ReferencePublication,
} from "@skryensya/reference-model";

export interface CatalogueRepository {
  head(): Promise<string>;
  read(sha: string, path: string): Promise<string>;
  validate(sha: string, files: GeneratedFile[]): Promise<PublicationValidation>;
}
export interface PublicationGitHub {
  create(
    preview: PublicationPreview,
    ingest: ReferenceIngest,
    attemptId: string,
  ): Promise<PublicationResult>;
  merged(publication: ReferencePublication): Promise<boolean>;
  reconcile(
    publication: ReferencePublication,
  ): Promise<PublicationResult | undefined>;
}
export function previewDigest(
  p: Pick<
    PublicationPreview,
    "ingestId" | "revision" | "exampleId" | "kind" | "baseSha" | "files"
  >,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        p.ingestId,
        p.revision,
        p.exampleId,
        p.kind,
        p.baseSha,
        p.files,
      ]),
    )
    .digest("hex");
}
const json = (value: unknown) => JSON.stringify(value, null, 2);
const libraryIndex = "contracts/examples/library/index.ts";
const fixedIndex = "contracts/examples/fixed/index.ts";
export function createPublisher(
  repo: CatalogueRepository,
  github: PublicationGitHub,
): ReferencePublisher {
  return {
    async preview(ingest, input) {
      if (ingest.status !== "accepted")
        throw new Error("Only accepted references can be previewed");
      const r = publicationRequestSchema.parse(input);
      const c = ingest.classification;
      if (!c?.subject || !c.scale || !c.intent)
        throw new Error("Complete classification required");
      const baseSha = await repo.head();
      const files: GeneratedFile[] = [];
      const metadata = {
        id: r.exampleId,
        subject: c.subject.value,
        scale: c.scale.value,
        intent: c.intent.value,
        title: r.title,
        purpose: r.purpose,
      };
      if (r.kind === "fixed") {
        if (!r.tree)
          throw new Error("A fixed example requires a curated UsageTree");
        const path = `contracts/examples/fixed/reference-${r.exampleId}.ts`;
        files.push({
          path,
          content: `import type { Fixed } from "../model/types.js";\nexport const referenceExample: Fixed = ${json({ ...metadata, notes: [`Source: ${ingest.source.url}`, `Reference ingest: ${ingest.id}`], tree: r.tree })};\n`,
        });
        const index = await repo.read(baseSha, fixedIndex);
        if (
          !index.includes(
            "legacySnippets.map(toFixed).filter((entry): entry is Fixed => entry !== undefined)",
          )
        )
          throw new Error(
            "Fixed registry integration changed; update publisher",
          );
        files.push({
          path: fixedIndex,
          content:
            `import { referenceExample as reference_${r.exampleId.replaceAll("-", "_")} } from "./reference-${r.exampleId}.js";\n` +
            index.replace(
              "legacySnippets.map(toFixed).filter((entry): entry is Fixed => entry !== undefined)",
              `[reference_${r.exampleId.replaceAll("-", "_")}, ...legacySnippets.map(toFixed).filter((entry): entry is Fixed => entry !== undefined)]`,
            ),
        });
      } else {
        let index = await repo.read(baseSha, libraryIndex);
        const path = `contracts/examples/library/${c.subject.value}/reference-${r.exampleId}.ts`;
        const symbol = `reference_${r.exampleId.replaceAll("-", "_")}`;
        if (r.kind === "use") {
          if (!r.patternId || !r.content)
            throw new Error(
              "Select an existing pattern and supply bilingual content",
            );
          const matches = [
            ...index.matchAll(
              /import \{ (\w+)(?: as (\w+))? \} from "(\.\/[^\"]+)";/g,
            ),
          ];
          let selected: RegExpMatchArray | undefined;
          for (const m of matches) {
            const moduleSource = await repo.read(
              baseSha,
              `contracts/examples/library/${m[3].slice(2).replace(/\.js$/, ".ts")}`,
            );
            if (
              moduleSource.includes("definePattern") &&
              new RegExp(
                `id:\\s*["']${r.patternId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
              ).test(moduleSource)
            ) {
              selected = m;
              break;
            }
          }
          if (!selected) throw new Error("Unknown existing pattern");
          const use = {
            id: r.exampleId,
            pattern: r.patternId,
            subject: c.subject.value,
            intent: c.intent.value,
            title: r.title,
            purpose: r.purpose,
            content: r.content,
          };
          files.push({
            path,
            content: `import type { Use } from "../../model/types.js";\nexport const referenceUse: Use = ${json(use)};\n`,
          });
          const selectedSource = await repo.read(
            baseSha,
            `contracts/examples/library/${selected[3].slice(2).replace(/\.js$/, ".ts")}`,
          );
          const scale =
            /scale:\s*["'](fragment|component|composition|page)["']/.exec(
              selectedSource,
            )?.[1];
          if (scale !== c.scale.value)
            throw new Error(
              "Classification scale must match the selected pattern",
            );
          if (!/;\s*$/.test(index))
            throw new Error("Pattern registry integration changed");
          index =
            `import { referenceUse as ${symbol} } from "./${c.subject.value}/reference-${r.exampleId}.js";\n` +
            index.replace(
              /;\s*$/,
              `.map((module: PatternModule) => module.pattern.id === ${json(r.patternId)} ? { ...module, uses: [...module.uses, ${symbol}] } : module);\n`,
            );
        } else {
          if (!r.tree || !r.fields || !r.content || !r.layout)
            throw new Error(
              "New pattern requires fields, layout, bilingual content and a UsageTree template",
            );
          const keys = Object.keys(r.fields);
          if (
            !keys.length ||
            keys.some((k) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(k))
          )
            throw new Error("Pattern needs named fields");
          for (const key of keys)
            if (!JSON.stringify(r.tree).includes(`{{${key}}}`))
              throw new Error(`Unused field: ${key}`);
          const patternId = `reference-${r.exampleId}`;
          files.push({
            path,
            content: `import { definePattern, type PatternModule } from "../../model/types.js";\nimport type { UsageTree } from "@skryensya/core/usage-tree";\nconst template: UsageTree = ${json(r.tree)};\nfunction fill(value: unknown, content: Record<string, unknown>): unknown {\n  if (typeof value === "string") { const match = /^\\{\\{(\\w+)\\}\\}$/.exec(value); if (match) { if (!(match[1] in content)) throw new Error("Missing field: " + match[1]); return content[match[1]]; } return value; }\n  if (Array.isArray(value)) return value.map((v) => fill(v, content));\n  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, fill(v, content)]));\n  return value;\n}\nconst declared = definePattern<Record<string, unknown>>({\n  id: ${json(patternId)}, subject: ${json(c.subject.value)} as const, scale: ${json(c.scale.value)} as const, title: ${json(r.title)}, layout: ${json(r.layout)}, fields: ${json(r.fields)},\n  build(content) { return fill(template, content) as UsageTree; }\n});\nexport const referenceModule: PatternModule = { pattern: declared.pattern, uses: [declared.use(${json({ id: r.exampleId, intent: c.intent.value, title: r.title, purpose: r.purpose, content: r.content })})] };\n`,
          });
          index =
            `import { referenceModule as ${symbol} } from "./${c.subject.value}/reference-${r.exampleId}.js";\n` +
            index.replace(
              "export const modules: readonly PatternModule[] = [",
              `export const modules: readonly PatternModule[] = [\n  ${symbol},`,
            );
        }
        files.push({ path: libraryIndex, content: index });
      }
      for (const f of files.filter(
        (f) => f.path !== libraryIndex && f.path !== fixedIndex,
      )) {
        try {
          await repo.read(baseSha, f.path);
        } catch {
          continue;
        }
        throw new Error(`Refusing to overwrite ${f.path}`);
      }
      const initial = {
        ingestId: ingest.id,
        revision: ingest.revision,
        exampleId: r.exampleId,
        kind: r.kind,
        baseSha,
        files,
      };
      const preview: PublicationPreview = {
        ...initial,
        digest: previewDigest(initial),
        validation: { valid: false, output: "Not validated" },
      };
      preview.validation = await this.validate(preview);
      return preview;
    },
    async validate(input) {
      const p = previewSchema.parse(input);
      if (
        p.digest !== previewDigest(p) ||
        p.files.some(
          (f) =>
            !/^contracts\/examples\/(library|fixed)\/[a-z0-9/_-]+\.ts$/.test(
              f.path,
            ),
        ) ||
        new Set(p.files.map((f) => f.path)).size !== p.files.length
      )
        return { valid: false, output: "Invalid preview paths or digest" };
      return repo.validate(p.baseSha, p.files);
    },
    async publish(preview, ingest, attemptId) {
      if (
        ingest.id !== preview.ingestId ||
        ingest.status !== "publishing" ||
        ingest.revision !== preview.revision + 1
      )
        throw new Error("Ingest must hold the publication lease");
      const validation = await this.validate(preview);
      if (!validation.valid)
        throw new Error(`Publication validation failed: ${validation.output}`);
      return github.create({ ...preview, validation }, ingest, attemptId);
    },
    merged(publication) {
      return github.merged(publication);
    },
    reconcile(publication) {
      return github.reconcile(publication);
    },
  };
}
export { gitRepository } from "./repository.js";
export { githubPublisher } from "./github.js";
