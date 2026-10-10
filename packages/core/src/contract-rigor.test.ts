import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ComponentContract, ContractOption, ContractSignature } from "./contract.js";
import { contracts } from "./registry.js";

/*
 * THE RIGOR OF A CONTRACT, asserted from the contract itself and from the files that must agree with it.
 *
 * The compiler already refuses a contract whose hooks, surface or semantics are broken, and the docs registries refuse a page
 * nobody listed. What neither can see is the agreement BETWEEN the layers of one component: that every part it names is drawn
 * by some template (and every part a template draws is named), that an enum's default is one of its values, that the React
 * import path is a real export, that the semantic overlay points at signatures that exist, that both bindings have tests and
 * both locales have a page, and that the docs table of parts and hooks lists the contract's, no more and no fewer.
 *
 * It is a ratchet, not a census: the components named in `AUDITED` are held to every check below and a violation fails the
 * build with the contract and the rule; the older ones are not audited here yet, and adding one to the list is how it joins.
 */

/*
 * PARTS THE PAGE COMPOSES. A part can be named in `parts` for a consumer to author (the stylesheet styles it) without any
 * template drawing it: ImageCropper's side column is empty by design and a page puts its preview, its sliders and its
 * actions there, wearing the cropper's classes. `systemOwned` is the opposite (the binding draws it, an author never writes
 * it in a tree), so it cannot say this; this list can, and a part missing from both is a defect.
 */
const PAGE_COMPOSED: Readonly<Record<string, readonly string[]>> = {
  "image-cropper": ["preview", "previewCanvas", "range", "output", "ratioInput", "actions"],
};

/*
 * KNOWN GAPS, each with its reason and an owner who can close it. A gap listed here is not forgiven: it is the one place the
 * ratchet is told, in writing, what is still to do, and an entry whose rule now passes fails the build until it is deleted.
 */
const KNOWN_GAPS: Readonly<Record<string, readonly { rule: string; reason: string }[]>> = {
  "scroll-hint": [
    { rule: "[docs]", reason: "the component has no documentation page yet (page, both routes, parts and hooks tables)" },
    { rule: "[gates]", reason: "no browser spec yet" },
  ],
  "audio-player": [
    { rule: "[tests] no vanilla test", reason: "the vanilla binding has no test file yet" },
    { rule: "[docs] the parts table leaves out", reason: "the page's parts table lists the main parts, not the thirty the template draws" },
    { rule: "[docs] the hooks table leaves out", reason: "--sk-audio-player-volume-pad is not in the page's hooks table yet" },
  ],
  "dock": [
    { rule: "[docs]", reason: "the page has no parts table and no hooks table yet" },
  ],
  "dialog-stack": [
    { rule: "[docs]", reason: "the page has no parts table and no hooks table yet" },
  ],
};

const AUDITED = [
  "audio-player",
  "compare-slider",
  "dialog-stack",
  "dock",
  "image-cropper",
  "morph-stack",
  "scroll-expand",
  "scroll-hint",
  "video-player",
] as const;

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (path: string): string => (existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : "");
const exists = (path: string) => existsSync(join(root, path));

type Semantics = Record<string, { useWhen: string[]; avoidWhen: string[]; alternatives: string[] }>;

/*
 * The overlay is read from its own YAML, not from the compiled manifest: the manifest is an artifact that only exists after a
 * successful compile, and an audit that went stale (or silently empty) whenever another component's changelog was mid-edit
 * would be one nobody trusts. The format is three levels of two-space indent: a signature, one of `useWhen` / `avoidWhen` /
 * `alternatives`, and `- ` items.
 */
