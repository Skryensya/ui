import { useEffect, useId, useState } from "react";
import type { ComponentContract, ContractOption } from "@skryensya/core/contract";
import type { ItemInput, OptionInput } from "@skryensya/core/usage-tree";
import { Button } from "@skryensya/react/button";
import { Toolbar } from "@skryensya/react/toolbar";
import { FormField } from "@skryensya/react/form-field";
import { Input, Textarea } from "@skryensya/react/input";
import { Select } from "@skryensya/react/select";
import { Switch } from "@skryensya/react/switch";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import {
  applyAll,
  childrenOf,
  findChild,
  isNode,
  layoutRole,
  locate,
  presetFor,
  problemsOf,
  randomId,
  reidentify,
  resolve,
  slotOf,
  type MakerNode,
  type Operation,
} from "@skryensya/maker-model";
import { wrapIn, type Gesture } from "./actions";
import { PageSettings } from "./Pages";
import { IconButton } from "./IconButton";
import { glyphFor } from "./icons";
import type { Maker } from "./state";
import { outlineLabel } from "./Outline";
import { Details } from "@skryensya/react/details";

/** `Button.action` is a Button of the "action" kind; the Inspector names the thing and says the kind beneath. */
const variantOf = (signature: string) => signature.split(".").slice(1).join(" ") || undefined;

/*
 * THE INSPECTOR shows what decision 31 says exists for a node, and nothing else: which signature it
 * is, what it is to its parent (never an x or a y), the options its contract declares, the child
 * attributes its PARENT publishes, and what its slots hold. There is no field for a CSS property,
 * a length or an offset, because there is no operation that could take one.
 */

const WRAPPERS = [
  { contract: "layout", signature: "Stack" },
  { contract: "layout", signature: "Inline" },
  { contract: "layout", signature: "Grid" },
  { contract: "box", signature: "Box" },
  { contract: "wrapper", signature: "Wrapper" },
] as const;

/** Asked by a double-click on the stage: put the caret in the selection's text. */
export const EDIT_TEXT = "maker:edit-text";

function useEditTextRequests() {
  useEffect(() => {
    const onRequest = () =>
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(".maker-inspector [data-content] :is(input, textarea)");
        field?.focus();
        field?.select();
      });
    window.addEventListener(EDIT_TEXT, onRequest);
    return () => window.removeEventListener(EDIT_TEXT, onRequest);
  }, []);
}

/** The Select's value for "this option has no value", which a Select item cannot spell as an empty string. */
const UNSET = "__unset__";

/** How many of a component options show before the rest fold under "More options". */
const FRONT_OPTIONS = 4;

/** The options an edit most often touches: the first few the contract declares, and any already set (never hidden). */
export function frontOptions(child: MakerNode): readonly string[] {
  const resolved = resolve(child);
  const options = resolved?.signature.options ?? [];
  const { choices, hidden } = exclusions(child, resolved?.signature.excludes ?? {}, options);
  const inChoice = new Set(choices.flatMap((choice) => [choice.key, ...choice.others]));
  const base = options.filter((name) => !name.endsWith("Expanded") && !inChoice.has(name) && !hidden.has(name));
  return base.filter((name, index) => index < FRONT_OPTIONS || child.options?.[name] !== undefined);
}

