import { useCallback, useEffect, useRef, useState } from "react";
import { dropTargets, type MakerChild, type MakerNode, type Operation, type Place } from "@skryensya/maker-model";
import type { Indicator } from "./stage/geometry";

/*
 * ONE DRAG, WHEREVER IT STARTED. The outline, the palette and the stage each resolve a pointer
 * over themselves into a `Place`; this keeps the session, asks whichever surface is under the
 * pointer, and on release emits exactly one operation: a `move` for a node already in the page, an
 * `insert` for one coming from the palette. The allowed places are the model's, computed once when
 * the drag starts, so no surface can offer a drop the contract refuses.
 */

export type Target = { readonly place: Place; readonly indicator: Indicator; readonly surface: "stage" | "outline" };

/** Resolves a point in the Maker's own viewport to a target, or says it is not over this surface. */
export type Resolver = (x: number, y: number, allowed: readonly Place[]) => Target | undefined;

export type Session = {
  readonly child: MakerChild;
  readonly fresh: boolean;
  readonly allowed: readonly Place[];
  readonly target?: Target;
};

export function useDrag(root: MakerNode, gesture: (operations: readonly Operation[], select?: string) => void) {
  const [session, setSession] = useState<Session>();
  const resolvers = useRef(new Map<string, Resolver>());
  const current = useRef<Session | undefined>(undefined);
  current.current = session;

  const register = useCallback((name: string, resolver: Resolver) => {
    resolvers.current.set(name, resolver);
    return () => void resolvers.current.delete(name);
  }, []);

  const begin = useCallback(
    (child: MakerChild, fresh: boolean) => setSession({ child, fresh, allowed: dropTargets(root, child) }),
    [root],
  );

  const move = useCallback((x: number, y: number) => {
    const active = current.current;
    if (!active) return;
    let target: Target | undefined;
    for (const resolve of resolvers.current.values()) {
      target = resolve(x, y, active.allowed);
      if (target) break;
    }
    setSession({ ...active, target });
  }, []);

  const end = useCallback(
    (drop: boolean) => {
      const active = current.current;
      setSession(undefined);
      if (!drop || !active?.target) return;
      const { place } = active.target;
      gesture(
        [active.fresh ? { type: "insert", at: place, child: active.child } : { type: "move", child: active.child.id, to: place }],
        active.child.id,
      );
    },
    [gesture],
  );

  useEffect(() => {
    if (!session) return;
    const onMove = (event: PointerEvent) => move(event.clientX, event.clientY);
    const onUp = () => end(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") end(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [session !== undefined, move, end]);

  return { session, begin, move, end, register };
}

export type Drag = ReturnType<typeof useDrag>;

/** Past this many pixels a press becomes a drag; short of it, it stays a click. */
export const DRAG_THRESHOLD = 4;
