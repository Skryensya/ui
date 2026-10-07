import {
  layoutParts,
  layoutGridParts,
  type BoxAppearance,
  type BoxBorder,
  type BoxMeasure,
  type BoxRadius,
  type BoxSurface,
  type AppShellScroll,
  type Gap,
  type GridAlign,
  type GridColumns,
  type GridMinColumn,
  type InlineAlign,
  type InlineBlockStart,
  type InlineJustify,
  type LayoutAlign,
  type LayoutShow,
  type MainPadding,
  type Space,
  type StackJustify,
  type WrapperGutter,
  type WrapperSize,
} from "@skryensya/core/layout";
import { heroContract, heroParts, type HeroAlign, type HeroPadding, type HeroSurface } from "@skryensya/core/hero";
import { footerContract, footerParts, type FooterPadding, type FooterSurface } from "@skryensya/core/footer";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

const {
  align: heroAlignOption,
  appearance: heroAppearanceOption,
  padding: heroPaddingOption,
  surface: heroSurfaceOption,
} = heroContract.options;

const {
  appearance: footerAppearanceOption,
  divider: dividerOption,
  padding: footerPaddingOption,
  surface: footerSurfaceOption,
} = footerContract.options;

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

type LayoutChildren = { children?: ReactNode; className?: string };

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type BoxProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    appearance?: BoxAppearance;
    border?: BoxBorder;
    measure?: BoxMeasure;
    padding?: Space;
    paddingExpanded?: Space;
    radius?: BoxRadius;
    /** Exists on one side of the expanded line only: `compact` or `expanded`. */
    show?: LayoutShow;
    surface?: BoxSurface;
  }
>;

export function Box<Element extends ElementType = "div">({
  appearance = "plain",
  as,
  border = "none",
  className,
  measure,
  padding = "none",
  paddingExpanded,
  radius,
  show,
  surface = "none",
  ...props
}: BoxProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.box, className)}
      data-appearance={appearance}
      data-border={border}
      data-measure={measure}
      data-padding={padding}
      data-padding-expanded={paddingExpanded}
      data-radius={radius}
      data-show={show}
      data-surface={surface}
    />
  );
}

export type HeroProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    align?: HeroAlign;
    /** How the band is drawn: `plain`, `brutalist` or `frosted`. */
    appearance?: (typeof heroAppearanceOption.values)[number];
    padding?: HeroPadding;
    paddingExpanded?: HeroPadding;
    surface?: HeroSurface;
  }
>;

export function Hero<Element extends ElementType = "div">({
  align = heroAlignOption.default,
  appearance = heroAppearanceOption.default,
  as,
  className,
  padding = heroPaddingOption.default,
  paddingExpanded,
  surface = heroSurfaceOption.default,
  ...props
}: HeroProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(heroParts.hero, className)}
      data-align={align}
      data-appearance={appearance}
      data-padding={padding}
      data-padding-expanded={paddingExpanded}
      data-surface={surface}
    />
  );
}

/*
 * FREE COMPOSITIONAL, like `Hero`: the host is a real `<footer>` by default (the `contentinfo`
 * landmark at document level), and everything inside is the composer's, `Grid` of `NavList`
 * columns, a `Text` legal line, a `Wrapper` to hold the measure. `as` is here for the one case a
 * footer is deliberately nested inside an `<article>` and must NOT be the landmark.
 */
export type FooterProps<Element extends ElementType = "footer"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    /** How the band is drawn: `plain`, `brutalist` or `frosted`. */
    appearance?: (typeof footerAppearanceOption.values)[number];
    divider?: boolean;
    padding?: FooterPadding;
    paddingExpanded?: FooterPadding;
    surface?: FooterSurface;
  }
>;

export function Footer<Element extends ElementType = "footer">({
  as,
  className,
  appearance = footerAppearanceOption.default,
  divider = dividerOption.default,
  padding = footerPaddingOption.default,
  paddingExpanded,
  surface = footerSurfaceOption.default,
  ...props
}: FooterProps<Element>) {
  const Component = as ?? "footer";
  return (
    <Component
      {...props}
      className={classes(footerParts.footer, className)}
      data-appearance={appearance}
      data-divider={divider ? "" : "false"}
      data-padding={padding}
      data-padding-expanded={paddingExpanded}
      data-surface={surface}
    />
  );
}

export type StackProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    align?: LayoutAlign;
    gap?: Gap;
    gapExpanded?: Gap;
    /** Fill the parent's height and spend the leftover: `center` centres, `between` sends the last child down. */
    justify?: StackJustify;
    show?: LayoutShow;
  }
>;

export function Stack<Element extends ElementType = "div">({
  as,
  align,
  className,
  gap = "md",
  gapExpanded,
  justify,
  show,
  ...props
}: StackProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.stack, className)}
      data-align={align}
      data-gap={gap}
      data-gap-expanded={gapExpanded}
      data-justify={justify}
      data-show={show}
    />
  );
}

