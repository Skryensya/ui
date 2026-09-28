import { useEffect, useState } from "react";
import type { ContractOption } from "@skryensya/core/contract";
import type { ItemInput, OptionInput } from "@skryensya/core/usage-tree";
import { Button } from "@skryensya/react/button";
import { FormField } from "@skryensya/react/form-field";
import { Input } from "@skryensya/react/input";
import { NativeSelect } from "@skryensya/react/select-native";
import { Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
import {
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
import type { Maker } from "./state";

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

export function Inspector({ maker }: { maker: Maker }) {
  const root = maker.page.root;
  const id = maker.view.selected;
  const child = id ? findChild(root, id) : undefined;
  if (!id || !child) {
    return (
      <div className="maker-inspector">
        <Text tone="secondary">Select something on the stage or in the outline.</Text>
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
          <CommitField label="Text" value={child.text} multiline onCommit={(text) => gesture([{ type: "setText", node: id, slot: "children", text }])} />
          <Actions maker={maker} id={id} node={undefined} at={at !== undefined} />
        </Stack>
      </div>
    );
  }

  const resolved = resolve(child);
  const problems = problemsOf(maker.problems, id).filter((problem) => problem.severity === "error");
  const options = resolved?.signature.options ?? [];
  const base = options.filter((name) => !name.endsWith("Expanded"));
  const expanded = options.filter((name) => name.endsWith("Expanded"));
  const childAttrs = at ? Object.values(slotOf(at.parent, at.slot)?.childAttrs ?? {}) : [];
  const forward = resolved?.signature.forward;
  const takesLabel = !forward || forward.some((name) => name === "aria-label" || name === "aria-*");

  const setOption = (name: string, value: OptionInput | undefined) => gesture([{ type: "setOption", node: id, name, value }]);

  return (
    <div className="maker-inspector">
      <Stack gap="lg">
        <Header title={child.signature} subtitle={child.contract} role={role} onParent={(parent) => maker.setView({ selected: parent })} />

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

        {base.length > 0 ? (
          <section aria-label="Options">
            <Stack gap="sm">
              <Heading as="h3" size="h6">
                Options
              </Heading>
              {base.map((name) => (
                <OptionField key={name} name={name} option={resolved!.contract.options[name]!} value={child.options?.[name]} onChange={(value) => setOption(name, value)} />
              ))}
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

        <SlotsSection maker={maker} node={child} />

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
        <Heading as="h2" size="h4">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="sm" tone="tertiary">
            {subtitle}
          </Text>
        ) : null}
        <dl className="maker-inspector__role">
          {role?.parent && role.parentId ? (
            <>
              <dt>Parent</dt>
              <dd>
                <button type="button" className="maker-link" onClick={() => onParent(role.parentId!)}>
                  {role.parent}
                  {role.slot && role.slot !== "children" ? ` › ${role.slot}` : ""}
                </button>
              </dd>
              <dt>Position</dt>
              <dd>
                {role.position} of {role.of}
              </dd>
            </>
          ) : null}
          <dt>Layout role</dt>
          <dd>{role?.summary}</dd>
        </dl>
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
}: {
  name: string;
  option: ContractOption;
  value: OptionInput | undefined;
  onChange: (value: OptionInput | undefined) => void;
}) {
  const label = name.replace(/^data-/, "");
  const fallback = option.default === undefined ? "not set" : `default: ${String(option.default)}`;
  if (option.type === "enum" || option.type === "boolean") {
    const values = option.type === "enum" ? (option.values ?? []) : ["true", "false"];
    return (
      <FormField label={label}>
        <NativeSelect
          value={value === undefined ? "" : String(value)}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            onChange(raw === "" ? undefined : option.type === "boolean" ? raw === "true" : raw);
          }}
          options={[{ value: "", label: `(${fallback})` }, ...values.map((v) => ({ value: v, label: v }))]}
        />
      </FormField>
    );
  }
  return (
    <CommitField
      label={label}
      value={value === undefined ? "" : String(value)}
      type={option.type === "number" ? "number" : "text"}
      onCommit={(raw) => onChange(raw === "" ? undefined : option.type === "number" ? Number(raw) : raw)}
    />
  );
}

/** A text field that commits once, on blur or Enter: one committed field is one undo step. */
function CommitField({
  label,
  value,
  onCommit,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number";
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  return (
    <FormField label={label}>
      {multiline ? (
        <textarea
          className="sk-input maker-textarea"
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
        />
      ) : (
        <Input
          type={type}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
        />
      )}
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
  return (
    <section aria-label="Content">
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
                label={name}
                value={held?.kind === "text" ? held.text : ""}
                onCommit={(text) => maker.gesture([{ type: "setText", node: node.id, slot: name, text }])}
              />
            );
          }
          const run = childrenOf(node, name)[0]!;
          return (
            <CommitField
              key={name}
              label={name}
              value={"text" in run ? run.text : ""}
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
                  onCommit={(text) => replace(index, { ...item, slots: { ...item.slots, [slot]: text } })}
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

function Actions({ maker, id, node, at }: { maker: Maker; id: string; node: MakerNode | undefined; at: boolean }) {
  const [wrapWith, setWrapWith] = useState(0);
  const child = findChild(maker.page.root, id)!;
  const location = locate(maker.page.root, id);
  return (
    <section aria-label="Structure">
      <Stack gap="sm">
        <Heading as="h3" size="h6">
          Structure
        </Heading>
        {at ? (
          <Inline gap="xs" align="end">
            <FormField label="Wrap in">
              <NativeSelect
                value={String(wrapWith)}
                onChange={(event) => setWrapWith(Number(event.currentTarget.value))}
                options={WRAPPERS.map((ref, index) => ({ value: String(index), label: ref.signature }))}
              />
            </FormField>
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                const container = presetFor(WRAPPERS[wrapWith]!, randomId)!;
                maker.gesture([{ type: "wrap", children: [id], container }], container.id);
              }}
            >
              Wrap
            </Button>
          </Inline>
        ) : null}
        <Inline gap="xs">
          {node && at ? (
            <Button variant="ghost" size="sm" onClick={() => maker.gesture([{ type: "unwrap", node: id }], childrenOf(node, "children")[0]?.id)}>
              Unwrap
            </Button>
          ) : null}
          {location ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const copy = reidentify(child, randomId);
                maker.gesture([{ type: "insert", at: { parent: location.parent.id, slot: location.slot, index: location.index + 1 }, child: copy }], copy.id);
              }}
            >
              Duplicate
            </Button>
          ) : null}
          {location ? (
            <Button variant="ghost" size="sm" tone="danger" onClick={() => maker.gesture([{ type: "remove", child: id }], location.parent.id)}>
              Remove
            </Button>
          ) : null}
        </Inline>
      </Stack>
    </section>
  );
}
