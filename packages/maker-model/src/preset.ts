import type { ContractOption, ContractSlot } from "@skryensya/core/contract";
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
    if (slot) slots[name] = sampleSlot(slot, ref.signature, layout, newId);
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
    if (slot.required) slots[name] = sampleSlot(slot, ref.signature, layout, newId);
    else if (slot.accepts === "node" || slot.accepts === "signature") slots[name] = { kind: "nodes", children: [] };
  }

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
  if (name === "src" || name.endsWith("Src")) return "";
  if (/id$/i.test(name)) return `${kebab(signature)}-1`;
  return humanize(signature);
}

function sampleSlot(slot: ContractSlot, signature: string, layout: boolean, newId: IdFactory): MakerSlot {
  if (slot.accepts === "text") return { kind: "text", text: humanize(signature) };
  if (slot.accepts === "items") {
    const count = Math.max(slot.minItems ?? 1, 1);
    return { kind: "items", items: Array.from({ length: count }, (_, i) => sampleItem(slot, i + 1)) };
  }
  if (slot.accepts === "node" && !layout) return { kind: "nodes", children: [{ id: newId(), text: humanize(signature) }] };
  return { kind: "nodes", children: [] };
}

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
