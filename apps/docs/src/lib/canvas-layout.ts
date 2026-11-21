export type Size = { readonly w: number; readonly h: number };
export type Column<T> = { w: number; h: number; parts: T[] };

const GAP = 2;

/** Greedy: each part goes to the currently shortest column, which then is as wide as its widest part. */
function fill<T>(items: readonly T[], size: (item: T) => Size, n: number): Column<T>[] {
  const columns: Column<T>[] = Array.from({ length: n }, () => ({ w: 0, h: 0, parts: [] }));
  for (const item of items) {
    const column = columns.reduce((a, b) => (b.h < a.h ? b : a));
    const s = size(item);
    column.parts.push(item);
    column.w = Math.max(column.w, s.w);
    column.h += s.h + (column.parts.length > 1 ? GAP : 0);
  }
  return columns.filter((c) => c.parts.length);
}

/** The column count whose bounding box is closest to a square, from the sizes the parts really have. */
export function layoutColumns<T>(items: readonly T[], size: (item: T) => Size, maxColumns = 24): Column<T>[] {
  let best: Column<T>[] = [];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let n = 1; n <= Math.min(maxColumns, Math.max(1, items.length)); n++) {
    const columns = fill(items, size, n);
    const width = columns.reduce((sum, c) => sum + c.w, 0) + GAP * (columns.length - 1);
    const height = Math.max(...columns.map((c) => c.h));
    const score = Math.abs(Math.log(width / height));
    if (score < bestScore) [best, bestScore] = [columns, score];
  }
  return best;
}
