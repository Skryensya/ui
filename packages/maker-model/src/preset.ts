import type { ComponentContract, ContractOption, ContractSignature, ContractSlot } from "@skryensya/core/contract";
import { contractIds, getContract, getSignature } from "@skryensya/core/registry";
import type { ItemInput, OptionInput } from "@skryensya/core/usage-tree";
import type { MakerNode, MakerSlot } from "./node.js";
import type { IdFactory } from "./project.js";
import { resolve, type SignatureRef } from "./structure.js";

/*
 * THE PRESET: what a signature is inserted as. Generated from the contract, so a signature added to
 * the catalogue is insertable without touching the Maker: every option left at its default, then
 * the least that satisfies each stated constraint (a required option, one of an exactly-one group,
 * one of an at-least-one group, what those imply) and a placeholder in each required slot that
 * takes text or entries.
 *
 * A required slot that takes NODES is left empty on a layout signature: an empty Stack is pending,
 * with a drop zone where its children go, which is the honest state of a container nobody has
 * filled yet. On any other signature it gets a text run, because a Heading with nothing in it is
 * not a container waiting for children.
 */

export function presetFor(ref: SignatureRef, newId: IdFactory): MakerNode | undefined {
  return presetForInner(ref, newId, 0, []);
}

function presetForInner(ref: SignatureRef, newId: IdFactory, depth: number, stack: readonly string[]): MakerNode | undefined {
  const resolved = resolve(ref);
  if (!resolved) return undefined;
  const { contract, signature } = resolved;
  const options: Record<string, OptionInput> = {};
  const slots: Record<string, MakerSlot> = {};
  const layout = contract.category === "layout";

  const give = (name: string, prefer?: "non-default") => {
    if (name in options || name in slots) return;
    const option = signature.options.includes(name) ? contract.options[name] : undefined;
    if (option) {
      options[name] = sampleValue(option, name, ref.signature, prefer);
      return;
    }
    const slot = signature.slots[name];
    if (slot) slots[name] = sampleSlot(slot, ref, layout, newId, depth, stack);
  };

  for (const name of signature.requires ?? []) give(name);
  for (const group of signature.exactlyOneOf ?? []) {
    if (!group.some((name) => name in options || name in slots) && group[0]) give(group[0]);
  }
  for (const group of signature.atLeastOneOf ?? []) {
    if (!group.some((name) => name in options || name in slots) && group[0]) give(group[0], "non-default");
  }
  for (const [key, implied] of Object.entries(signature.implies ?? {})) {
    const name = key.split("=")[0]!;
    if (name in options || name in slots) for (const each of implied) give(each.split("=")[0]!);
  }
  for (const [name, slot] of Object.entries(signature.slots)) {
    if (name in slots) continue;
    if (slot.required || slot.accepts === "text" || slot.accepts === "items" || slot.accepts === "signature") {
      slots[name] = sampleSlot(slot, ref, layout, newId, depth, stack);
    }
  }
  addDisplayDefaults(contract, signature, options, slots, ref, newId, depth, stack);

  return { id: newId(), contract: ref.contract, signature: ref.signature, ...(Object.keys(options).length ? { options } : {}), slots };
}

function sampleValue(option: ContractOption, name: string, signature: string, prefer?: "non-default"): OptionInput {
  if (option.type === "enum") {
    const values = (option.values ?? []).filter((value) => !(option.deprecatedValues && value in option.deprecatedValues));
    if (prefer === "non-default") return values.find((value) => value !== option.default) ?? values[0] ?? "";
    return (option.default as string | undefined) ?? values[0] ?? "";
  }
  if (option.type === "boolean") return prefer === "non-default" ? true : ((option.default as boolean | undefined) ?? true);
  if (option.type === "number") return (option.default as number | undefined) ?? option.min ?? 1;
  if (option.pattern) return option.pattern.example;
  if (option.default !== undefined) return String(option.default);
  if (name === "href" || name.endsWith("Href")) return "#";
  if (name === "src" || name.endsWith("Src")) return sampleImageSrc;
  if (/id$/i.test(name)) return `${kebab(signature)}-1`;
  return humanize(signature);
}

function sampleSlot(
  slot: ContractSlot,
  ref: SignatureRef,
  layout: boolean,
  newId: IdFactory,
  depth: number,
  stack: readonly string[],
): MakerSlot {
  if (slot.accepts === "text") return { kind: "text", text: humanize(ref.signature) };
  if (slot.accepts === "items") {
    const count = Math.max(slot.minItems ?? 1, 1);
    return { kind: "items", items: Array.from({ length: count }, (_, i) => sampleItem(slot, i + 1)) };
  }
  if (slot.accepts === "signature") {
    const count = Math.max(slot.minItems ?? 1, 1);
    const children = Array.from({ length: count }, (_, i) => sampleSignatureChild(slot, ref, newId, depth, stack, i + 1)).filter(
      (child): child is MakerNode => Boolean(child),
    );
    return { kind: "nodes", children };
  }
  if (slot.accepts === "node") return { kind: "nodes", children: [{ id: newId(), text: humanize(ref.signature) }] };
  return { kind: "nodes", children: [] };
}

