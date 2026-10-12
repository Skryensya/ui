import type { ChangeEvent, FocusEventHandler, FormHTMLAttributes, ReactNode, Ref } from "react";
import {
  FormProvider,
  useController,
  useFormContext,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { FormField, useFormFieldControl, type FormFieldProps } from "../components/form-field.js";

/*
 * REACT HOOK FORM, drawn with this system's FormField. The library owns the VALUE (what the field
 * holds, when it is valid, what the form submits); `FormField` owns the CHROME (the label, the hint,
 * the error, and the ids that tie them to the control). This file is the seam: it hands the field's
 * error to the chrome and the field's value to the control, and decides nothing about either.
 *
 * Validation is the library's, and so is the schema: a resolver (`@hookform/resolvers/zod` and the
 * rest) is passed to `useForm`, and its messages arrive here as `fieldState.error.message`, which
 * becomes the field's error. Nothing in this system knows which validator is in use.
 */

/**
 * What every adapter below hands a control, beyond the shape of its own value. The three `aria`/`id`
 * props are the FormField's wiring: only `Input` and `SelectNative` read it from context, so a
 * `Checkbox`, a `Switch` or any other control would otherwise sit beside a label that points at
 * nothing and an error nobody announces. Handing them over here closes that for every control.
 */
type Common = {
  name: string;
  onBlur: FocusEventHandler<HTMLElement>;
  disabled?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/**
 * Props for a control that speaks the DOM's `change` event: `Input`, `Textarea`, `SelectNative`.
 * The value is the DOM's string, so an unset field reads as an empty one instead of switching the
 * control from uncontrolled to controlled on its first keystroke.
 */
export type InputBinding = Common & {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ref: Ref<HTMLInputElement>;
};

/** Props for `Checkbox` and `Switch`: `checked` plus `onCheckedChange({ checked })`. */
export type CheckedBinding = Common & {
  checked: boolean;
  onCheckedChange: (details: { checked: boolean | "indeterminate" }) => void;
  ref: Ref<HTMLInputElement>;
};

/**
 * Props for the controls that report `onValueChange`, whose value keeps its own shape: an array for
 * `Select`/`Combobox`/`TagsInput`/`DatePicker`, a string for `Segmented`/`OtpInput`/`RadioGroup`/
 * `ColorPicker`, a number for `Slider`/`Rating`. The form field holds exactly what the control
 * reports, so `defaultValues` must use the same shape.
 */
export type ValueBinding<TValue> = Common & {
  value: TValue;
  onValueChange: (change: TValue | { value: TValue }) => void;
};

export type FieldBindings = {
  input: () => InputBinding;
  checked: () => CheckedBinding;
  value: <TValue = unknown>() => ValueBinding<TValue>;
};

/** `{ value }` (Zag's details object) or the bare value (a control that reports it directly). */
const unwrap = (change: unknown): unknown =>
  typeof change === "object" && change !== null && !Array.isArray(change) && "value" in change
    ? (change as { value: unknown }).value
    : change;

function bindingsOf(
  field: ControllerRenderProps<FieldValues, string>,
  wiring: { id?: string; describedBy?: string; invalid: boolean },
): FieldBindings {
  const common: Common = {
    name: field.name,
    onBlur: field.onBlur as FocusEventHandler<HTMLElement>,
    disabled: field.disabled,
    id: wiring.id,
    "aria-describedby": wiring.describedBy,
    "aria-invalid": wiring.invalid ? true : undefined,
  };
  return {
    input: () => ({
      ...common,
      value: field.value == null ? "" : String(field.value),
      onChange: field.onChange,
      ref: field.ref,
    }),
    checked: () => ({
      ...common,
      checked: field.value === true,
      onCheckedChange: ({ checked }) => field.onChange(checked === true),
      ref: field.ref,
    }),
    value: <TValue,>() => ({
      ...common,
      value: field.value as TValue,
      onValueChange: (change: TValue | { value: TValue }) => field.onChange(unwrap(change)),
    }),
  };
}

export type ControlledFieldRender<TValues extends FieldValues, TName extends FieldPath<TValues>> = {
  /** The library's own render props, untouched, for a control no adapter fits. */
  field: ControllerRenderProps<TValues, TName>;
  fieldState: ControllerFieldState;
  /** Adapters that turn `field` into the props of this system's controls. */
  bind: FieldBindings;
};

export type ControlledFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = Pick<
  FormFieldProps,
  "label" | "hint" | "labelHidden" | "className" | "id"
> & {
  name: TName;
  /** Optional inside a `Form`: it is read from the form's context. */
  control?: Control<TValues>;
  rules?: Omit<RegisterOptions<TValues, TName>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
  defaultValue?: unknown;
  shouldUnregister?: boolean;
  /** Draws the required marker. Defaults to whether `rules.required` is set; a schema resolver sets no rules, so say it here. */
  required?: boolean;
  disabled?: boolean;
  children: (props: ControlledFieldRender<TValues, TName>) => ReactNode;
};

/**
 * Renders the field's control INSIDE the FormField, which is the only place the field's ids exist:
 * `useFormFieldControl` reads the context the field provides, and `ControlledField` itself sits
 * above it.
 */
function FieldBody<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  field,
  fieldState,
  render,
}: {
  field: ControllerRenderProps<TValues, TName>;
  fieldState: ControllerFieldState;
  render: ControlledFieldProps<TValues, TName>["children"];
}) {
  const wiring = useFormFieldControl({});
  const bind = bindingsOf(field as unknown as ControllerRenderProps<FieldValues, string>, {
    id: wiring.id,
    describedBy: wiring.describedBy,
    invalid: wiring.invalid,
  });
  return <>{render({ field, fieldState, bind })}</>;
}

