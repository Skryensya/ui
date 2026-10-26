import {
  listboxContract,
  listboxDefaultValue,
  listboxEvents,
  listboxParts,
  type ListboxItem,
  type ListboxOptions,
  type ListboxValueChangeDetails,
} from "@skryensya/core/listbox";
import { listbox } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, type ReactNode } from "react";
import { Icon } from "./icon.js";

export type { ListboxItem, ListboxValueChangeDetails } from "@skryensya/core/listbox";

const {
  indicator: indicatorOption,
  orientation: orientationOption,
  selectionMode: selectionModeOption,
} = listboxContract.options;

export type ListboxProps = {
  id?: string;
  /** What the list is a choice of. Visible, and the listbox's name. */
  label: ReactNode;
  items: readonly ListboxItem[];
  selectionMode?: ListboxOptions["selectionMode"];
  orientation?: ListboxOptions["orientation"];
  /** `none` marks a chosen option by its fill alone, without the check. */
  indicator?: ListboxOptions["indicator"];
  disabled?: boolean;
  /** In `single` mode, choosing the chosen option again clears it. */
  deselectable?: boolean;
  /** The arrow keys wrap from the last option to the first, and back. */
  loopFocus?: boolean;
  /** Controlled selection. */
  value?: string[];
  /** Uncontrolled selection. Without it, every item marked `defaultSelected` starts chosen. */
  defaultValue?: string[];
  onValueChange?: (details: ListboxValueChangeDetails) => void;
  /** The check on a chosen option. Pass `null` for none. */
  itemIndicator?: ReactNode;
};

/** A list of options chosen from in place: always open, single or multiple. */
export function Listbox({
  id,
  label,
  items,
  selectionMode = selectionModeOption.default,
  orientation = orientationOption.default,
  indicator = indicatorOption.default,
  disabled,
  deselectable,
  loopFocus,
  value,
  defaultValue,
  onValueChange,
  itemIndicator,
}: ListboxProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const collection = useMemo(
    () =>
      listbox.collection<ListboxItem>({
        items: [...items],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [items],
  );

  const service = useMachine(listbox.machine, {
    id: id ?? generatedId,
    collection,
    selectionMode,
    orientation,
    disabled,
    deselectable,
    loopFocus,
    /* Spread only when given: a `value` key that is present but undefined still reads as controlled
       to Zag's React adapter, and a click then changes nothing. */
    ...(value !== undefined ? { value } : {}),
    defaultValue: defaultValue ?? listboxDefaultValue(items),
    onValueChange(details: { value: string[] }) {
      const change: ListboxValueChangeDetails = { value: details.value };
      onValueChange?.(change);
      rootRef.current?.dispatchEvent(new CustomEvent(listboxEvents.valueChange, { bubbles: true, detail: change }));
    },
  });
  const api = listbox.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      className={listboxParts.root}
      data-deselectable={deselectable ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-indicator={indicator}
      data-loop-focus={loopFocus ? "" : undefined}
      data-orientation={orientation}
      data-selection-mode={selectionMode}
      data-sk-listbox=""
      ref={rootRef}
    >
      <span {...api.getLabelProps()} className={listboxParts.label} data-sk-listbox-label="">
        {label}
      </span>
      <ul {...api.getContentProps()} className={listboxParts.content} data-sk-listbox-content="">
        {items.map((item) => {
          const itemProps = api.getItemProps({ item });
          /* With a description the row's text is label + description; name it by the label alone. */
          const labelId = item.description ? `${itemProps.id}-label` : undefined;
          const descriptionId = item.description ? `${itemProps.id}-description` : undefined;
          return (
            <li
              {...itemProps}
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              className={`${listboxParts.item} sk-interactive`}
              data-default-selected={item.defaultSelected ? "" : undefined}
              data-sk-listbox-item=""
              key={item.value}
              title={item.label}
            >
              <span
                {...api.getItemTextProps({ item })}
                className={listboxParts.itemText}
                data-sk-listbox-item-text=""
                id={labelId}
              >
                {item.label}
              </span>
              {item.description ? (
                <span className={listboxParts.itemDescription} data-sk-listbox-item-description="" id={descriptionId}>
                  {item.description}
                </span>
              ) : null}
              {indicator === "none" || orientation === "horizontal" ? null : (
                <span
                  {...api.getItemIndicatorProps({ item })}
                  aria-hidden="true"
                  className={listboxParts.itemIndicator}
                  data-sk-listbox-item-indicator=""
                >
                  {itemIndicator === undefined ? <Icon name="check" size="sm" /> : itemIndicator}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
