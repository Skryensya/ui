import {
  layoutParts,
  layoutGridParts,
  type BoxAppearance,
  type BoxBorder,
  type BoxSurface,
  type GridColumns,
  type InlineAlign,
  type InlineBlockStart,
  type InlineJustify,
  type LayoutAlign,
  type Space,
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
    padding?: Space;
    paddingExpanded?: Space;
    surface?: BoxSurface;
  }
>;

export function Box<Element extends ElementType = "div">({
  appearance = "plain",
  as,
  border = "none",
  className,
  padding = "none",
  paddingExpanded,
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
      data-padding={padding}
      data-padding-expanded={paddingExpanded}
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
  LayoutChildren & { align?: LayoutAlign; gap?: Space; gapExpanded?: Space }
>;

export function Stack<Element extends ElementType = "div">({
  as,
  align,
  className,
  gap = "md",
  gapExpanded,
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
    />
  );
}

export type InlineProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    align?: InlineAlign;
    blockStart?: InlineBlockStart;
    equal?: boolean;
    gap?: Space;
    gapExpanded?: Space;
    justify?: InlineJustify;
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
  wrap = true,
  ...props
}: InlineProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.inline, className)}
      data-align={align}
      data-block-start={blockStart === "none" ? undefined : blockStart}
      data-equal={equal ? "" : undefined}
      data-gap={gap}
      data-gap-expanded={gapExpanded}
      data-justify={justify}
      data-wrap={wrap}
    />
  );
}

export type GridProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    columns?: GridColumns;
    fill?: boolean;
    gap?: Space;
    gapExpanded?: Space;
    multicol?: boolean;
    responsive?: boolean;
    "data-multicol"?: string;
    "data-responsive"?: string;
  }
>;

export function Grid<Element extends ElementType = "div">({
  as,
  className,
  columns = 1,
  fill = false,
  gap = "md",
  gapExpanded,
  multicol,
  responsive,
  "data-multicol": rawMulticol,
  "data-responsive": rawResponsive,
  ...props
}: GridProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.grid, className)}
      data-columns={columns}
      data-fill={fill ? "" : undefined}
      data-gap={gap}
      data-gap-expanded={gapExpanded}
      data-multicol={multicol === true ? "" : multicol === false ? undefined : rawMulticol}
      data-responsive={responsive === true ? "" : responsive === false ? undefined : rawResponsive}
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
 * The application work-area landmark. It deliberately owns no layout styling and may be empty.
 */
export type MainProps = ComponentPropsWithoutRef<"main">;

export function Main(props: MainProps) {
  return <main {...props} />;
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
