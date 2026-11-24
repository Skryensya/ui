import { flushSync, getContext, mount, unmount, type Component } from "svelte";
import Imperative from "../components/Imperative.svelte";

/*
 * Hydration with Svelte 5, the engine behind the machine-backed enhancers.
 *
 * A machine-backed enhancer runs a Zag machine. Instead of reimplementing that machine by hand (what
 * the old FSMs did, duplicating what React already had from Zag), it is mounted by a `.svelte`
 * component that consumes the SAME machine from `@skryensya/core/machines` via `@zag-js/svelte`.
 * Svelte is internal implementation, never the consumer's contract: the `.svelte` is mounted in LIGHT
 * DOM over the `[data-sk-*]` root the consumer already wrote, no custom elements and no shadow DOM, so
 * `.hero .sk-tabs { … }` still reaches the element and the styling-hooks model stays intact.
 *
 * The component reads its root from CONTEXT (`getRoot()`), scans it, runs the machine and patches the
 * attributes onto the existing markup with `applyZagProps`; it renders no structure of its own. The
 * lifecycle contract (`data-sk-<key>-mounting`/`-ready`) makes mounting idempotent, same as the
 * attr-patch `createEnhancer` the machine-less enhancers still use.
 */

let counter = 0;
export const uniqueId = (prefix: string): string => `${prefix}-${(counter += 1)}`;

// The root is passed through CONTEXT and not through props: `getContext` returns a non-reactive value,
// so the component reads it in one line with `getRoot()`, without the `state_referenced_locally` warning
// or `$props()` boilerplate.
const ROOT_CONTEXT = Symbol("sk-root");

export const getRoot = (): HTMLElement => {
  const root = getContext<HTMLElement | undefined>(ROOT_CONTEXT);
  if (!(root instanceof HTMLElement)) {
    throw new Error("[ds] getRoot() se llamó fuera del contexto del enhancer; monta con createSvelteEnhancer().");
  }
  return root;
};

/** The imperative function a machine-less enhancer runs, passed through context to Imperative.svelte. */
export type Connect = (root: HTMLElement) => () => void;
const CONNECT_CONTEXT = Symbol("sk-connect");

// Root → how to unmount it. Filled in by `createConnectMount` on mount; consumed by `destroyMount`. It
// keeps the old runtime's public name, for the only case that needs it: re-mounting an enhancer with a
// different value (the site's playground re-points a Select).
const mountedApps = new WeakMap<HTMLElement, () => void>();

/*
 * EVERY MOUNTED ROOT, ITERABLE, so a subtree can be torn down and a root that left the page can be found. The WeakMap above
 * cannot be walked, and that is how a story re-rendered in Storybook (or a view swapped in an app) left its components
 * mounted on markup nobody could see: a Lightbox still listening on the document for its triggers, so the NEW Lightbox
 * with the same id never got the click.
 */
const liveRoots = new Set<HTMLElement>();
const observed = new WeakSet<Document>();
let sweepPending = false;

/*
 * Destroy every mounted root that is no longer in its document. Run a frame after a removal, so a root that was only moved
 * (taken out and put back in the same task, or the next frame) is left alone; and, synchronously, at the start of every mount
 * call. That second one matters: a machine's teardown finds its elements by id in the whole document, so an old instance
 * destroyed AFTER a re-render mounted its twin (same markup, same ids) would reach into the new one. Sweeping first means a
 * re-render always tears the old instance down before the new one exists.
 */
const sweep = (): void => {
  sweepPending = false;
  for (const root of [...liveRoots]) if (!root.isConnected) destroyMount(root);
};
const scheduleSweep = (): void => {
  if (sweepPending) return;
  sweepPending = true;
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(sweep);
  else setTimeout(sweep, 16);
};

/* One observer per document, started by the first mount in it: it only notices removals and schedules a sweep. */
const watch = (doc: Document): void => {
  if (observed.has(doc) || typeof MutationObserver === "undefined") return;
  observed.add(doc);
  new MutationObserver((records) => {
    if (records.some((record) => record.removedNodes.length > 0)) scheduleSweep();
  }).observe(doc, { childList: true, subtree: true });
};

const track = (root: HTMLElement, destroy: () => void): void => {
  mountedApps.set(root, destroy);
  liveRoots.add(root);
  watch(root.ownerDocument);
};

/** Unmounts the enhancer mounted on `root` (runs its cleanup) and releases the ready marker. */
export function destroyMount(root: HTMLElement): void {
  const destroy = mountedApps.get(root);
  mountedApps.delete(root);
  liveRoots.delete(root);
  destroy?.();
}

/**
 * Unmounts every component mounted inside `target` (and on it): their listeners, observers and controllers are released,
 * and the markup can be mounted again. Call it before throwing markup away: a story re-render, a view swap. Components
 * whose markup leaves the page are also torn down on their own a frame later; this is the immediate, explicit form.
 * Returns how many were destroyed.
 */
export function destroyComponents(target: Document | Element = document): number {
  let count = 0;
  for (const root of [...liveRoots]) {
    if (target === root || target.contains(root)) {
      destroyMount(root);
      count += 1;
    }
  }
  return count;
}

/** How many components are mounted inside `target` (and on it). For tests and devtools. */
export function countMountedComponents(target: Document | Element = document): number {
  let count = 0;
  for (const root of liveRoots) if (target === root || target.contains(root)) count += 1;
  return count;
}
/** Alias with the old runtime's public name. */
export const destroyEnhancer = destroyMount;
export const getConnect = (): Connect => {
  const connect = getContext<Connect | undefined>(CONNECT_CONTEXT);
  if (typeof connect !== "function") {
    throw new Error("[ds] getConnect() se llamó fuera del contexto de un enhancer imperativo; monta con createConnectMount().");
  }
  return connect;
};

