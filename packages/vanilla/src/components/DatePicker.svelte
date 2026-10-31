<script lang="ts">
  import { anchoredParts, anchoredPositioning } from "@skryensya/core/anchored";
  import { datePicker } from "@skryensya/core/machines";
  import {
    calendarMonthCount,
    defaultDayLabel,
    defaultNextTriggerLabel,
    defaultPrevTriggerLabel,
    defaultViewTriggerLabel,
    parseCalendarDate,
    unusedIntlTranslations,
  } from "@skryensya/core/calendar";
  import { datePickerContract, datePickerEvents, datePickerParts, defaultContentLabel, defaultEndDateLabel, defaultTriggerLabel } from "@skryensya/core/date-picker";
  import { calendarParts } from "@skryensya/core/calendar";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onMount } from "svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";
  import CalendarView from "./CalendarView.svelte";

  /*
   * DATE PICKER, a machine-backed enhancer over `@zag-js/date-picker` (the SAME machine React uses).
   *
   * It splits the work by owner, like Carousel: the CONTROL (label, input, trigger, clear) is authored
   * markup that gets patched; the CALENDAR is chrome derived from the state and owned by `CalendarView`
   * (shared with the standalone Calendar), and this component only puts the popover around it.
   *
   * The native `type="date"` input is still the no-JS layer: it shares `.sk-date-picker__control`, so
   * the native version and the enhanced one look like the SAME field, and without the vanilla layer
   * mounted the consumer authors the native one. This enhancer only appears when the markup asks for
   * `data-sk-date-picker`.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`.${datePickerParts.label}`);
  const control = root.querySelector<HTMLElement>(`.${datePickerParts.control}`);
  const input = root.querySelector<HTMLInputElement>(`.${datePickerParts.input}`);
  const trigger = root.querySelector<HTMLButtonElement>(`.${datePickerParts.trigger}`);
  const clear = root.querySelector<HTMLButtonElement>(`.${datePickerParts.clear}`);
  const authoredPlaceholder = input?.getAttribute("placeholder") ?? null;
  const authoredClearLabel = clear?.getAttribute("aria-label") ?? null;

  if (!control) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.control}.`);
  if (!input) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.input}.`);
  if (!trigger) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.trigger}.`);

  const inputs = [...control.querySelectorAll<HTMLInputElement>(`.${datePickerParts.input}`)];
  if (root.dataset.selectionMode === "range" && inputs.length === 1) {
    const endInput = input.cloneNode(true) as HTMLInputElement;
    endInput.removeAttribute("id");
    endInput.value = "";
    input.after(endInput);
    inputs.push(endInput);
  }

  if (!root.id) root.id = uniqueId("sk-date-picker");
  const locale = root.dataset.locale || datePickerContract.options.locale.default;

  /* The positioner is rendered by this component (it is derived chrome), so the reference comes from the
   * template below and not from a query over authored markup, like the control does. */
  let positioner: HTMLElement | undefined = $state();

  const service = useMachine(datePicker.machine, () => ({
    positioning: { ...anchoredPositioning, placement: root.dataset.selectionMode === "range" ? "bottom" as const : "bottom-start" as const },
    id: root.id,
    name: root.dataset.name || input.name || undefined,
    // Explicit date, never an ambiguous locale string: locale and time zone are authored or fall back to es/UTC.
    locale,
    timeZone: root.dataset.timeZone || "UTC",
    selectionMode: (root.dataset.selectionMode === "range" ? "range" : "single") as "single" | "range",
    numOfMonths: calendarMonthCount(Number(root.dataset.numOfMonths), root.dataset.selectionMode === "range" ? "range" : "single"),
    /* The initial date and the allowed range. All three were missing: the authored markup had no way to
     * state any of them, while the React binding accepted props this half discarded. */
    defaultValue: root.dataset.value?.split(" ").filter(Boolean).map((date) => parseCalendarDate(date)!),
    min: parseCalendarDate(root.dataset.min),
    max: parseCalendarDate(root.dataset.max),
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    required: root.hasAttribute("data-required"),
    invalid: root.hasAttribute("data-invalid"),
    // Stable calendar height across months: always six rows, so opening does not reflow the page.
    fixedWeeks: true,
    /*
     * Zag's own `defaultTranslations` is English only, with no language condition. A date picker in
     * Spanish announced "Choose 15 de agosto" in English, the same gap that was fixed in the React binding.
     */
    translations: {
      ...unusedIntlTranslations(),
      trigger: defaultTriggerLabel(locale),
      content: defaultContentLabel(locale),
      dayCell: defaultDayLabel(locale),
      viewTrigger: defaultViewTriggerLabel(locale),
      prevTrigger: defaultPrevTriggerLabel(locale),
      nextTrigger: defaultNextTriggerLabel(locale),
    },
    onValueChange(details: { valueAsString: string[] }) {
      root.dispatchEvent(
        new CustomEvent(datePickerEvents.valueChange, { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
  }));

  const api = $derived(datePicker.connect(service, normalizeProps));


  /*
   * The calendar's own triggers (prev/next/view/day) are rendered by CalendarView with their handlers
   * already wired by Svelte, so only the authored control appears here.
   */
  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "label", node: () => label, props: () => api.getLabelProps() },
    {
      part: "control",
      node: () => control,
      props: () => api.getControlProps(),
      classes: [anchoredParts.anchor],
    },
    ...inputs.map((node, index): PartBinding => ({
      part: "input",
      node: () => node,
      props: () => api.getInputProps({ index }),
      events: true,
      after: () => {
        const value = api.getInputProps({ index }).value;
        if (typeof value === "string") node.value = value;
        if (authoredPlaceholder !== null) node.placeholder = authoredPlaceholder;
        if (index === 1) node.setAttribute("aria-label", defaultEndDateLabel(locale));
      },
    })),

    { part: "trigger", node: () => trigger, props: () => api.getTriggerProps(), events: true },
    {
      part: "clearTrigger",
      node: () => clear,
      props: () => api.getClearTriggerProps(),
      events: true,
      after: (node) => {
        if (authoredClearLabel !== null) node.setAttribute("aria-label", authoredClearLabel);
        // Clear only makes sense with a date set; with no value it takes up no room in the field.
        node.hidden = api.value.length === 0;
      },
    },
  ];

  bindParts(bindings);

  onMount(() => {
    // The chevrons are authored as `data-sk-icon` placeholders and hydrated by the already-registered set.
    remountIcons(root);
  });
</script>

<div
  bind:this={positioner}
  {...api.getPositionerProps()}
  class="{datePickerParts.positioner} {anchoredParts.positioner}"
>
  <div {...api.getContentProps()} class="{datePickerParts.content} {calendarParts.root}" data-num-of-months={api.numOfMonths} data-selection-mode={root.dataset.selectionMode === "range" ? "range" : "single"}>
    <CalendarView {api} {locale} />
    <button
      type="button"
      class="{datePickerParts.close} sk-button sk-interactive"
      data-size="sm"
      data-variant="ghost"
      onclick={() => api.setOpen(false)}
    >
      {defaultTriggerLabel(locale)(true)}
    </button>
  </div>
</div>
