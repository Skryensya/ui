import { signatureOptions, type ContractOption } from "@skryensya/core/contract";
import { getContract, getSignature } from "@skryensya/core/registry";
import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";

/*
 * CONTROLS FOR ANY TREE STORY: the root's own options, read off its contract the way the docs' property cards read
 * them (`UsagePreview`), so a new option or value shows up here without an edit. An enum is a select, a boolean a
 * switch, a string a text field. The args ARE the root's options, so the render, the code panel and the contract's
 * validation all see the same tree.
 */
type ArgType = { control: "select" | "boolean" | "text" | "number"; options?: readonly string[]; table: { category: string } };

function rootOptions(tree: UsageTree): [string, ContractOption][] {
  const contract = getContract(tree.contract);
  const signature = contract && getSignature(contract, tree.signature);
  return contract && signature ? [...signatureOptions(contract, signature)] : [];
}

/* A string option can borrow another contract's enum (`valuesFrom`): `triggerVariant` is Button's `variant`. */
function enumOf(option: ContractOption): ContractOption | undefined {
  if (option.type === "enum") return option;
  const from = option.valuesFrom;
  const borrowed = from ? getContract(from.contract)?.options?.[from.option] : undefined;
  return borrowed?.type === "enum" ? borrowed : undefined;
}

export function rootControls(tree: UsageTree): { args: Record<string, unknown>; argTypes: Record<string, ArgType> } {
  const args: Record<string, unknown> = {};
  const argTypes: Record<string, ArgType> = {};
  for (const [name, option] of rootOptions(tree)) {
    const choices = enumOf(option);
    const table = { category: "Options" };
    if (choices?.values) argTypes[name] = { control: "select", options: choices.values, table };
    else if (option.type === "boolean") argTypes[name] = { control: "boolean", table };
    else if (option.type === "string") argTypes[name] = { control: "text", table };
    else if (option.type === "number") argTypes[name] = { control: "number", table };
    else continue;
    const initial = tree.options?.[name] ?? option.default ?? choices?.default;
    if (initial !== undefined) args[name] = initial;
  }
  return { args, argTypes };
}

/** The tree with the args that differ from what it already says written into its root's options. */
export function withRootOptions(tree: UsageTree, args: Record<string, unknown>): UsageTree {
  const options: Record<string, OptionInput> = { ...tree.options };
  for (const [name, option] of rootOptions(tree)) {
    if (!(name in args) || args[name] === undefined) continue;
    const base = tree.options?.[name] ?? option.default ?? enumOf(option)?.default;
    if (args[name] !== base) options[name] = args[name] as OptionInput;
  }
  return { ...tree, options };
}
