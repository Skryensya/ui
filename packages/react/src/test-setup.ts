/*
 * The shared jsdom floor plus the one thing that is this binding's own.
 *
 * Everything this file used to declare - `CSS.escape`, `ResizeObserver`, `matchMedia`, `scrollTo` and
 * the `<dialog>` shim - now lives in `@skryensya/core/jsdom-floor`, which Vanilla reads too. It was a
 * 38-line copy of that same floor, and the copy was already the weaker one: its `CSS.escape` was a
 * regex approximation where the shared version is the spec algorithm.
 */
import "@skryensya/core/jsdom-floor";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/* `@testing-library/react`'s, so it belongs to this binding and not to the floor. */
afterEach(cleanup);

/*
 * Every render gets a bound set, as every real app does: the kit ships no default (the project picks
 * one), and a component test is about the component, not about forgetting the provider. A test about
 * the unbound case passes its own `wrapper`.
 */
vi.mock("@testing-library/react", async (importOriginal) => {
  const rtl = await importOriginal<typeof import("@testing-library/react")>();
  const { createElement } = await import("react");
  const { IconSetProvider } = await import("./components/icon.js");
  const { lucideIcons } = await import("./test-icons.js");
  const wrapper = ({ children }: { children: React.ReactNode }) => createElement(IconSetProvider, { set: lucideIcons, children });
  const render = (ui: React.ReactNode, options?: Parameters<typeof rtl.render>[1]) => rtl.render(ui, { wrapper, ...options });
  const renderHook = (hook: (props: unknown) => unknown, options?: Parameters<typeof rtl.renderHook>[1]) => rtl.renderHook(hook, { wrapper, ...options });
  return { ...rtl, render: render as typeof rtl.render, renderHook: renderHook as typeof rtl.renderHook };
});