function overlayOf(id: string): Semantics {
  const out: Semantics = {};
  let signature = "";
  let list: keyof Semantics[string] | "" = "";
  const unquote = (item: string) => item.trim().replace(/^["']|["']$/g, "");
  /* `[a, "b, c"]`: split on the commas that are not inside quotes. */
  const flow = (text: string): string[] => {
    const items: string[] = [];
    let current = "";
    let quote = "";
    for (const ch of text.slice(1, -1)) {
      if (quote) {
        if (ch === quote) quote = "";
        current += ch;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
        current += ch;
      } else if (ch === ",") {
        items.push(current);
        current = "";
      } else current += ch;
    }
    if (current.trim()) items.push(current);
    return items.map(unquote).filter(Boolean);
  };
  for (const raw of read(`contracts/semantic/${id}.yaml`).split("\n")) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    if (indent === 0 && line.endsWith(":")) {
      signature = line.slice(0, -1);
      out[signature] = { useWhen: [], avoidWhen: [], alternatives: [] };
      list = "";
    } else if (indent === 2 && signature) {
      const key = line.slice(0, line.indexOf(":")) as keyof Semantics[string];
      const rest = line.slice(line.indexOf(":") + 1).trim();
      list = key;
      if (rest.startsWith("[")) out[signature]![key].push(...flow(rest));
    } else if (line.startsWith("- ") && signature && list) {
      out[signature]![list].push(unquote(line.slice(2)));
    }
  }
  return out;
}

const allSignatureNames = new Set(Object.values(contracts).flatMap((contract) => Object.keys((contract as ComponentContract).signatures)));

const pkg = (name: string): { exports: Record<string, unknown> } => JSON.parse(read(`packages/${name}/package.json`));
const exportsOf = Object.fromEntries(["core", "react", "vanilla"].map((name) => [name, new Set(Object.keys(pkg(name).exports))]));

import { readdirSync } from "node:fs";

/** Every source file of the three layers, read once: where a mount attribute or an event name may legitimately live. */
const sourceDirs = ["packages/core/src", "packages/vanilla/src/components", "packages/react/src/components"];
const sourceFiles = sourceDirs.flatMap((dir) =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir))
        .filter((file) => /\.(ts|tsx|svelte)$/.test(file) && !/\.test\./.test(file))
        .map((file) => ({ dir, file, text: readFileSync(join(root, dir, file), "utf8") }))
    : [],
);
const mentionedInSource = (needle: string, dirs: readonly string[] = sourceDirs) => sourceFiles.some((entry) => dirs.includes(entry.dir) && entry.text.includes(needle));

const camel = (kebab: string) => kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** The docs route a contract is shown at: its own id, unless the page was renamed (`file-upload` is `drop-zone`). */
const pageName: Record<string, string> = { "file-upload": "drop-zone" };

