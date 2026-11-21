import { contractIds, getContract } from "@skryensya/core/registry";
import type { ContractOption } from "@skryensya/core/contract";
import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { walkUsageTree } from "@skryensya/core/usage-tree";
import { entries } from "@skryensya/examples";

export type Specimen = { label: string; tree: UsageTree };
export type CanvasGroup = { option: string; specimens: Specimen[] };
export type CanvasSignature = { signature: string; base: UsageTree; groups: CanvasGroup[] };
export type CanvasComponent = { id: string; category: string; appearances: string[]; signatures: CanvasSignature[]; skipped: string[] };

/** The appearances the canvas can switch globally. `steps`' markers|segments is a layout choice, not a material, so it stays a specimen. */
export const canvasAppearances = ["plain", "tactile", "brutalist", "frosted"] as const;

const isValid = (tree: UsageTree) => validateUsageTree(tree).valid;

/* Real files from `public/`: a string option named for media must point at media, or the specimen is a broken box. */
const media: Record<string, string> = {
  src: "/demos/satin/satin-pearl-16x9.jpg",
  cover: "/audio/morning-light.svg",
  poster: "/video/sintel-poster.jpg",
  href: "#",
};
const mediaByContract: Record<string, Record<string, string>> = {
  "audio-player": { src: "/audio/morning-light.wav" },
  "video-player": { src: "/video/sintel-trailer-480p.mp4" },
};

const placeholder = (contract: string, name: string, option: ContractOption): OptionInput =>
  option.default ?? option.values?.[0] ?? (option.type === "boolean" ? true : option.type === "number" ? 1 : (mediaByContract[contract]?.[name] ?? media[name] ?? "Sample"));

/** The first node per signature, lifted out of the shipped examples, that validates on its own. Slot-heavy components get real content this way. */
const exampleSeeds = new Map<string, UsageTree>();
/** For a part that is not valid alone (a table row, an accordion item): the nearest valid ancestor in an example, shown in context. */
const ancestorSeeds = new Map<string, UsageTree>();
for (const entry of entries("en"))
  walkUsageTree(entry.tree, (node, ancestors) => {
    const key = `${node.contract}|${node.signature}`;
    if (isValid(node)) {
      if (!exampleSeeds.has(key)) exampleSeeds.set(key, node);
    } else if (!ancestorSeeds.has(key)) {
      const parent = [...ancestors].reverse().find(isValid);
      if (parent) ancestorSeeds.set(key, parent);
    }
  });

/**
 * Layout primitives are about spacing and alignment, which a page-sized example hides behind its own content. They get
 * six labelled boxes of different sizes in a box of known width, so gap, align and justify are visible at a glance.
 */
const swatchWidth: Record<string, string> = { Stack: "14rem", Inline: "32rem", Grid: "30rem" };
function swatchSeed(contract: string, signature: string): UsageTree | undefined {
  const width = swatchWidth[signature];
  if (contract !== "layout" || !width) return undefined;
  const swatch = (n: number, padding: string): UsageTree => ({ contract: "box", signature: "Box", options: { padding, surface: "surface", border: "subtle" }, children: String(n) });
  const children = (["sm", "lg", "md", "sm", "lg", "md"] as const).map((padding, i) => swatch(i + 1, padding));
  const attrs = { style: `inline-size: ${width}` };
  return [{ options: { columns: "3" } }, { options: {} }]
    .map((extra) => ({ contract, signature, ...extra, attrs, children }) as UsageTree)
    .find(isValid);
}

/** Specimens a static picture cannot explain. Listed on the page with the reason, not guessed at. */
const excluded: Record<string, string> = {
  "scroll-expand.ScrollExpand": "driven by page scroll, it needs a tall page to scroll",
  "vaul.Vaul.drawer": "an open drawer is laid out against the viewport, not against a block",
};

/** Capabilities, not the full table: an option with more values than this shows its first, its last and an even spread between. */
const MAX_VALUES = 5;
const representative = (values: readonly string[]): readonly string[] =>
  values.length <= MAX_VALUES ? values : Array.from({ length: MAX_VALUES }, (_, i) => values[Math.round((i * (values.length - 1)) / (MAX_VALUES - 1))]!);

/** Media is shown as a thumbnail: a 400px picture per value would make one component taller than the whole wall's row. */
const thumbnail: Record<string, string> = { "image-frame": "12rem" };

