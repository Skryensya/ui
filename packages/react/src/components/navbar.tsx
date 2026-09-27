import { navbarContract, navbarParts } from "@skryensya/core/navbar";

/* Derived, never restated: the values and the default live in the contract. */
const { appearance: appearanceOption } = navbarContract.options;
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type NavbarProps = HTMLAttributes<HTMLElement> & {
  /** How the bar is drawn: `plain`, `brutalist` or `frosted`. */
  appearance?: (typeof appearanceOption.values)[number];
  children: ReactNode;
};

/*
 * The bar. The links go inside as a `<NavList orientation="horizontal">`, the same list the
 * sidebar hosts, rather than a second one that could drift from it (decision 17).
 *
 * A `<header>`, not a `<nav>`: the NavList inside is the nav landmark, and nesting one in another
 * would announce two.
 */
export function Navbar({ appearance = appearanceOption.default, children, className, ...props }: NavbarProps) {
  return (
    <header {...props} className={cx(navbarParts.root, className)} data-appearance={appearance}>
      {children}
    </header>
  );
}

export type NavbarBrandProps = HTMLAttributes<HTMLElement> & { children: ReactNode };

export function NavbarBrand({ children, className, ...props }: NavbarBrandProps) {
  return (
    <div {...props} className={cx(navbarParts.brand, className)}>
      {children}
    </div>
  );
}

export type NavbarActionsProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function NavbarActions({ children, className, ...props }: NavbarActionsProps) {
  return (
    <div {...props} className={cx(navbarParts.actions, className)}>
      {children}
    </div>
  );
}
