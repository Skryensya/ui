import { isClearKey, searchFieldAttrs, searchFieldContract, searchFieldParts } from "@skryensya/core/search-field";
import { useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const { clearLabel: clearLabelOption } = searchFieldContract.options;

export type SearchFieldProps = {
  /** Names the field. Required even when hidden: it is the input's accessible name. */
  label: string;
  /** Keep the label for screen readers only, when the page already shows what the box searches. */
  labelVisuallyHidden?: boolean;
  id?: string;
  /** The query's key in the submitted URL: `q` gives `?q=...`. */
  name?: string;
  placeholder?: string;
  /** Controlled query. */
  value?: string;
  defaultValue?: string;
  /** Every change, typed or cleared. */
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  controlSize?: (typeof searchFieldContract.options.controlSize.values)[number];
  /** How the input is drawn, Input's axis. Absent means plain. */
  appearance?: (typeof searchFieldContract.options.appearance.values)[number];
  /** The clear button's accessible name. */
  clearLabel?: string;
  /** Makes it a `<form role="search">` that GETs this URL. Requires `submit`. */
  action?: string;
  /** The submit button's text, the `submit` slot. Only with `action`. */
  submit?: string;
};

export function SearchField({
  action,
  appearance,
  clearLabel = clearLabelOption.default,
  controlSize,
  defaultValue = "",
  disabled,
  id,
  label,
  labelVisuallyHidden,
  name,
  onValueChange,
  placeholder,
  submit,
  value,
}: SearchFieldProps) {
  const generatedId = useId();
  const inputId = `${id ?? generatedId}-input`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [ownValue, setOwnValue] = useState(defaultValue);
  const query = value ?? ownValue;

  const change = (next: string) => {
    if (value === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  const clear = () => {
    change("");
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isClearKey(event, query)) return;
    /* Consumed only when there was text: an empty field lets Escape reach the dialog around it. */
    event.preventDefault();
    event.stopPropagation();
    clear();
  };

  const Root = action ? "form" : "div";

  return (
    <Root
      action={action}
      className={searchFieldParts.root}
      data-label-visually-hidden={labelVisuallyHidden ? "" : undefined}
      id={id}
      method={action ? "get" : undefined}
      role={action ? "search" : undefined}
      {...{ [searchFieldAttrs.root]: "" }}
    >
      <label className={searchFieldParts.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={searchFieldParts.control}>
        <span className={searchFieldParts.icon}>
          <Icon name="search" size="sm" />
        </span>
        <input
          autoComplete="off"
          className={`${searchFieldParts.input} sk-input`}
          data-appearance={appearance}
          data-size={controlSize}
          disabled={disabled}
          id={inputId}
          name={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => change(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          type="search"
          value={query}
          {...{ [searchFieldAttrs.input]: "" }}
        />
        <button
          aria-label={clearLabel}
          className={`${searchFieldParts.clear} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          hidden={query === "" || disabled}
          onClick={clear}
          type="button"
          {...{ [searchFieldAttrs.clear]: "" }}
        >
          <Icon name="close" size="sm" />
        </button>
      </div>
      {action ? (
        <button className={`${searchFieldParts.submit} sk-button sk-interactive`} type="submit">
          {submit}
        </button>
      ) : null}
    </Root>
  );
}
