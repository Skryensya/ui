import { scrollHintContract, scrollHintParts, type ScrollHintAxis } from "@skryensya/core/scroll-hint";
import { watchScrollHint } from "@skryensya/core/scroll-hint-dom";
import { useEffect, useRef, type HTMLAttributes } from "react";

export type ScrollHintProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "hidden"> & {
  /** A localized description; the animated arrow is decorative. */
  children: string;
  axis?: ScrollHintAxis;
  /** Selector for the actual scroll container; otherwise nearest scrolling ancestor or page. */
  scroller?: string;
};

export function ScrollHint({ children, axis = scrollHintContract.options.axis.default, scroller, className, ...props }: ScrollHintProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return watchScrollHint(root.current);
  }, [axis, scroller]);
  return (
    <div {...props} ref={root} hidden className={[scrollHintParts.root, className].filter(Boolean).join(" ")} data-sk-scroll-hint="" data-axis={axis} data-scroller={scroller}>
      <span className={scrollHintParts.indicator} aria-hidden="true"><span className={scrollHintParts.mark} /></span>
      <span className={scrollHintParts.label}>{children}</span>
    </div>
  );
}
