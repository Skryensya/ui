import { scrollStackParts } from "@skryensya/core/scroll-stack";
import type { HTMLAttributes, ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ScrollStackProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * The section that stays behind and recedes as the other rises over it: it scales down a little, dims and rounds
   * its corners. It is held in place while covered, so it should fit the scrolling box.
   */
  back: ReactNode;
  /**
   * The section that rises over it. Any height: it is opaque, so it covers, and its content settles as it docks. Its
   * direct children arrive one after another as it rises (pass a fragment of several, not one wrapping box, to see the cascade).
   */
  front: ReactNode;
};

/**
 * Two sections where the second slides up over the first as the page scrolls: a cover, not a carousel.
 *
 * The motion is CSS driven by the scroll itself, with no JavaScript: a browser that cannot do that, or a reader who asks
 * for reduced motion, gets the two sections one after the other in normal flow. The layers are plain `div`s with no
 * role; put a `section` and a heading inside each. Inside a scrolling box of your own, give that box
 * `container-type: size` so the component measures it and not the window.
 */
export function ScrollStack({ back, className, front, ...props }: ScrollStackProps) {
  return (
    <div {...props} className={cx(scrollStackParts.root, className)}>
      <div className={scrollStackParts.back}>{back}</div>
      <div className={scrollStackParts.front}>
        <span aria-hidden="true" className={scrollStackParts.runway} />
        <div className={scrollStackParts.content}>{front}</div>
      </div>
    </div>
  );
}
