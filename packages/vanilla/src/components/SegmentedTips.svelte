<script lang="ts">
  import { anchoredPositioning } from "@skryensya/core/anchored";
  import { tooltip } from "@skryensya/core/machines";
  import { tooltipContract, tooltipDefaultPlacement, tooltipPlacementToZag } from "@skryensya/core/tooltip";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { uniqueId } from "../runtime/svelte-hydrate";

  /*
   * The icon-only options' tooltip (see core/segmented.ts): one Tooltip machine for the group, the
   * SAME machine React runs, each icon-only option a trigger of it. Mounted by `connectSegmented`,
   * which builds the box; this only patches the machine's props onto the options and the box.
   */
  let { root, tips, positioner, content }: {
    root: HTMLElement;
    tips: ReadonlyMap<string, string>;
    positioner: HTMLElement;
    content: HTMLElement;
  } = $props();

  const service = useMachine(tooltip.machine, () => ({
    id: uniqueId("sk-segmented-tip"),
    interactive: tooltipContract.options.interactive.default,
    positioning: { placement: tooltipPlacementToZag[tooltipDefaultPlacement], ...anchoredPositioning },
  }));
  const api = $derived(tooltip.connect(service, normalizeProps));

  const optionFor = (value: string) =>
    root.querySelector<HTMLElement>(`[data-sk-segmented-option][data-value="${CSS.escape(value)}"]`);

  const bindings: PartBinding[] = [
    ...[...tips.keys()].map((value): PartBinding => ({
      part: "trigger",
      node: () => optionFor(value),
      /* Visual only: the option is already named by these words, so it is never described by them. */
      props: () => {
        const { "aria-describedby": _describedBy, ...props } = api.getTriggerProps({ value });
        return props;
      },
      events: true,
    })),
    { part: "positioner", node: () => positioner, props: () => api.getPositionerProps() },
    {
      part: "content",
      node: () => content,
      props: () => api.getContentProps(),
      events: true,
      after: (node) => {
        node.setAttribute("aria-hidden", "true");
        node.textContent = tips.get(api.triggerValue ?? "") ?? "";
      },
    },
  ];

  bindParts(bindings);
</script>
