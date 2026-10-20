import { colorPickerAttrs, colorPickerParts, colorPickerPanelParts, colorPickerEvents } from "@skryensya/core/color-picker";
import { colorPickerContract } from "@skryensya/core/color-picker";
import { normalizeHex } from "@skryensya/core/color";
import { colorPicker } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine, type PropTypes } from "@zag-js/react";
import { useId, useRef, useState, type RefObject } from "react";
import { anchoredPositioning } from "@skryensya/core/anchored";
import { anchorProps, positionerProps } from "./anchored.js";

// Without depending on `@zag-js/color-picker` directly (react does not bring it as a dependency of its
// own, core only re-exports it via `machines.ts`): the `api`'s type comes from the same `connect`
// function, just like `DatePicker` does with its own.
type ColorPickerApi = ReturnType<typeof colorPicker.connect<PropTypes>>;

export type ColorPickerProps = {
  /** Where the popover is portalled. Absent it goes to the body: see `ComboboxProps.container`. */
  container?: RefObject<HTMLElement>;
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  triggerLabel?: string;
  /*
   * Preset swatches for the panel's presets row. The contract's own option is one plain STRING,
   * space-separated (see `color-picker.ts`'s own comment)  -  there is no array/list option type
   * in this system, so that is the only shape the compiler can emit as valid JSX. An array is
   * accepted too, the more ergonomic shape for hand-authored React, same precedent as
   * `DatePickerProps.value` taking `readonly (DateValue | string)[] | string`.
   */
  swatches?: readonly string[] | string;
  onValueChange?: (details: { value: string }) => void;
};

const asSwatches = (input: ColorPickerProps["swatches"]): readonly string[] =>
  typeof input === "string" ? input.split(/\s+/).filter(Boolean) : (input ?? []);

/*
 * COLOR PICKER: the editable field (label, trigger with its swatch) plus a popover. The panel
 * inside is `ColorPickerPanelBody`, shared verbatim between `ColorPicker` and `CompactColorPicker`
 * (only `anatomy` differs), so full and compact never fork into two independent implementations  - 
 * same discipline `CalendarBody` gives DatePicker and Calendar.
 */
function useColorPicker({
  defaultValue = "#000000",
  disabled,
  id,
  invalid,
  name,
  onValueChange,
  readOnly,
  required,
  rootRef,
  value,
}: Pick<
  ColorPickerProps,
  "defaultValue" | "disabled" | "id" | "invalid" | "name" | "onValueChange" | "readOnly" | "required" | "value"
> & { rootRef: RefObject<HTMLDivElement | null> }) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const service = useMachine(colorPicker.machine, {
    positioning: { placement: "bottom-start", ...anchoredPositioning },
    id: resolvedId,
    name,
    value: value !== undefined ? colorPicker.parse(value) : undefined,
    defaultValue: colorPicker.parse(defaultValue),
    disabled,
    readOnly,
    required,
    invalid,
    onValueChange(details) {
      const next = { value: details.valueAsString };
      onValueChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(colorPickerEvents.valueChange, { bubbles: true, detail: next }),
      );
    },
  });
  return { api: colorPicker.connect(service, normalizeProps), resolvedId };
}

