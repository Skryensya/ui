import { morphStackContract, morphStackParts } from "@skryensya/core/morph-stack";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/* Derived, never restated: the values and defaults live in the contract. */
const o = morphStackContract.options;

export type MorphStackProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  SignatureOptionsOf<typeof morphStackContract, "MorphStack"> & {
    /** Optional fifth plate, behind the back one. Revealed last, and invisible at rest. */
    deepest?: ReactNode;
    /** Revealed behind the middle plate when the stack opens. Invisible at rest. */
    back: ReactNode;
    /** The picture at rest. */
    middle: ReactNode;
    /** Lifted toward the viewer when the stack opens. */
    front: ReactNode;
    /** Optional fifth plate, over the front one. Lifted furthest. */
    nearest?: ReactNode;
  };

/**
 * Three to five plates that fan out into an isometric stack. `turn` picks which way it swings and `perspective` how close the viewer stands. `state` is yours: `"expanded"` and `"rest"` stay where you put
 * them, and the default `"auto"` opens while a fine pointer is over the stack or focus is inside it. The motion is
 * CSS over the system's motion tokens, with no JavaScript; the plates are plain `div`s, so put the semantics inside.
 */
export function MorphStack({ state = o.state.default, turn = o.turn.default, perspective, style, deepest, back, middle, front, nearest, className, ...props }: MorphStackProps) {
  return (
    <div
      {...props}
      className={className ? `${morphStackParts.root} ${className}` : morphStackParts.root}
      style={perspective === undefined ? style : ({ [o.perspective.styleProperty]: perspective, ...style } as CSSProperties)}
      {...{ [o.state.attr]: state, [o.turn.attr]: turn }}
    >
      <div className={morphStackParts.stage}>
        {deepest != null && <div className={morphStackParts.deepest}>{deepest}</div>}
        <div className={morphStackParts.back}>{back}</div>
        <div className={morphStackParts.middle}>{middle}</div>
        <div className={morphStackParts.front}>{front}</div>
        {nearest != null && <div className={morphStackParts.nearest}>{nearest}</div>}
      </div>
    </div>
  );
}
