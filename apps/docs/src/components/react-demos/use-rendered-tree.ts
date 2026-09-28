/*
 * A usage tree, drawn live by the React binding into the page itself: what `UsagePreview` shows.
 * Not the isolated-iframe machinery `tree.tsx` wraps `renderTree` in
 * (`framed()`): that exists so a preview's own styles never leak into the parent document, the
 * wrong trade for a card whose whole point is to sit in the page and react at once.
 *
 * The bindings a tree needs load once, on mount; until they have, the hook answers `null` and the
 * card shows its empty stage.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { UsageTree } from "@skryensya/core/usage-tree";

type Render = (tree: UsageTree, key?: string | number) => ReactNode;

export function useRenderedTree(tree: UsageTree): Render | null {
  const [render, setRender] = useState<Render | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("@skryensya/react/render-tree").then(async (mod) => {
      await mod.loadTree(tree);
      if (!cancelled) setRender(() => mod.renderTree);
    });
    return () => {
      cancelled = true;
    };
    // The tree's SHAPE (which families it uses) is fixed for a card's lifetime; a property card only
    // changes one option's value, which never changes which bindings have to load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return render;
}
