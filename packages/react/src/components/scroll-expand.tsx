import { scrollExpandContract, scrollExpandParts, type ScrollExpandDirection } from "@skryensya/core/scroll-expand";
import type { HTMLAttributes, ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { direction: directionOption } = scrollExpandContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ScrollExpandProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** `expand` opens from a small window to full; `contract` starts full and closes to the window as you scroll. */
  direction?: ScrollExpandDirection;
  /**
   * What fills the container that opens, from the first frame: a photo, a video, a tinted slab. It is laid out at full
   * size and clipped, so it should fill its box.
   */
  children: ReactNode;
  /**
   * What arrives as the window opens, centred over the backdrop: the smaller words, the figures. Each child rises into
   * place after the one before. Give the root `--sk-scroll-expand-scrim` for a wash behind them over a photo.
   */
  reveal?: ReactNode;
  /**
   * The big words above the window before it opens. The box fades out (and lifts a little) as the window opens; the words
   * in it are yours.
   */
  lead?: ReactNode;
  /** What follows once the container is full. */
  after?: ReactNode;
};

/**
 * A container that opens from a small window to fill the box as the page scrolls. The stage is held for one box-height
 * of scroll, then what follows scrolls in.
 *
 * The motion is CSS driven by the scroll itself, with no JavaScript: a browser that cannot do that, or a reader who asks
 * for reduced motion, gets the lead, the container at full size and what follows, one after the other. The parts are
 * plain `div`s with no role. Inside a scrolling box of your own, give that box `container-type: size`.
 */
export function ScrollExpand({ after, children, className, direction = directionOption.default, lead, reveal, ...props }: ScrollExpandProps) {
  return (
    <div {...props} className={cx(scrollExpandParts.root, className)} data-direction={direction}>
      <div className={scrollExpandParts.track}>
        <span aria-hidden="true" className={scrollExpandParts.clock} />
        <div className={scrollExpandParts.stage}>
          {lead != null ? <div className={scrollExpandParts.lead}>{lead}</div> : null}
          <div className={scrollExpandParts.container}>
            <div className={scrollExpandParts.backdrop}>{children}</div>
            {reveal != null ? <div className={scrollExpandParts.reveal}>{reveal}</div> : null}
          </div>
        </div>
      </div>
      {after != null ? <div className={scrollExpandParts.after}>{after}</div> : null}
    </div>
  );
}
