import {
  selectAttrs,
  selectEvents,
  selectParts,
  selectPositioning,
  type SelectOption,
  type SelectOptions,
  type SelectValueChangeDetails,
} from "@skryensya/core/select";
import { select } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { anchorProps, positionerProps } from "./anchored.js";
import { Icon } from "./icon.js";
import { useFormFieldControl } from "./form-field.js";
import { useVirtualizer } from "./virtualizer.js";

/* `--size-touch-target` (`primitives/_size.scss`): every item's `min-block-size`, so this is
 * exactly right until a label wraps - `measureElement` below corrects those after their first
 * paint. */
const ESTIMATED_ITEM_SIZE = 44;

export type SelectProps = Omit<SelectOptions, "options"> & {
  /** Visible field label. Slot `text` in the contract; keep it a string here. */
  label?: string;
  /** Decorative closed-state geometry supplied by the consumer's bound icon set. */
  indicator?: ReactNode;
  /** Decorative open-state geometry supplied by the consumer's bound icon set. */
  openIndicator?: ReactNode;
  /** Decorative checked-state geometry supplied by the consumer's bound icon set. */
  itemIndicator?: ReactNode;
  options: readonly SelectOption[];
  /**
   * Where the floating listbox is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead: a preview
   * frame, or a scoped harness.
   *
   * The contract declares `portals: true` so `renderTree` hands this down, and for a while nothing
   * received it: the listbox landed on `document.body`, outside the container G2 measures, and the
   * gate saw React render no floating region at all.
   */
  container?: RefObject<HTMLElement>;
};