function problemsOf(id: string): string[] {
  const contract = (contracts as Record<string, ComponentContract>)[id];
  if (!contract) return [`${id}: not in the registry`];
  const out: string[] = [];
  const bad = (rule: string, detail: string) => out.push(`${id} [${rule}] ${detail}`);
  const signatures = Object.entries(contract.signatures) as [string, ContractSignature][];
  const options = contract.options as Record<string, ContractOption>;
  const parts = contract.parts as Record<string, string>;
  const json = JSON.stringify(contract.signatures);

  /* ---- parts: the names and the markup agree ---- */
  const drawn = new Set([...json.matchAll(/"part":"([A-Za-z0-9]+)"/g)].map((match) => match[1]!));
  const owned = new Set((contract as { systemOwned?: readonly string[] }).systemOwned ?? []);
  for (const name of drawn) if (!(name in parts)) bad("parts", `a template draws "${name}", which \`parts\` does not name`);
  const composed = new Set(PAGE_COMPOSED[id] ?? []);
  for (const name of Object.keys(parts)) {
    if (!drawn.has(name) && !owned.has(name) && !composed.has(name)) bad("parts", `"${name}" is named in \`parts\` but no template draws it, it is not \`systemOwned\`, and the page is not said to compose it`);
    if (drawn.has(name) && composed.has(name)) bad("parts", `"${name}" is said to be composed by the page but a template draws it`);
  }
  for (const [name, cls] of Object.entries(parts)) {
    if (!/^sk-[a-z0-9-]+(__[a-z0-9-]+)?$/.test(cls)) bad("parts", `"${name}" is "${cls}", not a BEM block or element`);
    if (!cls.startsWith(`sk-${id}`)) bad("parts", `"${name}" is "${cls}", which does not belong to the family (sk-${id})`);
  }

  /* ---- options: each one is writable and its default is true to its type ---- */
  for (const [name, option] of Object.entries(options)) {
    const where = `option "${name}"`;
    const asText = json.includes(`"textFromOption":"${name}"`);
    const computed = Boolean((option as { computedInput?: boolean }).computedInput);
    if (!option.attr && !option.prop && !option.styleProperty && !option.element && !asText && !computed) bad("options", `${where} has no attr, prop, styleProperty or element and no node takes it as its text: nothing writes it`);
    if (option.type === "enum") {
      if (!option.values?.length) bad("options", `${where} is an enum with no values`);
      else if (option.default !== undefined && !option.values.includes(String(option.default))) bad("options", `${where} defaults to "${option.default}", which is not one of ${option.values.join(", ")}`);
      if (new Set(option.values).size !== option.values?.length) bad("options", `${where} lists a value twice`);
    }
    if (option.type === "boolean" && option.default !== undefined && typeof option.default !== "boolean") bad("options", `${where} is a boolean that defaults to ${JSON.stringify(option.default)}`);
    if (option.type === "number") {
      const o = option as ContractOption & { min?: number; max?: number };
      if (option.default !== undefined && typeof option.default !== "number") bad("options", `${where} is a number that defaults to ${JSON.stringify(option.default)}`);
      if (typeof option.default === "number" && o.min !== undefined && option.default < o.min) bad("options", `${where} defaults below its min`);
      if (typeof option.default === "number" && o.max !== undefined && option.default > o.max) bad("options", `${where} defaults above its max`);
    }
    if (option.type === "string" && option.default !== undefined && typeof option.default !== "string") bad("options", `${where} is a string that defaults to ${JSON.stringify(option.default)}`);
    const used = signatures.some(([, signature]) => (signature.options as readonly string[]).includes(name));
    if (!used) bad("options", `${where} is declared but no signature lists it`);
  }

  for (const [signatureName, signature] of signatures) {
    const at = `${signatureName}`;
    for (const name of signature.options as readonly string[]) if (!(name in options)) bad("signature", `${at} lists option "${name}", which the contract does not declare`);
    for (const key of ["requires", "forbids"] as const) {
      for (const name of ((signature as unknown as Record<string, readonly string[] | undefined>)[key] ?? [])) if (!(name in options) && !(name in signature.slots)) bad("signature", `${at}.${key} names "${name}", which is neither an option nor a slot`);
    }
    for (const group of (signature as { exactlyOneOf?: readonly (readonly string[])[] }).exactlyOneOf ?? []) {
      for (const name of group) if (!(name in options) && !(name in signature.slots)) bad("signature", `${at}.exactlyOneOf names "${name}", which is neither an option nor a slot`);
    }
    for (const [key, list] of Object.entries(signature.excludes ?? {})) {
      for (const name of [key, ...list]) if (!(name.split("=")[0]! in options) && !(name in signature.slots)) bad("signature", `${at}.excludes names "${name}", which is neither an option nor a slot`);
    }
    /* A part of a compound (DialogStackTitle inside DialogStack) is found through its root, so it owes less than the root does. */
    const child =
      Boolean((signature as { parents?: readonly string[] }).parents?.length) ||
      signatureName.includes(".") ||
      signatures.some(([other]) => other !== signatureName && signatureName.startsWith(other));
    const intent = (signature as { intent?: readonly string[] }).intent ?? [];
    if (intent.length < (child ? 1 : 3)) bad("intent", `${at} has ${intent.length} intents; an agent finds a signature by them, so give at least ${child ? "one" : "three"}`);
    for (const word of intent) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(word)) bad("intent", `${at}: "${word}" is not kebab-case`);
    if (new Set(intent).size !== intent.length) bad("intent", `${at} repeats an intent`);
    if (!signature.host?.element) bad("signature", `${at} has no host element`);
    /* `forward` is deliberately not demanded: absent means the host's attributes stay open (the catalogue default), and declaring it is an opt-in tightening. */

    /* ---- the bindings: a real import path, in both places the tree renderer looks ---- */
    const from = signature.react.from;
    const subpath = from.replace("@skryensya/react", ".");
    if (!exportsOf.react!.has(subpath)) bad("react", `${at}: ${from} is not an export of @skryensya/react`);
    if (!read("packages/react/src/render-tree.tsx").includes(`"${from}"`)) bad("react", `${at}: ${from} is not in the tree renderer's import map`);
    if (signature.mount) {
      /* Registered in the auto-loader, or mounted by a parent's enhancer (a sidebar's trigger): either way the attribute lives in vanilla code. */
      const registered = read("packages/vanilla/src/runtime/registry.ts").includes(signature.mount) || mentionedInSource(signature.mount, ["packages/vanilla/src/components"]) || exists(`packages/vanilla/src/components/${id}.ts`);
      if (!registered) bad("vanilla", `${at}: mount [${signature.mount}] is mounted by nothing in @skryensya/vanilla`);
      if (exists(`packages/vanilla/src/components/${id}.ts`)) {
        if (!exportsOf.vanilla!.has(`./${id}`)) bad("vanilla", `./${id} is not an export of @skryensya/vanilla`);
        if (!exists(`packages/vanilla/src/components/${id}.test.ts`)) bad("tests", `no vanilla test (packages/vanilla/src/components/${id}.test.ts)`);
      }
    }

    /* ---- the semantic overlay: why you would choose it, pointing at real alternatives ---- */
    const semantics = overlayOf(id)[signatureName];
    if (!semantics) bad("semantics", `${at} has no entry in the semantic overlay`);
    else {
      const owed = child ? 1 : 2;
      if ((semantics.useWhen?.length ?? 0) < owed) bad("semantics", `${at} gives ${semantics.useWhen?.length ?? 0} useWhen; give at least ${owed}`);
      if ((semantics.avoidWhen?.length ?? 0) < owed) bad("semantics", `${at} gives ${semantics.avoidWhen?.length ?? 0} avoidWhen; give at least ${owed}`);
      if (!child && !semantics.alternatives?.length) bad("semantics", `${at} names no alternatives`);
      for (const name of semantics.alternatives ?? []) {
        if (name === signatureName) bad("semantics", `${at} lists itself as an alternative`);
        else if (!allSignatureNames.has(name)) bad("semantics", `${at}: alternative "${name}" is not a signature`);
      }
    }
  }

  /* ---- accessibility: a control a reader lands on is named, by the contract and not by luck ---- */
  const NAMED_ROLES = new Set(["slider", "group", "separator", "region", "toolbar", "tablist", "radiogroup", "listbox", "tree", "grid"]);
  for (const [signatureName, signature] of signatures) {
    const walk = (node: Record<string, unknown>, host: boolean) => {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      const role = attrs.role;
      /* A separator is a control only when it takes focus (a resize handle); a menu's divider is decoration and names nothing. */
      if (role && NAMED_ROLES.has(role) && (role !== "separator" || "tabindex" in attrs)) {
        const nodeOptions = (node.options ?? []) as readonly string[];
        const named =
          "aria-label" in attrs ||
          "aria-labelledby" in attrs ||
          nodeOptions.some((name) => ["aria-label", "aria-labelledby"].includes(options[name]?.attr ?? "")) ||
          /* The host takes every option no other node claims, so a signature's own `label` option names it. */
          (node.host === true && (signature.options as readonly string[]).some((name) => ["aria-label", "aria-labelledby"].includes(options[name]?.attr ?? ""))) ||
          ((node.attrsFor ?? []) as readonly string[]).some((name) => name.startsWith("aria-")) ||
          (node.host === true && ((signature.forward ?? []) as readonly string[]).includes("aria-*")) ||
          Boolean((contract.a11y ?? []).some((rule) => rule.signatures?.includes(signatureName)));
        if (!named) bad("a11y", `${signatureName}: a node with role="${role}" has no accessible name (give it an aria-label option, forward aria-*, or state an \`a11y\` rule)`);
      }
      for (const child of (node.children ?? []) as Record<string, unknown>[]) walk(child, false);
    };
    walk(signature.template as unknown as Record<string, unknown>, true);
  }

  /* ---- events: every one the contract declares is dispatched by something, in any of the three layers ---- */
  const events = ((contract as { events?: Record<string, string> }).events ?? {}) as Record<string, string>;
  if (Object.keys(events).length > 0) {
    for (const [key, name] of Object.entries(events)) {
      const dispatched = mentionedInSource(`"${name}"`) || mentionedInSource(`Events.${key}`) || mentionedInSource(`events.${key}`);
      if (!dispatched) bad("events", `${key} ("${name}") is declared but nothing dispatches it`);
    }
  }

  /* ---- the files that must exist beside the contract ---- */
  for (const [layer, path] of [
    ["core export", exportsOf.core!.has(`./${id}`) ? "ok" : ""],
    ["css", contract.css ? "ok" : ""],
  ] as const) if (!path) bad("files", `${layer} is missing`);
  if (!exists(`packages/core/src/${id}.ts`)) bad("files", `packages/core/src/${id}.ts is missing`);
  if (!exists(`packages/core/css/components/${id}.css`)) bad("files", `packages/core/css/components/${id}.css is missing`);
  if (!exists(`packages/react/src/components/${id}.tsx`)) bad("files", `the React component is missing`);
  if (!exists(`packages/react/src/components/${id}.test.tsx`)) bad("tests", `no React test (packages/react/src/components/${id}.test.tsx)`);
  if (!exists(`contracts/semantic/${id}.yaml`)) bad("files", `contracts/semantic/${id}.yaml is missing`);
  const changelog = read(`contracts/changelog/${id}.yaml`);
  if (!changelog) bad("files", `contracts/changelog/${id}.yaml is missing`);
  else {
    const entries = changelog.split(/\n {2}- date:/).length - 1;
    const es = (changelog.match(/\n {4}es:\n/g) ?? []).length;
    const en = (changelog.match(/\n {4}en:\n/g) ?? []).length;
    if (entries < 1) bad("changelog", "has no entries");
    if (es !== entries || en !== entries) bad("changelog", `${entries} entries but ${es} Spanish and ${en} English halves`);
  }
  const trees = read("packages/ai-gates/src/trees.ts");
  if (!trees.includes(`contract: "${id}"`) && !trees.includes(`name: "${id}/`)) bad("gates", "no canonical usage tree in packages/ai-gates/src/trees.ts");
  if (!exists(`packages/ai-gates/src/${id}.spec.ts`)) bad("gates", `no browser spec (packages/ai-gates/src/${id}.spec.ts)`);

  /* ---- the docs: both locales, and the tables list what the contract has ---- */
  const route = pageName[id] ?? id;
  if (!exists(`apps/docs/src/pages/components/${route}.astro`)) bad("docs", `no English page (apps/docs/src/pages/components/${route}.astro)`);
  if (!exists(`apps/docs/src/pages/es/componentes/${route}.astro`)) bad("docs", `no Spanish page (apps/docs/src/pages/es/componentes/${route}.astro)`);
  const pageFile = `apps/docs/src/components/pages/${camel(route).replace(/^./, (c) => c.toUpperCase())}Page.astro`;
  const page = read(pageFile);
  if (!page) bad("docs", `${pageFile} is missing`);
  else {
    const partOrder = page.match(/const partOrder = \[([^\]]*)\]/)?.[1];
    if (partOrder) {
      const listed = [...partOrder.matchAll(/"([A-Za-z0-9]+)"/g)].map((match) => match[1]!);
      for (const name of listed) if (!(name in parts)) bad("docs", `the parts table lists "${name}", which the contract does not name`);
      for (const name of Object.keys(parts)) if (!listed.includes(name) && !owned.has(name)) bad("docs", `the parts table leaves out "${name}" (list it, or mark it \`systemOwned\` if no author ever writes it)`);
    } else bad("docs", "the page has no `partOrder` table of parts");
    const hookNames = (contract.hooks as readonly string[]).filter((hook) => !((contract as { outputHooks?: readonly string[] }).outputHooks ?? []).includes(hook));
    const listedHooks = new Set([...page.matchAll(/^\s*\["([a-z0-9-]+)",/gm)].map((match) => `--sk-${id}-${match[1]}`));
    for (const hook of hookNames) if (!listedHooks.has(hook)) bad("docs", `the hooks table leaves out ${hook}`);
    for (const hook of listedHooks) if (!(contract.hooks as readonly string[]).includes(hook)) bad("docs", `the hooks table lists ${hook}, which the contract does not declare`);
  }

  /* ---- hygiene ---- */
  const source = read(`packages/core/src/${id}.ts`);
  if (/\u2014/.test(source)) bad("hygiene", "an em dash in the contract source (CONTRIBUTING: use a comma, a colon or a spaced hyphen)");
  /* A family may publish the hooks of a family it composes (Breadcrumb carries Menu's), so only a repeat is a defect, never a foreign prefix. */
  if (new Set(contract.hooks as readonly string[]).size !== (contract.hooks as readonly string[]).length) bad("hooks", "a hook is listed twice");
  return out;
}

