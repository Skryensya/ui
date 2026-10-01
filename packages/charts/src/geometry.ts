/*
 * The path a series traces lives in `@skryensya/core/chart` now: both bindings draw `line` and `area`
 * from it, so it cannot belong to a package only one of them depends on. Re-exported here so this
 * subpath keeps resolving.
 */
export { chartAreaPath, chartLinePath, chartPointX, chartPointY } from "@skryensya/core/chart";