/** A node from the shipped examples (real content, images included) is the base; else the first generic seed that validates; none means "hand-build it". */
function seedFor(contract: string, signature: string, required: readonly string[], oneOf: readonly (readonly string[])[], optionDefs: Record<string, ContractOption>): UsageTree | undefined {
  // `exactlyOneOf` groups that name an option (ImageFrame: src | children) get that option, so media shows as media.
  const wanted = [...required, ...oneOf.flatMap((group) => (group.some((n) => required.includes(n)) ? [] : group.filter((n) => optionDefs[n]).slice(0, 1)))];
  const options = Object.fromEntries(wanted.map((name) => [name, placeholder(contract, name, optionDefs[name]!)]));
  const seeds: UsageTree[] = [
    { contract, signature, options },
    { contract, signature, options, children: "Sample" },
  ];
  return swatchSeed(contract, signature) ?? exampleSeeds.get(`${contract}|${signature}`) ?? seeds.find(isValid);
}

/** One-factor-at-a-time: every enum value of each option on top of the base, not the Cartesian product. */
let cache: CanvasComponent[] | undefined;
export function componentsCanvas(): CanvasComponent[] {
  return (cache ??= build());
}

function build(): CanvasComponent[] {
  return contractIds().flatMap((id) => {
    const contract = getContract(id);
    if (!contract) return [];
    const own = contract.options.appearance?.values ?? [];
    const appearances = own.filter((v) => (canvasAppearances as readonly string[]).includes(v));
    const out: CanvasComponent = { id, category: contract.category ?? "other", appearances, signatures: [], skipped: [] };
    for (const [signature, def] of Object.entries(contract.signatures)) {
      const why = excluded[`${id}.${signature}`];
      if (why) {
        out.skipped.push(`${signature}: ${why}`);
        continue;
      }
      const seed = seedFor(id, signature, def.requires ?? [], def.exactlyOneOf ?? [], contract.options);
      const context = seed ? undefined : ancestorSeeds.get(`${id}|${signature}`);
      if (context) {
        out.signatures.push({ signature: `${signature} (in context)`, base: context, groups: [] });
        continue;
      }
      if (!seed) {
        out.skipped.push(signature);
        continue;
      }
      // A copy: seeds are shared with the example library, which other pages read.
      const base: UsageTree = { ...seed };
      // A square photo: the satin texture used elsewhere is 16:9, grey and pale at the bottom, and reads as a broken avatar.
      if (id === "avatar" && typeof base.options?.src === "string") (base as { options?: unknown }).options = { ...base.options, src: "/demos/lightbox/coast-thumb.jpg" };
      // 3:2, not square: in a square frame cover, contain and fill are the same picture and `fit` explains nothing.
      if (id === "image-frame" && typeof base.options?.src === "string") (base as { options?: unknown }).options = { ...base.options, src: "/demos/lightbox/coast-small.jpg" };
      if (thumbnail[id]) (base as { attrs?: unknown }).attrs = { ...base.attrs, style: `inline-size: ${thumbnail[id]}` };
      const groups: CanvasGroup[] = [];
      for (const name of def.options) {
        const option = contract.options[name];
        // A global switch owns `appearance`; showing it per component would repeat the whole page four times.
        if (name === "appearance" && appearances.length) continue;
        if (option?.type !== "enum" || !option.values || option.element || option.keyOf || option.refersTo) continue;
        const specimens = representative(option.values)
          .map((value) => ({ label: value, tree: { ...base, options: { ...base.options, [name]: value } } }))
          .filter((s) => isValid(s.tree));
        if (specimens.length) groups.push({ option: name, specimens });
      }
      // Boolean options are states (disabled, loading, pressed, open...): the one value the base is not in.
      const states = def.options.flatMap((name): Specimen[] => {
        const option = contract.options[name];
        if (option?.type !== "boolean" || option.element || option.keyOf || option.refersTo) return [];
        const tree = { ...base, options: { ...base.options, [name]: option.default !== true } };
        return isValid(tree) ? [{ label: option.default === true ? `${name}: false` : name, tree }] : [];
      });
      if (states.length) groups.push({ option: "states", specimens: states });
      out.signatures.push({ signature, base, groups });
    }
    return out.signatures.length || out.skipped.length ? [out] : [];
  });
}
