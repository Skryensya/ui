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
  /** Set when the keyboard is choosing the place: `at` indexes `allowed`, and Enter drops there. */
  readonly keyboard?: boolean;
  readonly at?: number;
};

/** Says where a place is on a surface, or that it is not on it. The pointer's inverse. */
export type Placer = (place: Place) => Target | undefined;

export function useDrag(root: MakerNode, gesture: (operations: readonly Operation[], select?: string) => void) {
  const [session, setSession] = useState<Session>();
  const resolvers = useRef(new Map<string, Resolver>());
  const placers = useRef(new Map<string, Placer>());
  const current = useRef<Session | undefined>(undefined);
  current.current = session;

  const register = useCallback((name: string, resolver: Resolver, placer?: Placer) => {
    resolvers.current.set(name, resolver);
    if (placer) placers.current.set(name, placer);
    return () => {
      resolvers.current.delete(name);
      placers.current.delete(name);
    };
  }, []);

  const targetFor = (place: Place | undefined): Target | undefined => {
    if (!place) return undefined;
    for (const place_ of placers.current.values()) {
      const found = place_(place);
      if (found) return found;
    }
    return undefined;
  };

  const begin = useCallback(
    (child: MakerChild, fresh: boolean) => setSession({ child, fresh, allowed: dropTargets(root, child) }),
    [root],
  );

  /** The keyboard's drag: the same session, its place chosen from `allowed` instead of found under a pointer. */
  const beginKeyboard = useCallback(
    (child: MakerChild, start?: Place) => {
      const allowed = dropTargets(root, child);
      const found = start ? allowed.findIndex((p) => p.parent === start.parent && p.slot === start.slot && p.index === start.index) : -1;
      const at = Math.max(found, 0);
      setSession({ child, fresh: true, allowed, keyboard: true, at, target: targetFor(allowed[at]) });
    },
    [root],
  );

  const step = useCallback((delta: number) => {
    const active = current.current;
    if (!active?.keyboard || active.allowed.length === 0) return;
    const at = (((active.at ?? 0) + delta) % active.allowed.length + active.allowed.length) % active.allowed.length;
    setSession({ ...active, at, target: targetFor(active.allowed[at]) });
  }, []);

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
      const place = active?.target?.place ?? (active?.keyboard ? active.allowed[active.at ?? 0] : undefined);
      if (!drop || !active || !place) return;
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
    const keyboard = session.keyboard === true;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return end(false);
      if (!keyboard) return;
      /* Captured, so the focused button neither scrolls its list nor presses itself as the drop is chosen. */
      const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
      if (next !== 0) {
        event.preventDefault();
        event.stopPropagation();
        step(next);
      } else if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        end(true);
      }
    };
    if (!keyboard) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [session !== undefined, session?.keyboard, move, end, step]);

  return { session, begin, beginKeyboard, step, move, end, register };
}

export type Drag = ReturnType<typeof useDrag>;

/** Past this many pixels a press becomes a drag; short of it, it stays a click. */
export const DRAG_THRESHOLD = 4;
