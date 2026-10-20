import {
  comboboxEvents,
  comboboxParts,
  type ComboboxItem,
  comboboxContract,
} from "@skryensya/core/combobox";
import { formFieldParts } from "@skryensya/core/form-field";
import { tagParts } from "@skryensya/core/tag";
import { combobox } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { anchoredPositioning } from "@skryensya/core/anchored";
import { anchorProps, positionerProps } from "./anchored.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";
const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
const combiningMarks = /\p{M}+/gu;
const searchKey = (value: string) =>
  value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
type HighlightSource = "keyboard" | "pointer" | undefined;
// The keys that move the highlight inside the listbox (the same ones the machine handles).
const navigationKeys = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);
// The machine takes an array even when only one thing can be chosen. Authored markup carries a
// single `data-value`, so a lone string has to reach it as the one-element array it means.
const asValues = (value: string | readonly string[] | undefined) =>
  value === undefined ? undefined : typeof value === "string" ? [value] : [...value];
const defaultRemoveLabel = (item: ComboboxItem) => `Quitar ${item.label}`;
const defaultResultCountLabel = ({ count }: { count: number }) =>
  count === 1 ? "1 resultado disponible" : `${count} resultados disponibles`;

export type ComboboxProps = {
  /**
   * Where the positioned listbox is portalled. Absent it goes to the body, which is right in a page
   * and wrong in the gate: the listbox would land outside the box G2 measures, and the two bindings
   * would be compared with one of them missing its whole floating half.
   */
  container?: RefObject<HTMLElement>;
  id?: string;
  name?: string;
  /**
   * Field name. Contract slot `label` accepts text; keep this a string for emit parity. Optional
   * so a tree already naming the field another way (`aria-label`/`aria-labelledby`) is not forced
   * into a second, visible one: the same escape hatch `Select`'s own `aria-label` is.
   */
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  hint?: string;
  error?: string;
  items?: readonly ComboboxItem[];
  /**
   * `Select`'s own option shape (`{ value, label, disabled }`), accepted here too: it is already a
   * subset of `ComboboxItem`, so a tree moving from `Select` to `Combobox` for its typeahead keeps
   * its exact options array. Ignored when `items` is also given.
   */
  options?: readonly ComboboxItem[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiple?: boolean;
  /** How many items `multiple` accepts; see the contract's note. */
  max?: number;
  value?: string | readonly string[];
  defaultValue?: string | readonly string[];
  inputValue?: string;
  defaultInputValue?: string;
  openOnClick?: boolean;
  allowCustomValue?: boolean;
  triggerIndicator?: ReactNode;
  itemIndicator?: ReactNode;
  clearIndicator?: ReactNode;
  removeIndicator?: ReactNode;
  clearLabel?: string;
  triggerLabel?: string;
  selectedLabel?: string;
  removeLabel?: (item: ComboboxItem) => string;
  emptyLabel?: string;
  resultCountLabel?: (details: { count: number; inputValue: string }) => string;
  onValueChange?: (details: { value: string[] }) => void;
  onInputValueChange?: (details: { inputValue: string }) => void;
  /** How the field is drawn: `plain`, `brutalist` or `frosted`. Absent means plain. */
  appearance?: (typeof comboboxContract.options.appearance.values)[number];
};

export function Combobox({
  allowCustomValue,
  appearance,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  clearLabel = "Limpiar selección",
  triggerLabel = "Mostrar opciones",
  clearIndicator,
  container,
  defaultInputValue = "",
  defaultValue,
  disabled,
  emptyLabel = "Sin resultados",
  error,
  hint,
  id,
  inputValue,
  itemIndicator,
  items: itemsProp,
  label,
  max,
  multiple,
  name,
  onInputValueChange,
  onValueChange,
  openOnClick = true,
  options: optionsProp,
  placeholder,
  readOnly,
  removeIndicator,
  removeLabel = defaultRemoveLabel,
  required,
  resultCountLabel = defaultResultCountLabel,
  selectedLabel = "Valores seleccionados",
  triggerIndicator,
  value,
}: ComboboxProps) {
  const items = itemsProp ?? optionsProp ?? [];
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = `${machineId}-hint`;
  const errorId = `${machineId}-error`;
  const [query, setQuery] = useState(defaultInputValue);
  /*
   * `max`'s own tracking. Zag's machine has no concept of it, so this is read separately from the
   * value it limits: seeded from whichever of `value`/`defaultValue` started the field, kept in
   * sync with a CONTROLLED `value` by the effect below, and otherwise advanced by this component's
   * own `onValueChange` further down - the same split Rating and TagsInput's React bindings use
   * for state the machine doesn't carry.
   */
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    () => new Set(asValues(value ?? defaultValue) ?? []),
  );
  useEffect(() => {
    if (value === undefined) return;
    setSelectedValues(new Set(asValues(value)));
  }, [value]);
  const atMax = Boolean(multiple && max !== undefined && selectedValues.size >= max);
  /*
   * ── Virtual focus ────────────────────────────────────────────────────────────────────────────
   *
   * DOM focus never leaves the input: `aria-activedescendant` points at the highlighted option, so
   * nothing on screen says where the arrow keys have landed unless the option says it. It carries a
   * real focus ring, and while it does, the control drops its own; one ring at a time, so the ring
   * *moves* into the list and back out instead of stacking a box inside a box.
   *
   * Both attributes are gated on which device moved the highlight last, because the machine also
   * highlights on `pointermove` and a focus ring chasing the cursor reads as broken focus. Under the
   * pointer the hover tint carries the highlight alone. The updater returns the previous value when
   * nothing changed, so a mouse crossing the list does not re-render on every frame.
   */
  // Starts at `pointer`, matching the enhancer: at rest no key has moved the highlight, and only
  // `keyboard` changes what is drawn. Leaving it unset meant the two bindings disagreed about the
  // attribute before anyone had touched the control.
  const [highlightSource, setHighlightSource] = useState<HighlightSource>("pointer");
  const keepHighlightSource =
    (next: HighlightSource) => (previous: HighlightSource) =>
      previous === next ? previous : next;
  const effectiveQuery = inputValue ?? query;
  // Folded once per item list, not once per row per keystroke: `searchKey` normalizes to NFD and
  // strips combining marks, which is the most expensive thing in the filter and never changes.
  const searchKeys = useMemo(() => items.map(({ label }) => searchKey(label)), [items]);
  const allItems = useMemo(() => [...items], [items]);
  const filteredItems = useMemo(() => {
    const needle = searchKey(effectiveQuery.trim());
    if (!needle) return allItems;
    return items.filter((_, index) => searchKeys[index].includes(needle));
  }, [allItems, effectiveQuery, items, searchKeys]);
  const collection = useMemo(
    () =>
      combobox.collection<ComboboxItem>({
        items: filteredItems,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        // Past `max`, every item not already chosen is disabled - it stays visible with its
        // checkmark if selected, just not pickable - rather than letting a search run into a dead
        // end.
        isItemDisabled: (item) => Boolean(item.disabled) || (atMax && !selectedValues.has(item.value)),
      }),
    [filteredItems, atMax, selectedValues],
  );
  const service = useMachine(combobox.machine, {
    positioning: { placement: "bottom-start", ...anchoredPositioning },
    id: machineId,
    collection,
    name,
    disabled,
    invalid: Boolean(error),
    readOnly,
    required,
    multiple,
    value: asValues(value),
    defaultValue: asValues(defaultValue),
    inputValue,
    defaultInputValue,
    openOnClick,
    allowCustomValue,
    placeholder,
    // A search that was never resolved into a selection is still the user's work: leaving the field
    // (blur, click outside, Escape) must not throw it away and leave them retyping. `preserve` is
    // the only selectionBehavior that keeps it, because the machine reverts the input on every one
    // of those exits. The cost is that CHOOSING no longer writes the label either, so `onValueChange`
    // below does that write itself: preserve on leave, replace on select (mirrors the vanilla layer).
    selectionBehavior: "preserve",
    translations: {
      clearTriggerLabel: clearLabel,
      triggerLabel,
    },
    onInputValueChange(details) {
      // Only what the user TYPED is a filter. The machine writes this input too (the label after a
      // select, "" after clear), and filtering on that would leave the list showing the single row
      // you just picked the next time it opens. Any non-typed write resets to the full set.
      setQuery(details.reason === "input-change" ? details.inputValue : "");
      const next = { inputValue: details.inputValue };
      onInputValueChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(comboboxEvents.inputValueChange, { bubbles: true, detail: next }),
      );
    },
    onValueChange(details) {
      const next = { value: details.value };
      onValueChange?.(next);
      setSelectedValues(new Set(details.value));
      rootRef.current?.dispatchEvent(
        new CustomEvent(comboboxEvents.valueChange, { bubbles: true, detail: next }),
      );
      // The other half of `selectionBehavior: "preserve"`. Single: the input shows what was chosen.
      // Multiple: the Tag already shows it, so the query is spent; clear it so the next search
      // starts from the whole list instead of the one match that produced this Tag.
      queueMicrotask(() => {
        const label = multiple ? "" : (details.items.at(-1)?.label ?? "");
        if (api.inputValue !== label) api.setInputValue(label, "script");
      });
    },
  });
  const api = combobox.connect(service, normalizeProps);

  /* The anchor is the whole CONTROL, not the chevron button: the listbox lines up with the field the
   * user is typing into, and anchoring it to the chevron would pin it to a 32px square. */
  const inputProps = api.getInputProps();
  const describedBy =
    [
      inputProps["aria-describedby"],
      hint ? hintId : undefined,
      error ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  // Show the clear ✕ whenever there is something to clear (a chosen value OR text still in the
  // input), and hide it when the field is truly empty (mirrors the vanilla layer).
  const showClear = api.hasSelectedItems || api.inputValue.length > 0;

  return (
    <div
      {...api.getRootProps()}
      className={cx(formFieldParts.root, comboboxParts.root)}
      data-appearance={appearance}
      data-disabled={disabled ? "" : undefined}
      data-sk-combobox=""
      data-virtual-focus={
        highlightSource === "keyboard" && api.open && api.highlightedValue
          ? ""
          : undefined
      }
      onKeyDownCapture={(event) => {
        if (!navigationKeys.has(event.key)) return;
        setHighlightSource(keepHighlightSource("keyboard"));
      }}
      ref={rootRef}
    >
      {label ? (
        <label
          {...api.getLabelProps()}
          className={cx(formFieldParts.label, comboboxParts.label)}
        >
          {label}
          {required ? (
            <span aria-hidden="true" className={formFieldParts.requiredIndicator}>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {hint ? (
        <div className={formFieldParts.hint} id={hintId}>
          {hint}
        </div>
      ) : null}
      <div
        {...api.getControlProps()}
        {...anchorProps(comboboxParts.control)}
        data-readonly={readOnly ? "" : undefined}
      >
        <div className={comboboxParts.value}>
          {multiple && api.selectedItems.length ? (
            <div
              aria-label={selectedLabel}
              className={comboboxParts.selectedItems}
              role="list"
            >
              {api.selectedItems.map((item) => (
                <span
                  aria-disabled={disabled || readOnly ? "true" : undefined}
                  className={cx(comboboxParts.selectedItem, tagParts.root)}
                  data-appearance="plain"
                  data-removable=""
                  data-tone="neutral"
                  key={item.value}
                  role="listitem"
                >
                  <span className={cx(comboboxParts.selectedItemLabel, tagParts.label)} title={item.label}>
                    {item.label}
                  </span>
                  <Button
                    aria-label={removeLabel(item)}
                    className={cx(comboboxParts.removeTrigger, tagParts.remove)}
                    disabled={disabled || readOnly}
                    iconOnly
                    onClick={() => {
                      api.clearValue(item.value);
                      api.focus();
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    {removeIndicator ?? <Icon name="close" size="sm" />}
                  </Button>
                </span>
              ))}
            </div>
          ) : null}
          <input
            {...inputProps}
            {...(ariaLabel ? { "aria-label": ariaLabel } : null)}
            {...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : null)}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            className={comboboxParts.input}
            // Nothing typed here can go anywhere once `max` is reached, so the placeholder's own
            // invitation to search is dropped with it rather than left to invite a dead end.
            placeholder={atMax ? undefined : inputProps.placeholder}
          />
        </div>
        {/* Rendered-and-hidden rather than conditional, which is what the enhancer can do with
            authored markup and therefore what the contract's template says. `hidden` keeps it out
            of the accessibility tree exactly as absence would, and it is what the CSS styles. */}
        <button
          {...api.getClearTriggerProps()}
          className={cx(comboboxParts.clear, "sk-button", "sk-interactive")}
          data-icon-only=""
          data-size="xs"
          data-variant="ghost"
          hidden={!showClear}
          tabIndex={0}
          type="button"
        >
          {clearIndicator ?? <Icon name="close" size="sm" />}
        </button>
        <button
          {...api.getTriggerProps()}
          className={cx(comboboxParts.trigger, "sk-button", "sk-interactive")}
          data-icon-only=""
          data-size="sm"
          data-state={api.open ? "open" : "closed"}
          data-variant="ghost"
          type="button"
        >
          {triggerIndicator ?? (
            <>
              <span data-state="closed">
                <Icon name="chevron-down" size="md" />
              </span>
              <span data-state="open">
                <Icon name="chevron-up" size="md" />
              </span>
            </>
          )}
        </button>
      </div>
      {error ? (
        <div className={formFieldParts.error} id={errorId}>
          {error}
        </div>
      ) : null}
      <div
        aria-atomic="true"
        className={cx(comboboxParts.status, "sk-visually-hidden")}
        role="status"
      >
        {api.open
          ? resultCountLabel({
              count: filteredItems.length,
              inputValue: api.inputValue,
            })
          : null}
      </div>
      <Portal container={container}>
        <div {...positionerProps(api.getPositionerProps(), comboboxParts.positioner)}>
          <div
            {...api.getContentProps()}
            className={cx(comboboxParts.content, "sk-scrollbar")}
            data-highlight-source={highlightSource}
            onPointerMove={() => setHighlightSource(keepHighlightSource("pointer"))}
          >
            {filteredItems.map((item) => (
              <div
                {...api.getItemProps({ item })}
                /*
                 * Zag's `aria-selected` tracks the COMMITTED value, not the row under
                 * `aria-activedescendant`. The WAI reference implementation
                 * (`combobox-autocomplete.js`, `setCurrentOptionStyle`) does the opposite for
                 * single-select: it moves `aria-selected="true"` onto whichever option is highlighted
                 * as you arrow through the list, before Enter commits anything. That is what
                 * "visually indicated as the currently selected value" means in the APG's
                 * roles/states table. Multiple stays on Zag's default: with Tags, `aria-selected`
                 * genuinely means "part of the chosen set" (aria-multiselectable="true"), a state the
                 * base combobox pattern does not cover. Placed after the spread so it wins.
                 */
                aria-selected={
                  multiple
                    ? api.getItemState({ item }).selected
                      ? "true"
                      : undefined
                    : item.value === api.highlightedValue
                      ? "true"
                      : undefined
                }
                className={`${comboboxParts.item} sk-interactive`}
                /* What the enhancer reads to build its collection: a row's `textContent` is label +
                   description + indicator glued together, which is not the label. Written here too
                   so the two bindings land on the same row. */
                data-description={item.description}
                data-value-text={item.label}
                key={item.value}
              >
                <span className={comboboxParts.itemCopy}>
                  <span
                    {...api.getItemTextProps({ item })}
                    className={comboboxParts.itemLabel}
                  >
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className={comboboxParts.itemDescription}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <span
                  {...api.getItemIndicatorProps({ item })}
                  className={comboboxParts.itemIndicator}
                >
                  {itemIndicator ?? "✓"}
                </span>
              </div>
            ))}
            {/* Same rendered-and-hidden rule as the clear control above. */}
            <div
              className={comboboxParts.empty}
              hidden={filteredItems.length > 0}
              role="presentation"
            >
              {emptyLabel}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
}
