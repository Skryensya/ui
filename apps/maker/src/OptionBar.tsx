import type { OptionInput } from "@skryensya/core/usage-tree";
import { resolve, type MakerNode } from "@skryensya/maker-model";
import { Button } from "@skryensya/react/button";
import { NativeSelect } from "@skryensya/react/select-native";
import { Toolbar } from "@skryensya/react/toolbar";
import { frontOptions, humanize } from "./Inspector";
import type { Maker } from "./state";

/*
 * THE OPTIONS PEOPLE CHANGE, on the selection itself. Editing a button's tone used to mean selecting it, looking to the
 * other side of the screen, finding the field in the Inspector and coming back. The three or four options a component is
 * most often edited by (the Inspector's own "front" ones, read from the contract, so there is no list to keep in step) sit
 * right over it: a choice for each named alternative, a toggle for each on/off. Everything else stays in the Inspector.
 */
export function OptionBar({ maker, node }: { maker: Maker; node: MakerNode }) {
  const resolved = resolve(node);
  if (!resolved) return null;
  const names = frontOptions(node).filter((name) => {
    const option = resolved.contract.options[name];
    return option && (option.type === "enum" || option.type === "boolean") && !option.element;
  });
  if (names.length === 0) return null;
  const set = (name: string, value: OptionInput | undefined) => maker.gesture([{ type: "setOption", node: node.id, name, value }]);

  return (
    <Toolbar label={`${node.signature} options`} className="maker-option-bar">
      {names.slice(0, 3).map((name) => {
        const option = resolved.contract.options[name]!;
        const label = humanize(name);
        if (option.type === "boolean") {
          const on = node.options?.[name] === undefined ? option.default === true : node.options[name] === true;
          return (
            <Button key={name} size="xs" variant={on ? "soft" : "ghost"} tone={on ? "accent" : "neutral"} aria-pressed={on} onClick={() => set(name, on === (option.default === true) ? !on : undefined)}>
              {label}
            </Button>
          );
        }
        const current = node.options?.[name] === undefined ? String(option.default ?? "") : String(node.options[name]);
        const values = (option.values ?? []).filter((value) => !(option.deprecatedValues && value in option.deprecatedValues));
        return (
          <NativeSelect
            key={name}
            aria-label={label}
            title={label}
            value={current}
            onChange={(event) => set(name, event.currentTarget.value === String(option.default ?? "") ? undefined : event.currentTarget.value)}
            options={values.map((value) => ({ value, label: `${label}: ${value}` }))}
          />
        );
      })}
    </Toolbar>
  );
}