function ColorPickerField({
  anatomy,
  api,
  container,
  label,
  resolvedId,
  rootRef,
  showValue = true,
  swatches,
  triggerLabel,
}: {
  anatomy: "full" | "compact";
  api: ColorPickerApi;
  container?: ColorPickerProps["container"];
  label?: string;
  resolvedId: string;
  rootRef: RefObject<HTMLDivElement | null>;
  /** `false` is `ColorPicker.swatch`: the trigger is the preview square alone. */
  showValue?: boolean;
  swatches?: readonly string[];
  triggerLabel?: string;
}) {

  return (
    <div
      {...api.getRootProps()}
      className={colorPickerParts.root}
      data-anatomy={anatomy}
      ref={rootRef}
      {...{ [colorPickerAttrs.root]: "" }}
    >
      {label ? (
        <label {...api.getLabelProps()} className={colorPickerParts.label}>
          {label}
        </label>
      ) : null}
      {/* So `name` reaches a form submission, same reasoning as Select's own hidden `<select>`:
          the trigger is a button, not a form control. */}
      {/* `aria-hidden`: the contract's own template states it as a static attr (`core/color-picker.ts`),
          because this input exists only so `name` reaches a form submission, never to be found by
          assistive tech. `getHiddenInputProps()` does not add it; the vanilla binding gets it for free
          from the authored template's own `attrs`, so this restates it explicitly for React too. */}
      <input {...api.getHiddenInputProps()} aria-hidden="true" className={colorPickerParts.hiddenInput} />
      <div {...api.getControlProps()} {...anchorProps(colorPickerParts.control)}>
        {/*
         * Zag ALWAYS sends an `aria-labelledby` (pointing at the field's label) in addition to its own
         * `aria-label` ("select color. current color is ..."); `aria-labelledby` beats `aria-label` in
         * the accessible name algorithm, so it is omitted here so that `triggerLabel`  -  THIS
         * contract's naming mechanism, defaulting to the contract's own "Choose color"  -  is the one in charge, the same
         * way the Vanilla binding does it.
         */}
        <button
          {...api.getTriggerProps()}
          aria-label={triggerLabel ?? colorPickerContract.options.triggerLabel.default}
          aria-labelledby={undefined}
          className={`${colorPickerParts.trigger} sk-button sk-interactive`}
          type="button"
        >
          <span className={colorPickerParts.swatch} />
          {showValue ? (
            <span className={colorPickerParts.value} title={api.valueAsString}>
              {api.valueAsString}
            </span>
          ) : null}
        </button>
      </div>
      <Portal container={container}>
        <div {...positionerProps(api.getPositionerProps(), colorPickerParts.positioner)}>
          <div {...api.getContentProps()} className={colorPickerParts.content}>
            <ColorPickerPanelBody api={api} anatomy={anatomy} swatches={swatches} />
          </div>
        </div>
      </Portal>
    </div>
  );
}

export function ColorPicker(props: ColorPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { api, resolvedId } = useColorPicker({ ...props, rootRef });
  return (
    <ColorPickerField
      anatomy="full"
      api={api}
      resolvedId={resolvedId}
      rootRef={rootRef}
      {...props}
      swatches={asSwatches(props.swatches)}
    />
  );
}

export function CompactColorPicker(props: ColorPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { api, resolvedId } = useColorPicker({ ...props, rootRef });
  return (
    <ColorPickerField
      anatomy="compact"
      api={api}
      resolvedId={resolvedId}
      rootRef={rootRef}
      {...props}
      swatches={asSwatches(props.swatches)}
    />
  );
}

export function SwatchColorPicker(props: ColorPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { api, resolvedId } = useColorPicker({ ...props, rootRef });
  return (
    <ColorPickerField
      anatomy="compact"
      api={api}
      resolvedId={resolvedId}
      rootRef={rootRef}
      {...props}
      showValue={false}
      swatches={asSwatches(props.swatches)}
    />
  );
}

const P = colorPickerPanelParts;

/*
 * THE PANEL BODY: area, hue/alpha rails, channel-input rows, presets, eyedropper. Entirely
 * derived from `api`, same role `CalendarBody` plays for DatePicker's calendar. `anatomy` gates
 * which rows render: "compact" stops after the area, hue rail and presets.
 */
