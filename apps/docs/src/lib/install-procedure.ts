/*
 * The Installation section as a Procedure from the design system, not hand-written classes.
 *
 * The steps are a `UsageTree` emitted by the same emitter every other example uses. Two things a
 * tree cannot hold are carried through as markers and put back after emitting: a code block (the
 * docs' own `CodeBlock`, which highlights and copies, is an Astro component and so cannot live in the
 * tree) and prose with inline markup (`Text` escapes its children). The markers sit alone in a `Text`,
 * so the emitted markup is cut at them: HTML before, the code block, HTML after.
 */
import type { UsageTree } from "@skryensya/core/usage-tree";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import type { CodeLanguage } from "../components/CodeBlock.astro";

export type InstallBlock =
  | { kind: "html"; html: string }
  | { kind: "code"; code: string; lang: CodeLanguage; label?: string };

export interface InstallStep {
  title: string;
  blocks: InstallBlock[];
}

export type InstallChunk = { html: string } | { code: string; lang: CodeLanguage; label?: string };

const marker = (index: number) => `@@install-block-${index}@@`;

export function installProcedure(steps: InstallStep[], label: string): InstallChunk[] {
  const blocks: InstallBlock[] = [];
  const text = (block: InstallBlock): UsageTree => {
    blocks.push(block);
    return { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: marker(blocks.length - 1) };
  };

  const tree: UsageTree = {
    contract: "procedure",
    signature: "Procedure",
    attrs: { "aria-label": label },
    children: steps.map((step) => ({
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: step.title,
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: step.blocks.map(text),
        },
      },
    })),
  };

  const markup = emitMarkup(tree, { fillDefaults: false });
  const slot = /<p class="sk-text"[^>]*>\s*@@install-block-(\d+)@@\s*<\/p>/g;
  const chunks: InstallChunk[] = [];
  let from = 0;
  for (const match of markup.matchAll(slot)) {
    const block = blocks[Number(match[1])]!;
    chunks.push({ html: markup.slice(from, match.index) });
    chunks.push(block.kind === "code" ? block : { html: `<p class="sk-text" data-tone="secondary">${block.html}</p>` });
    from = match.index + match[0].length;
  }
  chunks.push({ html: markup.slice(from) });
  return chunks;
}