export type EnhancerController = { root: HTMLElement; destroy: () => void };

export type Enhancer = {
  key: string;
  rootSelector: string;
  pendingSelector: string;
  mountAll: (target: Document | Element) => EnhancerController[];
};

export type SvelteEnhancerOptions = {
  key: string;
  rootSelector: string;
  Component: Component<Record<string, never>>;
};

/** Public mount shape shared by every Vanilla enhancer. */
export type Mount = (target?: Document | Element) => number;

export function createSvelteEnhancer(options: SvelteEnhancerOptions): Enhancer {
  const { key, rootSelector, Component } = options;
  const readyAttr = `data-sk-${key}-ready`;
  const mountingAttr = `data-sk-${key}-mounting`;
  const pendingSelector = `${rootSelector}:not([${readyAttr}]):not([${mountingAttr}])`;

  const create = (target: Element): EnhancerController | null => {
    if (!(target instanceof HTMLElement) || !target.matches(pendingSelector)) return null;

    target.setAttribute(mountingAttr, "true");
    const app = mount(Component, { target, context: new Map([[ROOT_CONTEXT, target]]) });
    // Mounting leaves the markup hydrated SYNCHRONOUSLY: `flushSync` runs the initial `$effect` (the one
    // that patches the attributes) before returning, so the enhancer is idempotent and testable without
    // waiting for a microtask. Later state changes can also be forced with `flushSync`.
    flushSync();
    target.removeAttribute(mountingAttr);
    target.setAttribute(readyAttr, "true");

    const destroy = () => {
      // Without `options.outro`, `component_root()` destroys the effect SYNCHRONOUSLY inside the very
      // executor of the Promise it returns: the `void` leaves nothing pending, the teardown (each
      // `.svelte`'s `onDestroy`, which release their listeners) has already run by the time this line
      // returns.
      void unmount(app);
      target.removeAttribute(readyAttr);
      mountedApps.delete(target);
      liveRoots.delete(target);
    };
    // The same registry `destroyMount()` reads for the imperative path (`createConnectMount`), so a
    // machine-backed enhancer can be unmounted the same way without the caller knowing which of the two
    // implementations mounted it.
    track(target, destroy);

    return { root: target, destroy };
  };

  const mountAll = (target: Document | Element = document): EnhancerController[] => {
    if (typeof document === "undefined") return [];
    sweep();
    const roots: HTMLElement[] = [];
    if (target instanceof HTMLElement && target.matches(pendingSelector)) roots.push(target);
    roots.push(...Array.from(target.querySelectorAll<HTMLElement>(pendingSelector)));
    return roots.map(create).filter((controller): controller is EnhancerController => controller !== null);
  };

  return { key, rootSelector, pendingSelector, mountAll };
}

/**
 * Turns one private Svelte implementation into the same small mount interface as the DOM-only
 * enhancers. The caller gets only a count, not controllers or the implementation's state machine.
 */
export function createSvelteMount(options: SvelteEnhancerOptions): Mount {
  const enhancer = createSvelteEnhancer(options);

  return (target) => {
    if (!target && typeof document === "undefined") return 0;
    return enhancer.mountAll(target ?? document).length;
  };
}

/**
 * Same small `Mount` interface for an enhancer that has NO Zag machine, the ones the platform gives
 * natively and the enhancer only syncs (button, slider, sidebar, toast, segmented, vaul). It mounts the
 * generic Imperative.svelte, which runs the imperative `connect` in its Svelte lifecycle, so there is a
 * SINGLE mount path (no legacy `createEnhancer`). The `connect` is passed by context, not props.
 */
export function createConnectMount(options: { key: string; rootSelector: string; connect: Connect }): Mount {
  const { rootSelector, connect } = options;
  // The imperative enhancers share the `data-sk-ready`/`-mounting` lifecycle marker (like the old
  // createEnhancer), not one per key: their selectors are disjoint, so a root is enhanced by exactly one
  // enhancer. Mounting is still Svelte (Imperative.svelte), not createEnhancer.
  const readyAttr = "data-sk-ready";
  const mountingAttr = "data-sk-mounting";
  // Comma-safe: the guard has to attach to EACH selector (Vaul is `[data-sk-vaul], [data-sk-dialog-vaul]`).
  const pendingSelector = rootSelector
    .split(",")
    .map((part) => `${part.trim()}:not([${readyAttr}]):not([${mountingAttr}])`)
    .join(", ");

  const create = (target: Element): boolean => {
    if (!(target instanceof HTMLElement) || !target.matches(pendingSelector)) return false;
    target.setAttribute(mountingAttr, "true");
    const app = mount(Imperative, {
      target,
      context: new Map<symbol, unknown>([
        [ROOT_CONTEXT, target],
        [CONNECT_CONTEXT, connect],
      ]),
    });
    // Same synchronous mount as createSvelteEnhancer: the onMount (which runs `connect`) is applied
    // before returning, so the enhancer is idempotent and testable without waiting for a microtask.
    flushSync();
    target.removeAttribute(mountingAttr);
    target.setAttribute(readyAttr, "true");
    // Unmounting runs onDestroy → the connect's cleanup, and releases the marker so it can be re-mounted.
    track(target, () => {
      void unmount(app);
      target.removeAttribute(readyAttr);
    });
    return true;
  };

  return (target = document) => {
    if (typeof document === "undefined") return 0;
    sweep();
    const roots: HTMLElement[] = [];
    if (target instanceof HTMLElement && target.matches(pendingSelector)) roots.push(target);
    roots.push(...Array.from(target.querySelectorAll<HTMLElement>(pendingSelector)));
    return roots.filter(create).length;
  };
}