export type InlineProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    align?: InlineAlign;
    blockStart?: InlineBlockStart;
    equal?: boolean;
    gap?: Gap;
    gapExpanded?: Gap;
    justify?: InlineJustify;
    show?: LayoutShow;
    wrap?: boolean;
  }
>;

export function Inline<Element extends ElementType = "div">({
  as,
  align = "end",
  blockStart = "none",
  className,
  equal = false,
  gap = "md",
  gapExpanded,
  justify = "start",
  show,
  wrap = true,
  ...props
}: InlineProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.inline, className)}
      data-align={align}
      data-block-start={blockStart}
      data-equal={equal ? "" : undefined}
      data-gap={gap}
      data-gap-expanded={gapExpanded}
      data-justify={justify}
      data-show={show}
      data-wrap={wrap}
    />
  );
}

export type GridProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    /** How cells sit in their row: Grid's own `stretch` when absent (`start` under `responsive`). */
    align?: GridAlign;
    columns?: GridColumns;
    gap?: Gap;
    gapExpanded?: Gap;
    /** The narrowest lane before the grid drops one; the grid's own width decides the count. */
    minColumn?: GridMinColumn;
    multicol?: boolean;
    responsive?: boolean;
    show?: LayoutShow;
    "data-multicol"?: string;
    "data-responsive"?: string;
  }
>;

export function Grid<Element extends ElementType = "div">({
  align,
  as,
  className,
  columns = 1,
  gap = "md",
  gapExpanded,
  minColumn,
  multicol,
  responsive,
  show,
  "data-multicol": rawMulticol,
  "data-responsive": rawResponsive,
  ...props
}: GridProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.grid, className)}
      data-align={align}
      data-columns={columns}
      data-gap={gap}
      data-gap-expanded={gapExpanded}
      data-min-column={minColumn}
      data-multicol={multicol === true ? "" : multicol === false ? undefined : rawMulticol}
      data-responsive={responsive === true ? "" : responsive === false ? undefined : rawResponsive}
      data-show={show}
    />
  );
}

/**
 * A page flow with content, narrow, breakout and full-width spans.
 *
 * The span stays on the semantic direct child as `data-width`; this root only owns the grid.
 */
export type LayoutGridProps<Element extends ElementType = "div"> = PolymorphicProps<Element, LayoutChildren>;

export function LayoutGrid<Element extends ElementType = "div">({
  as,
  className,
  ...props
}: LayoutGridProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutGridParts.layoutGrid, className)} />;
}

/**
 * The application shell: header across the top, rails down the sides, the work area filling the rest, an
 * optional footer. Its children are placed by what they are and where they stand (a Sidebar after the Main is
 * the end rail). Below the expanded line it is one column and the rails are not drawn. See `AppShell` in
 * `@skryensya/core/layout`.
 */
export type AppShellProps = ComponentPropsWithoutRef<"div"> & {
  /** `screen` (the default, at least a screen tall) or `fit` (as tall as its content). */
  height?: "screen" | "fit";
  /** `page` (the default): one document. `regions`: a screen tall, each region scrolling on its own. */
  scroll?: AppShellScroll;
  /** The header stays at the top while the page scrolls under it. */
  stickyHeader?: boolean;
};

export function AppShell({ className, height, scroll, stickyHeader = false, ...props }: AppShellProps) {
  return (
    <div
      {...props}
      className={classes(layoutGridParts.appShell, className)}
      data-height={height}
      data-scroll={scroll}
      data-sticky-header={stickyHeader ? "" : undefined}
    />
  );
}

/**
 * The work-area landmark, and the query container what sits in it is laid out against. Its block inset is
 * the only spacing it owns; the inline gutter stays the Wrapper's.
 */
export type MainProps = ComponentPropsWithoutRef<"main"> & {
  paddingBlock?: MainPadding;
  paddingBlockExpanded?: MainPadding;
};

export function Main({ className, paddingBlock, paddingBlockExpanded, ...props }: MainProps) {
  return (
    <main
      {...props}
      className={classes(layoutGridParts.main, className)}
      data-padding-block={paddingBlock}
      data-padding-block-expanded={paddingBlockExpanded}
    />
  );
}

export type WrapperProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { gutter?: WrapperGutter; gutterExpanded?: WrapperGutter; size?: WrapperSize }
>;

export function Wrapper<Element extends ElementType = "div">({
  as,
  className,
  gutter,
  gutterExpanded,
  size = "md",
  ...props
}: WrapperProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.wrapper, className)}
      data-gutter={gutter}
      data-gutter-expanded={gutterExpanded}
      data-size={size}
    />
  );
}
