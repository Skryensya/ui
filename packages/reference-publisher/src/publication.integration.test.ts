import { expect, it } from "vitest";
import { ingestFixture } from "@skryensya/reference-model/testing";
import {
  createPublisher,
  gitRepository,
  type PublicationGitHub,
} from "./index.js";
const root = process.env.REFERENCE_TEST_REPO_ROOT;
it.skipIf(!root)(
  "validates all three generated modes through the real committed-snapshot compiler gate",
  async () => {
    const github: PublicationGitHub = {
      async create() {
        throw new Error("Integration test must not publish");
      },
      async merged() {
        return false;
      },
      async reconcile() {
        return undefined;
      },
    };
    const publisher = createPublisher(gitRepository(root!), github);
    const ingest = { ...ingestFixture(), status: "accepted" as const };
    const base = {
      exampleId: "reference-integration-fixture",
      title: { en: "Quota evidence", es: "Referencia de cuota" },
      purpose: { en: "Show remaining storage", es: "Mostrar espacio restante" },
    };
    const fixed = await publisher.preview(ingest, {
      ...base,
      kind: "fixed",
      tree: {
        contract: "typography",
        signature: "Text",
        children: "Storage quota",
      },
    });
    expect(fixed.validation, fixed.validation.output).toMatchObject({
      valid: true,
    });
    const pattern = await publisher.preview(ingest, {
      ...base,
      kind: "pattern",
      fields: { label: { en: "The label", es: "La etiqueta" } },
      content: {
        label: { en: "Storage quota", es: "Cuota de almacenamiento" },
      },
      layout: { en: "A text fragment", es: "Un fragmento de texto" },
      tree: {
        contract: "typography",
        signature: "Text",
        children: "{{label}}",
      },
    });
    expect(pattern.validation, pattern.validation.output).toMatchObject({
      valid: true,
    });
    ingest.classification!.scale = { value: "fragment", source: "human" };
    const use = await publisher.preview(ingest, {
      ...base,
      kind: "use",
      patternId: "heading-stack",
      content: {
        eyebrow: { en: "Usage", es: "Uso" },
        title: { en: "Storage quota", es: "Cuota de almacenamiento" },
        subtitle: { en: "Remaining space", es: "Espacio restante" },
      },
    });
    expect(use.validation, use.validation.output).toMatchObject({
      valid: true,
    });
  },
  240_000,
);