/*
 * THE RULES EVERY CONTRACT MEETS. These are the ones whose violation is a defect rather than a missing nicety: an option nothing
 * writes, an enum default that is not a value, a React path that is not an export, a mount nothing attaches, an event nobody
 * dispatches, a focusable control with no name, an alternative that is not a signature. They hold for the whole catalogue today
 * (the pass that wrote this fixed what it found), so a new contract that breaks one fails here, with no list to join.
 *
 * Deliberately NOT here, because the older components do not meet them and the cost of meeting them is writing, not fixing:
 * a docs table of every part and hook, a browser spec per component, three intents and two reasons per signature, a test file per
 * binding. Those are held to the audited components below, and a component joins that list when its page and specs are done.
 */
const UNIVERSAL = /\[(options|react|vanilla|a11y|events)\]|\[hooks\] a hook is listed twice|\[semantics\][^\n]*(alternative|itself)|\[signature\]|\[parts\][^\n]*does not name/;

describe("the rules every contract meets", () => {
  for (const id of Object.keys(contracts)) {
    it(`${id}`, () => {
      expect(problemsOf(id).filter((problem) => UNIVERSAL.test(problem))).toEqual([]);
    });
  }
});

describe("the rigor of a contract", () => {
  for (const id of AUDITED) {
    const gaps = KNOWN_GAPS[id] ?? [];
    const found = problemsOf(id);
    const open = found.filter((problem) => !gaps.some((gap) => problem.includes(` ${gap.rule}`) || problem.includes(`${gap.rule}`)));

    it(`${id} agrees with its own markup, bindings, overlay, tests and docs`, () => {
      expect(open).toEqual([]);
    });

    for (const gap of gaps) {
      it(`${id}: the known gap "${gap.rule}" is still open (${gap.reason})`, () => {
        expect(found.some((problem) => problem.includes(gap.rule)), "this gap is closed: delete its entry from KNOWN_GAPS").toBe(true);
      });
    }
  }
});

export { problemsOf };