function sampleSignatureChild(
  slot: ContractSlot,
  ref: SignatureRef,
  newId: IdFactory,
  depth: number,
  stack: readonly string[],
  n: number,
): MakerNode | undefined {
  if (depth > 3) return undefined;
  const signatures = slot.of ?? [];
  const signature = signatures.find((candidate) => !stack.includes(`${ref.contract}/${candidate}`)) ?? signatures[0];
  if (!signature) return undefined;
  const childRef = resolveChildRef(ref.contract, signature);
  if (!childRef) return undefined;
  const child = presetForInner(childRef, newId, depth + 1, [...stack, `${ref.contract}/${ref.signature}`]);
  if (child && slot.uniqueChildOption) return { ...child, options: { ...child.options, [slot.uniqueChildOption]: `item-${n}` } };
  return child;
}

function resolveChildRef(contract: string, signature: string): SignatureRef | undefined {
  const local = getContract(contract);
  if (local && getSignature(local, signature)) return { contract, signature };
  for (const id of contractIds()) {
    const candidate = getContract(id);
    if (candidate && getSignature(candidate, signature)) return { contract: id, signature };
  }
  return undefined;
}

function addDisplayDefaults(
  contract: ComponentContract,
  signature: ContractSignature,
  options: Record<string, OptionInput>,
  slots: Record<string, MakerSlot>,
  ref: SignatureRef,
  newId: IdFactory,
  depth: number,
  stack: readonly string[],
) {
  for (const name of signature.options) {
    if (name in options) continue;
    const option = contract.options[name];
    if (!option) continue;
    if (option.type === "number" && /^(value|progress|percent|rating|count|total)$/i.test(name)) {
      options[name] = numberDisplayValue(option);
    }
    if (option.type === "boolean" && /^(checked|selected|expanded|open|active|current)$/i.test(name)) {
      options[name] = true;
    }
    if (option.type === "enum" && /^variant$/i.test(name)) {
      const values = (option.values ?? []).filter((value) => !(option.deprecatedValues && value in option.deprecatedValues));
      const visual = values.find((value) => /accent|primary|filled|solid/i.test(value));
      if (visual && visual !== option.default) options[name] = visual;
    }
  }
  for (const [name, slot] of Object.entries(signature.slots)) {
    if (name in slots) continue;
    if (slot.accepts === "node" && /(children|content|body|label|title|description|caption|actions)$/i.test(name)) {
      slots[name] = { kind: "nodes", children: [{ id: newId(), text: humanize(ref.signature) }] };
    }
    if (slot.accepts === "signature" && /(children|content|body|actions|icon|logo|caption)$/i.test(name)) {
      slots[name] = sampleSlot(slot, ref, false, newId, depth, stack);
    }
  }
}

function numberDisplayValue(option: ContractOption): number {
  const min = option.min ?? 0;
  const max = option.max ?? 100;
  if (Number.isFinite(min) && Number.isFinite(max) && max > min) return Math.round(min + (max - min) * 0.6);
  return Math.max(1, min);
}

const sampleImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%2384cc16'/%3E%3Cstop offset='1' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' rx='32' fill='url(%23g)'/%3E%3Ccircle cx='95' cy='92' r='34' fill='white' fill-opacity='.85'/%3E%3Cpath d='M44 246 154 136l72 72 48-48 82 86z' fill='white' fill-opacity='.78'/%3E%3C/svg%3E";

function sampleItem(slot: ContractSlot, n: number): ItemInput {
  const item = slot.item;
  const options: Record<string, OptionInput> = {};
  const slots: Record<string, string> = {};
  /* The key tells entries apart, so each one gets its own value: the nth of an enum, `item-n` else. */
  const key = item?.key ? item.options[item.key] : undefined;
  if (item?.key && key) options[item.key] = key.type === "enum" ? (key.values?.[n - 1] ?? key.values?.[0] ?? "") : `item-${n}`;
  for (const name of item?.requires ?? []) {
    const option = item?.options[name];
    if (option && !(name in options)) options[name] = option.type === "number" ? n : sampleValue(option, name, `Item ${n}`);
    else if (item?.slots[name]) slots[name] = `Item ${n}`;
  }
  for (const [name, entrySlot] of Object.entries(item?.slots ?? {})) {
    if (entrySlot.required && !(name in slots)) slots[name] = `Item ${n}`;
  }
  return { ...(Object.keys(options).length ? { options } : {}), slots };
}

/**
 * A readable placeholder from a signature id. `Accordion.Item` reads as "Item", but a lowercase
 * suffix is a variant, not a name: `Button.action` reads as "Button".
 */
function humanize(signature: string): string {
  const parts = signature.split(".");
  const last = parts.at(-1) ?? signature;
  const name = /^[a-z]/.test(last) && parts.length > 1 ? parts[0]! : last;
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function kebab(signature: string): string {
  return signature.replace(/\./g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