/**
 * One field of a react-hook-form form, in this system's FormField. The error is the field's own
 * (`fieldState.error.message`), so it prints under the control, is announced through
 * `aria-describedby`, and marks the control invalid, with nothing for the author to wire.
 */
export function ControlledField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  children,
  control,
  defaultValue,
  disabled,
  name,
  required,
  rules,
  shouldUnregister,
  ...fieldProps
}: ControlledFieldProps<TValues, TName>) {
  const context = useFormContext<TValues>();
  const { field, fieldState } = useController<TValues, TName>({
    name,
    control: control ?? context?.control,
    rules,
    defaultValue: defaultValue as never,
    shouldUnregister,
    disabled,
  });

  return (
    <FormField
      {...fieldProps}
      disabled={disabled}
      error={fieldState.error?.message}
      required={required ?? Boolean(rules?.required)}
    >
      <FieldBody field={field} fieldState={fieldState} render={children} />
    </FormField>
  );
}

export type FormProps<TValues extends FieldValues, TContext, TTransformed> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit" | "noValidate"
> & {
  /** The object `useForm` returned. */
  form: UseFormReturn<TValues, TContext, TTransformed>;
  /** Runs with the validated values, after the resolver (or the rules) accepted them. */
  onSubmit: SubmitHandler<TTransformed>;
  /** Runs when validation rejected the submit. The fields already show their errors. */
  onInvalid?: SubmitErrorHandler<TValues>;
  children: ReactNode;
};

/**
 * The `<form>` for a react-hook-form instance: it puts the form in context (so a `ControlledField`
 * needs no `control`) and routes the submit through the library. The browser's own validation bubbles
 * are off (`noValidate`) because the library already validates, and two validators disagreeing about
 * the same field is the worst experience a form can have; the messages that remain are the field's own.
 */
export function Form<TValues extends FieldValues, TContext = unknown, TTransformed = TValues>({
  children,
  form,
  onInvalid,
  onSubmit,
  ...props
}: FormProps<TValues, TContext, TTransformed>) {
  return (
    <FormProvider {...(form as unknown as UseFormReturn<TValues>)}>
      <form {...props} noValidate onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {children}
      </form>
    </FormProvider>
  );
}
