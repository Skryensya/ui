/*
 * THE SAME CHART AS `@skryensya/react/chart`. That binding draws `line` and `area` itself now, from
 * core's geometry (`@skryensya/core/chart`), because a path that only one binding could draw was a
 * prop only React had: a usage tree could not ask for it and Vanilla could not paint it. This subpath
 * re-exports it so an import of `@skryensya/charts/react` keeps working.
 */
export { Chart } from "@skryensya/react/chart";
export type { ChartProps } from "@skryensya/react/chart";
