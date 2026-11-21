import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { paintIconPlaceholders } from "./paint-icons";
import { hardenInputsInHtml } from "./no-password-manager";
import type { CanvasComponent, CanvasSignature, Specimen } from "./components-canvas";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const figures = (items: Specimen[]) =>
  items.map((i) => `<figure><div class="specimen">${emitMarkup(i.tree)}</div><figcaption><code>${esc(i.label)}</code></figcaption></figure>`).join("");

/** One block of the wall: a signature of a component. Its id doubles as its fragment's file name and its size's key. */
export type CanvasBlock = { id: string; component: string; title: string; category: string; appearances: string[]; signature: CanvasSignature };

export const canvasBlocks = (components: CanvasComponent[]): CanvasBlock[] =>
  components.flatMap((c) => c.signatures.map((signature) => ({ id: `${c.id}.${signature.signature}`, component: c.id, title: signature.signature, category: c.category, appearances: c.appearances, signature })));

/** The body of one block: every value of every option and every state, one figure each. */
export function blockFragment({ signature: s }: CanvasBlock): string {
  const html = hardenInputsInHtml(`
      <div class="group"><div class="specimens">${figures([{ label: "default", tree: s.base }])}</div></div>
      ${s.groups.map((g) => `<div class="group"><p class="group__label">${esc(g.option)}</p><div class="specimens">${figures(g.specimens)}</div></div>`).join("")}`);
  // Emitted markup is indented for humans; collapsing it is about a third of the bytes and of the text nodes held in RAM.
  // Before the icons are painted: their placeholders are matched on one line.
  return paintIconPlaceholders(html.replace(/\s*\n\s*/g, " ").replace(/>\s+</g, "><").replace(/\s+>/g, ">"));
}