export function Inspector({ maker }: { maker: Maker }) {
  useEditTextRequests();
  const root = maker.page.root;
  const id = maker.view.selected;
  const child = id ? findChild(root, id) : undefined;
  if (!id || !child) {
    return (
      <div className="maker-inspector">
        <Stack gap="lg">
          <Heading as="h2" size="h5">
            {maker.isLayout ? "Layout" : "Page"}
          </Heading>
          <PageSettings maker={maker} />
          <Text size="sm" tone="secondary">
            Click something on the canvas or in the layers to edit it; double-click text to type in it.
          </Text>
        </Stack>
      </div>
    );
  }

  const gesture = (operations: readonly Operation[], select?: string) => maker.gesture(operations, select);
  const role = layoutRole(root, id);
  const at = locate(root, id);

  if (!isNode(child)) {
    return (
      <div className="maker-inspector">
        <Stack gap="md">
          <Header title="Text" role={role} onParent={(parent) => maker.setView({ selected: parent })} />
          <CommitField label="Text" value={child.text} multiline liveKey={`${id}:${locate(root, id)?.slot ?? "children"}`} onCommit={(text) => gesture([{ type: "setText", node: id, slot: "children", text }])} />
          <Actions maker={maker} id={id} node={undefined} at={at !== undefined} />
        </Stack>
      </div>
    );
  }

  const resolved = resolve(child);
  const problems = problemsOf(maker.problems, id).filter((problem) => problem.severity === "error");
  const options = resolved?.signature.options ?? [];
  const { choices, hidden } = exclusions(child, resolved?.signature.excludes ?? {}, options);
  const inChoice = new Set(choices.flatMap((choice) => [choice.key, ...choice.others]));
  const base = options.filter((name) => !name.endsWith("Expanded") && !inChoice.has(name) && !hidden.has(name));
  const expanded = options.filter((name) => name.endsWith("Expanded"));
  const childAttrs = at ? Object.values(slotOf(at.parent, at.slot)?.childAttrs ?? {}) : [];
  const forward = resolved?.signature.forward;
  const takesLabel = needsAccessibleName(resolved?.contract, resolved?.signature.forward, child);

  const setOption = (name: string, value: OptionInput | undefined) => gesture([{ type: "setOption", node: id, name, value }]);
  /*
   * THE FEW FIRST, THE REST ON REQUEST. A component can declare a dozen options; most edits touch the first
   * few (a button's variant, tone, size). Those and any option already set stay in view, so nothing set is
   * ever hidden; the others fold under "More options" instead of a wall of selects.
   */
  const front = frontOptions(child);
  const more = base.filter((name) => !front.includes(name));
  const field = (name: string) => (
    <OptionField
      key={name}
      name={name}
      option={resolved!.contract.options[name]!}
      value={child.options?.[name]}
      onChange={(value) => setOption(name, value)}
      suggestions={resolved!.contract.options[name]!.attr === "href" ? maker.site.pages.map((page) => page.path) : undefined}
    />
  );

  return (
    <div className="maker-inspector">
      <Stack gap="lg">
        <Header title={outlineLabel(child.signature)} subtitle={variantOf(child.signature)} role={role} onParent={(parent) => maker.setView({ selected: parent })} />

        <SlotsSection maker={maker} node={child} />

        {problems.length > 0 ? (
          <section className="maker-inspector__pending" aria-label="Pending">
            <Heading as="h3" size="h6">
              Pending
            </Heading>
            <ul>
              {problems.map((problem, index) => (
                <li key={index}>
                  <Text size="sm">{problem.message}</Text>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {base.length > 0 || choices.length > 0 ? (
          <section aria-label="Options">
            <Stack gap="sm">
              <Heading as="h3" size="h6">
                Options
              </Heading>
              {choices.map((choice) => (
                <ExclusiveChoice key={choice.key} choice={choice} node={child} contract={resolved!.contract} maker={maker} />
              ))}
              {front.map(field)}
              {more.length > 0 ? (
                <Details>
                  <Details.Summary>More options ({more.length})</Details.Summary>
                  <Details.Content>
                    <Stack gap="sm">{more.map(field)}</Stack>
                  </Details.Content>
                </Details>
              ) : null}
            </Stack>
          </section>
        ) : null}

        {expanded.length > 0 ? (
          <section aria-label="On expanded widths">
            <Stack gap="sm">
              <Heading as="h3" size="h6">
                On expanded widths (≥ 52rem)
              </Heading>
              {expanded.map((name) => (
                <OptionField key={name} name={name} option={resolved!.contract.options[name]!} value={child.options?.[name]} onChange={(value) => setOption(name, value)} />
              ))}
            </Stack>
          </section>
        ) : null}

        {childAttrs.length > 0 && at ? (
          <section aria-label={`In this ${at.parent.signature}`}>
            <Stack gap="sm">
              <Heading as="h3" size="h6">
                In this {at.parent.signature}
              </Heading>
              <Text size="sm" tone="secondary">
                Belongs to the relation with the parent: it is dropped if this moves elsewhere.
              </Text>
              {childAttrs.map((option) => (
                <OptionField
                  key={option.attr}
                  name={option.attr ?? ""}
                  option={option}
                  value={child.attrs?.[option.attr ?? ""]}
                  onChange={(value) => gesture([{ type: "setAttr", node: id, name: option.attr!, value: value === undefined ? undefined : String(value) }])}
                />
              ))}
            </Stack>
          </section>
        ) : null}


        {takesLabel ? (
          <CommitField
            label="Accessible name (aria-label)"
            value={child.attrs?.["aria-label"] ?? ""}
            onCommit={(value) => gesture([{ type: "setAttr", node: id, name: "aria-label", value: value === "" ? undefined : value }])}
          />
        ) : null}

        <Actions maker={maker} id={id} node={child} at={at !== undefined} />
      </Stack>
    </div>
  );
}

/*
 * TWO WAYS TO DECIDE ONE THING. A contract's `excludes` says one option already decides what a few
 * others would (Grid's `minColumn` decides the lane count that `columns`, `responsive`, `multicol`
 * and `fill` otherwise decide; Text's `textRole` decides size, tone and weight). The inspector shows
 * that as a choice of which way decides, and only the options on the chosen side; switching is one
 * gesture that clears the other side, so the page never holds both. An `option=value` rule instead
 * hides what that value makes meaningless.
 */
type Choice = { readonly key: string; readonly others: readonly string[] };

function exclusions(
  node: MakerNode,
  excludes: Readonly<Record<string, readonly string[]>>,
  options: readonly string[],
): { choices: readonly Choice[]; hidden: ReadonlySet<string> } {
  const choices: Choice[] = [];
  const hidden = new Set<string>();
  for (const [key, excluded] of Object.entries(excludes)) {
    const others = excluded.filter((name) => options.includes(name));
    if (key.includes("=")) {
      const [name, value] = key.split("=");
      if (String(node.options?.[name!]) === value) others.forEach((other) => hidden.add(other));
    } else if (options.includes(key) && others.length > 0) {
      choices.push({ key, others });
    }
  }
  return { choices, hidden };
}

function ExclusiveChoice({ choice, node, contract, maker }: { choice: Choice; node: MakerNode; contract: ComponentContract; maker: Maker }) {
  const byKey = node.options?.[choice.key] !== undefined;
  const set = (name: string, value: OptionInput | undefined) => maker.gesture([{ type: "setOption", node: node.id, name, value }]);
  const choose = (side: "key" | "others") => {
    if (side === "others") {
      maker.gesture([{ type: "setOption", node: node.id, name: choice.key }]);
      return;
    }
    const option = contract.options[choice.key]!;
    const first = option.type === "enum" ? (option.default as string | undefined) ?? option.values?.[0] : option.type === "boolean" ? true : undefined;
    maker.gesture([
      ...choice.others.map((name) => ({ type: "setOption" as const, node: node.id, name })),
      ...(first !== undefined ? [{ type: "setOption" as const, node: node.id, name: choice.key, value: first }] : []),
    ]);
  };
  return (
    <fieldset className="maker-choice">
      <legend>Decided by</legend>
      <Stack gap="sm">
        <SegmentedControl
          size="md"
          label={`What decides ${choice.others.map(humanize).join(", ")}`}
          value={byKey ? "key" : "others"}
          onValueChange={(value) => choose(value as "key" | "others")}
          options={[
            { value: "others", label: choice.others.map(humanize).join(" · ") },
            { value: "key", label: humanize(choice.key) },
          ]}
        />
        {(byKey ? [choice.key] : choice.others).map((name) => (
          <OptionField key={name} name={name} option={contract.options[name]!} value={node.options?.[name]} onChange={(value) => set(name, value)} />
        ))}
      </Stack>
    </fieldset>
  );
}

function Header({
  title,
  subtitle,
  role,
  onParent,
}: {
  title: string;
  subtitle?: string;
  role: ReturnType<typeof layoutRole>;
  onParent: (id: string) => void;
}) {
  return (
    <header className="maker-inspector__header">
      <Stack gap="xs">
        <Heading as="h2" size="h5">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="sm" tone="tertiary">
            {subtitle}
          </Text>
        ) : null}
        {/* Where it sits, on one line, and what that means in a sentence under it: three label-value rows for one fact each was
            more reading than the answer. */}
        {role?.parent && role.parentId ? (
          <Inline gap="xs" align="center" className="maker-inspector__where">
            <Text as="span" size="sm" tone="tertiary">In</Text>
            <Button variant="ghost" size="xs" onClick={() => onParent(role.parentId!)}>
              {role.parent}
              {role.slot && role.slot !== "children" ? ` › ${role.slot}` : ""}
            </Button>
            <Text as="span" size="sm" tone="tertiary">· {role.position} of {role.of}</Text>
          </Inline>
        ) : null}
        {role?.summary ? (
          <Text size="sm" tone="secondary">
            <span className="maker-inspector__role-label">Layout role:</span> {role.summary}
          </Text>
        ) : null}
      </Stack>
    </header>
  );
}

/** One contract option: a choice among its values, with "default" meaning the option is not set. */
function OptionField({
  name,
  option,
  value,
  onChange,
  suggestions,
}: {
  name: string;
  option: ContractOption;
  value: OptionInput | undefined;
  onChange: (value: OptionInput | undefined) => void;
  /** Values worth offering for a free field: the site's page paths, for an href. */
  suggestions?: readonly string[];
}) {
  const label = humanize(name);
  if (option.type === "enum" || option.type === "boolean") {
    const values = option.type === "enum" ? (option.values ?? []) : ["false", "true"];
    /* On or off is a switch. A segmented control chooses between named alternatives; "false | true" is not a choice. */
    if (option.type === "boolean") {
      const on = value === undefined ? option.default === true : value === true;
      return (
        <Switch checked={on} onCheckedChange={({ checked }) => onChange(checked === (option.default === true) ? undefined : checked)}>
          {label}
        </Switch>
      );
    }
    const binary = values.length === 2;
    if (binary) {
      const defaultValue = option.default === undefined ? undefined : String(option.default);
      const current = value === undefined ? (defaultValue ?? values[0] ?? "") : String(value);
      return (
        <FormField label={label}>
          <SegmentedControl
            size="md"
            className="maker-inspector__segmented"
            label={label}
            value={current}
            onValueChange={(raw) => onChange(raw === defaultValue ? undefined : option.type === "boolean" ? raw === "true" : raw)}
            options={values.map((v) => ({ value: v, label: v }))}
          />
        </FormField>
      );
    }
    /*
     * An option with a default SHOWS it: a Heading's level reads "h2", the value it has, not "(default)", which
     * names nothing. Choosing that value again clears the option, so the page keeps no value it did not need.
     * Only an option with no default at all has an honest "not set".
     */
    const defaultValue = option.default === undefined ? undefined : String(option.default);
    const current = value === undefined ? (defaultValue ?? UNSET) : String(value);
    const choices = [...(defaultValue === undefined ? [{ value: UNSET, label: "not set" }] : []), ...values.map((v) => ({ value: v, label: v }))];
    return (
      <Select
        label={label}
        value={current}
        options={choices}
        onValueChange={({ value: [raw] }) => {
          if (raw === undefined) return;
          onChange(raw === UNSET || raw === defaultValue ? undefined : option.type === "boolean" ? raw === "true" : raw);
        }}
      />
    );
  }
  return (
    <CommitField
      label={label}
      value={value === undefined ? "" : String(value)}
      type={option.type === "number" ? "number" : "text"}
      suggestions={suggestions}
      onCommit={(raw) => onChange(raw === "" ? undefined : option.type === "number" ? Number(raw) : raw)}
    />
  );
}

/** A text field that commits once, on blur or Enter: one committed field is one undo step. */
export function CommitField({
  label,
  value,
  onCommit,
  multiline,
  type = "text",
  suggestions,
  emptyFallback,
  liveKey,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number";
  suggestions?: readonly string[];
  emptyFallback?: string;
  liveKey?: string;
}) {
  const shown = value.trim() === "" && emptyFallback ? emptyFallback : value;
  const [draft, setDraft] = useState(shown);
  const listId = useId();
  useEffect(() => setDraft(shown), [shown]);
  useEffect(() => {
    if (!liveKey) return;
    const onDraft = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: string }>).detail;
      if (detail?.key === liveKey) setDraft(detail.value);
    };
    window.addEventListener("maker:inline-text-draft", onDraft);
    return () => window.removeEventListener("maker:inline-text-draft", onDraft);
  }, [liveKey]);
  const commit = () => {
    const next = draft.trim() === "" && emptyFallback ? emptyFallback : draft;
    if (next !== value) {
      setDraft(next);
      onCommit(next);
    }
  };
  return (
    <FormField label={label}>
      {multiline ? (
        <Textarea
          className="maker-textarea"
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
        />
      ) : (
        <Input
          type={type}
          list={suggestions?.length ? listId : undefined}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
        />
      )}
      {suggestions?.length ? (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </FormField>
  );
}

/** What the node's slots hold, where a slot takes text or entries (nodes are edited in the tree). */
function SlotsSection({ maker, node }: { maker: Maker; node: MakerNode }) {
  const resolved = resolve(node);
  if (!resolved) return null;
  const fields = Object.entries(resolved.signature.slots).filter(([name, slot]) => {
    if (slot.accepts === "text" || slot.accepts === "items") return true;
    /* A slot of nodes that holds one text run and nothing else reads as a text field. */
    const held = childrenOf(node, name);
    return slot.accepts === "node" && held.length === 1 && !isNode(held[0]!);
  });
  if (fields.length === 0) return null;
  const fallbackFor = (name: string, index?: number) => `${humanize(name)}${index === undefined ? "" : ` ${index + 1}`}`;
  return (
    <section aria-label="Content" data-content="">
      <Stack gap="sm">
        <Heading as="h3" size="h6">
          Content
        </Heading>
        {fields.map(([name, slot]) => {
          if (slot.accepts === "items") {
            const held = node.slots[name];
            return (
              <ItemsField
                key={name}
                name={name}
                items={held?.kind === "items" ? held.items : []}
                itemOptions={slot.item?.options ?? {}}
                itemSlots={Object.keys(slot.item?.slots ?? {})}
                onCommit={(items) => maker.gesture([{ type: "setItems", node: node.id, slot: name, items }])}
              />
            );
          }
          if (slot.accepts === "text") {
            const held = node.slots[name];
            return (
              <CommitField
                key={name}
                label={humanize(name)}
                value={held?.kind === "text" ? held.text : ""}
                emptyFallback={fallbackFor(name)}
                liveKey={`${node.id}:${name}`}
                onCommit={(text) => maker.gesture([{ type: "setText", node: node.id, slot: name, text }])}
              />
            );
          }
          const run = childrenOf(node, name)[0]!;
          return (
            <CommitField
              key={name}
              label={humanize(name)}
              value={"text" in run ? run.text : ""}
              emptyFallback={fallbackFor(name)}
              liveKey={`${run.id}:${name}`}
              onCommit={(text) => maker.gesture([{ type: "setText", node: run.id, slot: name, text }])}
            />
          );
        })}
      </Stack>
    </section>
  );
}

/** A collection's entries as a list: each entry's text fields, plus add, remove and reorder. */
function ItemsField({
  name,
  items,
  itemOptions,
  itemSlots,
  onCommit,
}: {
  name: string;
  items: readonly ItemInput[];
  itemOptions: Readonly<Record<string, ContractOption>>;
  itemSlots: readonly string[];
  onCommit: (items: readonly ItemInput[]) => void;
}) {
  const textSlots = itemSlots.filter((slot) => items.every((item) => item.slots[slot] === undefined || typeof item.slots[slot] === "string"));
  const replace = (index: number, next: ItemInput) => onCommit(items.map((item, i) => (i === index ? next : item)));
  return (
    <fieldset className="maker-items">
      <legend>{name}</legend>
      <Stack gap="sm">
        {items.map((item, index) => (
          <div className="maker-items__entry" key={index}>
            <Stack gap="xs">
              {textSlots.map((slot) => (
                <CommitField
                  key={slot}
                  label={`${slot} ${index + 1}`}
                  value={typeof item.slots[slot] === "string" ? (item.slots[slot] as string) : ""}
                  emptyFallback={`${humanize(slot)} ${index + 1}`}
                  onCommit={(text) => replace(index, { ...item, slots: { ...item.slots, [slot]: text.trim() === "" ? `${humanize(slot)} ${index + 1}` : text } })}
                />
              ))}
              {Object.entries(itemOptions)
                .filter(([, option]) => option.type === "string" || option.type === "enum")
                .map(([option, declared]) => (
                  <OptionField
                    key={option}
                    name={`${option} ${index + 1}`}
                    option={declared}
                    value={item.options?.[option]}
                    onChange={(value) => {
                      const options = { ...item.options };
                      if (value === undefined) delete options[option];
                      else options[option] = value;
                      replace(index, { ...item, options });
                    }}
                  />
                ))}
              <Inline gap="xs">
                <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => onCommit(swap(items, index, index - 1))}>
                  Up
                </Button>
                <Button variant="ghost" size="sm" disabled={index === items.length - 1} onClick={() => onCommit(swap(items, index, index + 1))}>
                  Down
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onCommit(items.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </Inline>
            </Stack>
          </div>
        ))}
        <Button
          variant="soft"
          size="sm"
          onClick={() => {
            const last = items.at(-1);
            onCommit([...items, last ? structuredClone(last) : { slots: {} }]);
          }}
        >
          Add entry
        </Button>
      </Stack>
    </fieldset>
  );
}

function swap<T>(list: readonly T[], a: number, b: number): readonly T[] {
  const next = [...list];
  [next[a], next[b]] = [next[b]!, next[a]!];
  return next;
}

function Actions({ maker, id }: { maker: Maker; id: string; node: MakerNode | undefined; at: boolean }) {
  const root = maker.page.root;
  const run = (gesture: Gesture | undefined) => gesture && maker.gesture(gesture.operations, gesture.select);
  return (
    <section aria-label="Wrap in">
      <Stack gap="sm">
        <Heading as="h3" size="h6">
          Wrap in
        </Heading>
        <Toolbar label="Structure" className="maker-inspector__tools">
          {WRAPPERS.map((ref) => {
            const gesture = wrapIn(root, id, ref.contract, ref.signature);
            const ok = gesture && applyAll(root, gesture.operations).ok;
            return (
              <IconButton
                key={ref.signature}
                icon={{ glyph: glyphFor(ref.signature)! }}
                label={`Wrap in ${ref.signature}`}
                disabled={!ok}
                onClick={() => run(gesture)}
              />
            );
          })}
        </Toolbar>
      </Stack>
    </section>
  );
}

/*
 * LABELS PEOPLE READ. The contract's option names stay the vocabulary (they are what an agent and
 * the exported code use), but the inspector writes them the way a form would: `headingSize` as
 * "Heading size", the `children` slot as "Text".
 */
const SPECIAL: Readonly<Record<string, string>> = { children: "Text", href: "Link (href)", "data-sizing": "Sizing", "data-width": "Width" };

export function humanize(name: string): string {
  if (SPECIAL[name]) return SPECIAL[name]!;
  const words = name.replace(/^data-/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/-/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * An accessible name field only where one is owed: a rule of the contract asks for it in the node's
 * current state (Button with `iconOnly`), the signature forwards `aria-label` on purpose, or the node
 * already carries one. Elsewhere its own text names it, and an empty field invites a second name.
 */
function needsAccessibleName(contract: ComponentContract | undefined, forward: readonly string[] | undefined, node: MakerNode): boolean {
  if (node.attrs?.["aria-label"]) return true;
  if (forward?.some((name) => name === "aria-label")) return true;
  return (contract?.a11y ?? []).some((rule) => {
    if (!rule.requiresOneOf.includes("aria-label")) return false;
    if (rule.signatures && !rule.signatures.includes(node.signature)) return false;
    return Object.entries(rule.when).every(([option, wanted]) => {
      const given = node.options?.[option];
      if (wanted === "present") return given !== undefined;
      if (wanted === "absent") return given === undefined;
      return (given ?? contract?.options[option]?.default) === wanted;
    });
  });
}
