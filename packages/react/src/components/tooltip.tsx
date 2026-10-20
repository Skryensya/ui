import {
  tooltipContract,
  tooltipDefaultPlacement,
  tooltipEvents,
  tooltipParts,
  tooltipPlacementToZag,
  type TooltipOptions,
} from "@skryensya/core/tooltip";
import { tooltip } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useRef, type ReactNode, type RefObject } from "react";
import { anchoredParts, anchoredPositioning } from "@skryensya/core/anchored";
import { anchorProps, positionerProps } from "./anchored.js";

const { interactive: interactiveOption } = tooltipContract.options;

export type TooltipProps = TooltipOptions & {
  /**
   * The control the tooltip describes. It must carry its own accessible name: the tooltip is wired
   * as `aria-describedby`, never as the label. See the contract in `@skryensya/core/tooltip`.
   */
  children: ReactNode;
  /** The description itself. Short: it is a hint, not a panel. Matches the contract slot. */
  content: string;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  /**
   * Where the floating content is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead: a preview
   * frame, a scoped test harness, or a dialog that owns its own stacking context.
   */
  container?: RefObject<HTMLElement>;
};

export function Tooltip({
  container,
  id,
  arrow = false,
  children,
  content,
  openDelay,
  closeDelay,
  // On by default: it is what satisfies WCAG 1.4.13 "hoverable" (see @skryensya/core/tooltip).
  interactive = interactiveOption.default,
  placement,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  /*
   * The default is RESOLVED rather than left absent. The box copes without it, the arrow does not:
   * the machine, the stylesheet and the arrow then all name the same side.
   */
  const side = placement ?? tooltipDefaultPlacement;
  const service = useMachine(tooltip.machine, {
    id: id ?? generatedId,
    openDelay,
    closeDelay,
    interactive,
    positioning: { placement: tooltipPlacementToZag[side], ...anchoredPositioning },
    disabled,
    open,
    defaultOpen,
    onOpenChange: (details) => {
      onOpenChangeRef.current?.(details);
      rootRef.current?.dispatchEvent(
        new CustomEvent(tooltipEvents.openChange, { bubbles: true, detail: { open: details.open } }),
      );
    },
  });
  const api = tooltip.connect(service, normalizeProps);

  const triggerProps = api.getTriggerProps();
  const contentProps = api.getContentProps();
  /*
   * The arrow takes the machine's props: they mark it `[data-part=arrow]`, which is how `@zag-js/popper`
   * finds it to move it, plus `data-side`, the side the machine RESOLVED, which is what the sheet reads
   * to turn the diamond.
   */
  const arrowNode = arrow ? (
    <span
      aria-hidden="true"
      className={anchoredParts.arrow}
      {...api.getArrowProps()}
      data-side={(contentProps as Record<string, unknown>)["data-side"] as string | undefined}
    />
  ) : null;

  return (
    /*
     * A ROOT ELEMENT, not a fragment. The enhancer's whole scan is scoped to `[data-sk-anchor]`: it
     * finds the trigger, the positioner and the content by querying inside it, so authored markup
     * cannot omit it, which means the template cannot either, which means this binding owes the same
     * element. Rendering a fragment made the two bindings disagree about the outermost node of the
     * component, and nothing compared them until a canonical tree existed.
     */
    /*
     * The root carries the MACHINE's id, as the enhancer's root does: Zag points `data-ownedby` at
     * it from the trigger, so without it that attribute referenced an element this binding never
     * rendered. A dangling reference, identical in shape to a mistyped `aria-describedby`.
     */
    <span
      className={tooltipParts.root}
      // The contract's `arrow` option lands on the root, as authored markup writes it: without this
      // React drew the arrow but never said so, and the two roots differed by one attribute.
      data-arrow={arrow ? "" : undefined}
      data-sk-anchor=""
      id={id ?? generatedId}
      ref={rootRef}
    >
      {/*
       * `getTriggerProps` returns button props, so the trigger is a real span-wrapper around whatever
       * the consumer passed rather than a nested <button>: wrapping their control in our own button
       * would put two controls in the tab order for one action.
       */}
      <span {...triggerProps} {...anchorProps(tooltipParts.trigger, triggerProps.style)}>
        {children}
      </span>
      {/*
       * Rendered whether or not it is open, and hidden by the machine's own `hidden` prop: the same
       * rendered-and-hidden rule the combobox and the date picker follow. The enhancer patches
       * authored markup that is always present, so "closed" has to mean hidden rather than absent
       * for the two bindings to describe one component.
       */}
      <Portal container={container}>
        <div
          {...positionerProps(api.getPositionerProps(), tooltipParts.positioner)}
          data-sk-placement={side}
        >
          {arrowNode}
          <div
            {...contentProps}
            className={tooltipParts.content}
            data-interactive={interactive ? undefined : "false"}
          >
            {content}
          </div>
        </div>
      </Portal>
    </span>
  );
}