function ColorPickerPanelBody({
  api,
  anatomy,
  swatches = [],
}: {
  api: ColorPickerApi;
  anatomy: "full" | "compact";
  swatches?: readonly string[];
}) {
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <>
      <div {...api.getAreaProps()} className={P.area}>
        <div {...api.getAreaBackgroundProps()} className={P.areaBackground} />
        <div {...api.getAreaThumbProps()} className={P.areaThumb} />
      </div>

      <div className={P.hueSlider} {...api.getChannelSliderProps({ channel: "hue" })}>
        <div className={P.hueTrack} {...api.getChannelSliderTrackProps({ channel: "hue" })}>
          <div className={P.hueThumb} {...api.getChannelSliderThumbProps({ channel: "hue" })} />
        </div>
      </div>

      {anatomy === "full" ? (
        <>
          <div className={P.alphaSlider} {...api.getChannelSliderProps({ channel: "alpha" })}>
            <div {...api.getTransparencyGridProps({ size: "8px" })} />
            <div className={P.alphaTrack} {...api.getChannelSliderTrackProps({ channel: "alpha" })}>
              <div className={P.alphaThumb} {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
            </div>
          </div>

          <div className={P.channels}>
            <input className={P.channelInput} {...api.getChannelInputProps({ channel: "hex" })} />
          </div>
        </>
      ) : null}

      {swatches.length > 0 ? (
        <div className={P.swatchGroup} {...api.getSwatchGroupProps()}>
          {swatches.map((swatch) => (
            <button
              className={P.swatchTrigger}
              key={swatch}
              {...api.getSwatchTriggerProps({ value: swatch })}
            >
              <span className={P.swatchSwatch} {...api.getSwatchProps({ value: swatch })} />
            </button>
          ))}
        </div>
      ) : null}

      {anatomy === "full" && hasEyeDropper ? (
        <button
          {...api.getEyeDropperTriggerProps()}
          className={`${P.eyedropper} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
        >
          {/* Un cuentagotas no está entre los roles estables del set de iconos (`icon.ts`); es la
              única afordancia de este componente, así que se dibuja aquí en vez de sumar un rol
              nuevo al vocabulario compartido por un solo consumidor. */}
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d="m2 22 1-4 9.5-9.5" />
            <path d="M12.5 8.5 16 5" />
            <path d="M14.5 3.5 20.5 9.5 17.5 12.5 11.5 6.5Z" />
          </svg>
        </button>
      ) : null}
    </>
  );
}

export type NativeColorPickerProps = {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  id?: string;
};

/*
 * THE NATIVE COLOR FIELD: the layer that works with no script at all.
 *
 * A real `<input type="color">` inside the same field chrome, so the enhanced control and this
 * one read as the SAME field rather than two designs. Its own signature rather than an option on
 * `ColorPicker`, for the reason `Select.native`/`NativeDatePicker` are one: choosing between them
 * is choosing who owns the behaviour, and no flag should be able to stand in for that decision.
 */
export function NativeColorPicker({ defaultValue, id, label, name, value }: NativeColorPickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [picked, setPicked] = useState(defaultValue ?? "#000000");
  const [draft, setDraft] = useState<string | null>(null);
  const current = value ?? picked;

  return (
    <div className={colorPickerParts.root} {...{ [colorPickerAttrs.native]: "" }}>
      {/* Named through `aria-labelledby` rather than `for`/`id`: same reason `NativeDatePicker`
          gives  -  the two bindings render into one document in the symmetry gate, and a literal
          id would collide across them. */}
      <label className={colorPickerParts.label} id={`${inputId}-label`}>
        {label}
      </label>
      <div className={colorPickerParts.control}>
        <input
          aria-labelledby={`${inputId}-label`}
          className={colorPickerParts.trigger}
          name={name}
          onChange={(event) => {
            setPicked(event.target.value);
            setDraft(null);
          }}
          type="color"
          value={current}
        />
        {/* The hex, typed or read: a draft while it is not a color yet, the committed color after. */}
        <input
          aria-labelledby={`${inputId}-label`}
          autoComplete="off"
          className={colorPickerParts.nativeValue}
          inputMode="text"
          maxLength={7}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            setDraft(event.target.value);
            const hex = normalizeHex(event.target.value);
            if (hex) setPicked(hex);
          }}
          spellCheck={false}
          type="text"
          value={draft ?? current}
        />
      </div>
    </div>
  );
}