export function Select({
  appearance,
  variant,
  container,
  id,
  name,
  label,
  indicator,
  openIndicator,
  itemIndicator,
  disabled,
  required,
  value,
  defaultValue,
  placeholder = "",
  options,
  onValueChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SelectProps) {
  const generatedId = useId();
  /*
   * Inside a FormField, the same six-id wiring Input/NativeSelect already inherit: the field's own
   * `id` lands on the TRIGGER (the labelable, focusable part), so FormField's `<label for>`
   * associates with it NATIVELY - no `aria-labelledby` needed, and no second visible label from
   * Select's own `label` prop either, since that one is now free to stay unset. Outside a
   * FormField every value falls back to the prop, same as every other control's own escape.
   */
  const control = useFormFieldControl({ id, required, disabled });
  const rootRef = useRef<HTMLDivElement>(null);
  const collection = useMemo(
    () =>
      select.collection<SelectOption>({
        items: [...options],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [options],
  );
  /*
   * The contract models a select as holding ONE value, because that is what `data-value` can say in
   * markup. Zag takes arrays. Accepting both here is what lets one usage tree drive both bindings:
   * without it, an emitted `defaultValue="starter"` reached the machine as a string, matched no
   * item, and the trigger silently fell back to the placeholder while Vanilla showed "Starter".
   */
  const asValues = (v: string | readonly string[] | undefined) =>
    v === undefined ? undefined : typeof v === "string" ? [v] : [...v];

  /*
   * Only the options near the viewport are ever mounted - the content list renders
   * `rowVirtualizer.getVirtualItems()`, not `options`, below. `scrollToIndexFn` is how the machine
   * tells the virtualizer to bring a highlighted-but-unmounted row (arrow keys, typeahead) into
   * view, since it can no longer rely on `scrollIntoView` finding that row's DOM node.
   */
  const contentRef = useRef<HTMLUListElement>(null);
  const rowVirtualizer = useVirtualizer<HTMLUListElement, HTMLLIElement>({
    count: options.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => ESTIMATED_ITEM_SIZE,
    overscan: 8,
    getItemKey: (index) => options[index]!.value,
  });

  const service = useMachine(select.machine, {
    id: id ?? generatedId,
    // The popper resolves this anchor by id; keep Zag's lookup in sync with FormField's labelable id.
    ids: !label && control.id ? { trigger: control.id } : undefined,
    collection,
    name,
    disabled: control.disabled,
    required: control.required,
    value: asValues(value),
    defaultValue: asValues(defaultValue),
    scrollToIndexFn(details) {
      rowVirtualizer.scrollToIndex(details.index, {
        align: "auto",
        behavior: details.immediate ? "auto" : "smooth",
      });
    },
    onValueChange(details: { value: string[] }) {
      const change: SelectValueChangeDetails = { value: details.value };
      onValueChange?.(change);
      rootRef.current?.dispatchEvent(
        new CustomEvent(selectEvents.valueChange, { bubbles: true, detail: change }),
      );
    },
    positioning: selectPositioning,
  });
  const api = select.connect(service, normalizeProps);


  return (
    <div {...api.getRootProps()} className={selectParts.root} data-appearance={appearance} data-sk-select="" data-variant={variant} ref={rootRef}>
      <select {...api.getHiddenSelectProps()} {...{ [selectAttrs.hidden]: "" }}>
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div {...api.getControlProps()} className={selectParts.control} {...{ [selectAttrs.control]: "" }}>
        {label ? (
          <label {...api.getLabelProps()} className={selectParts.label} {...{ [selectAttrs.label]: "" }}>
            {label}
          </label>
        ) : null}
        <button
          {...api.getTriggerProps()}
          {...anchorProps(`${selectParts.trigger} sk-interactive`)}
          {...{ [selectAttrs.trigger]: "" }}
          {...(ariaLabel ? { "aria-label": ariaLabel } : null)}
          {...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : null)}
          /* Only without Select's OWN label: with one, Zag's getLabelProps/getTriggerProps
             already paired the trigger's id to that label, and overriding it here would point
             that pairing at an id nothing wears any more. */
          {...(!label && control.id ? { id: control.id } : null)}
          {...(control.describedBy ? { "aria-describedby": control.describedBy } : null)}
          type="button"
        >
          <span {...api.getValueTextProps()} className={selectParts.value} {...{ [selectAttrs.value]: "" }}>
            {api.valueAsString || placeholder}
          </span>
          <span
            {...api.getIndicatorProps()}
            aria-hidden="true"
            className={selectParts.indicator}
            {...{ [selectAttrs.indicator]: "" }}
          >
            {/*
              * The template paints all three of these, so authored markup always had them and React
              * only did when a caller remembered to pass one. Defaults, not opt-ins: pass null to
              * suppress one deliberately.
              */}
            <span data-state="closed">{indicator ?? <Icon name="chevron-down" />}</span>
            <span data-state="open">{openIndicator ?? <Icon name="chevron-up" />}</span>
          </span>
        </button>
      </div>
      <Portal container={container}>
        <div
          {...positionerProps(api.getPositionerProps(), selectParts.positioner)}
          {...{ [selectAttrs.positioner]: "" }}
        >
          <div className={selectParts.panel}>
            <ul
              {...api.getContentProps()}
              className={`${selectParts.content} sk-scrollbar`}
              {...{ [selectAttrs.content]: "" }}
              ref={contentRef}
              style={{ position: "relative" }}
            >
              {/*
                * A real `<li>`, in normal flow (unlike the absolutely positioned rows below), so its
                * height is what gives the scroll surface something to scroll THROUGH - `height` set
                * directly on the `<ul>` itself would be clamped by its own `max-block-size`
                * (`--sk-select-content-max-block-size`) before `scrollHeight` ever saw it, capping
                * the list at whatever happened to be mounted. A plain child isn't.
                */}
              <li aria-hidden="true" style={{ height: rowVirtualizer.getTotalSize(), margin: 0, padding: 0 }} />
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const option = options[virtualRow.index]!;
                return (
                  <li
                    {...api.getItemProps({ item: option })}
                    /*
                     * Zag's `aria-selected` tracks the COMMITTED value, not the row under
                     * `aria-activedescendant`: same gap fixed in Combobox (`combobox.tsx`), a
                     * different Zag package (`@zag-js/select`, not `@zag-js/combobox`) with the
                     * identical divergence (confirmed reading `select.connect.js`: `"aria-selected":
                     * itemState.selected`). The WAI reference implementation
                     * (`combobox-autocomplete.js`, `setCurrentOptionStyle`) moves `aria-selected="true"`
                     * onto whichever option is highlighted as you arrow through the list, before Enter
                     * commits anything. Select has no multi-select mode, so this applies unconditionally
                     *. Unlike Combobox, there is no "chosen set" reading to preserve. Placed after the
                     * spread so it wins.
                     */
                    aria-selected={option.value === api.highlightedValue ? "true" : undefined}
                    className={`${selectParts.item} sk-interactive`}
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      /* An absolutely positioned box ignores its containing block's `padding` -
                         it sits flush with the padding's OWN outer edge, not past it the way a
                         normal flow child would. Unpatched, every row rode `--sk-select-content-
                         padding` too high and left it all stacked below the last one instead. */
                      top: "var(--sk-select-content-padding)",
                      insetInlineStart: "var(--sk-select-content-padding)",
                      inlineSize: "calc(100% - 2 * var(--sk-select-content-padding))",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    {...{ [selectAttrs.item]: "" }}
                  >
                    <span
                      {...api.getItemTextProps({ item: option })}
                      className={selectParts.itemText}
                      {...{ [selectAttrs.itemText]: "" }}
                    >
                      {option.label}
                    </span>
                    <span
                      {...api.getItemIndicatorProps({ item: option })}
                      className={selectParts.itemIndicator}
                      {...{ [selectAttrs.itemIndicator]: "" }}
                    >
                      {itemIndicator ?? <Icon name="check" />}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Portal>
    </div>
  );
}
