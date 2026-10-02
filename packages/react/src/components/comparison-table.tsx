import { comparisonTableParts, type ComparisonTableDensity } from "@skryensya/core/comparison-table";
import { type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";


const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ComparisonTableProps = HTMLAttributes<HTMLTableElement> & {
  /** What the first column holds, in words. Drawn visually hidden in the corner cell, and required. */
  aspectLabel: string;
  /** A name for the table. Optional: a heading right above it usually says what it compares. */
  caption?: ReactNode;
  /** `ComparisonColumn`s, one per thing compared. Two to four. */
  columns: ReactNode;
  /** `ComparisonRow`s, one per aspect. */
  children: ReactNode;
  /** Tighter rows, for reference material rather than reading. */
  density?: ComparisonTableDensity;
};

/**
 * The same few aspects set side by side for two to four things.
 *
 * Every column header carries `scope="col"`, every row's first cell is a `<th scope="row">`, and the
 * corner cell is never empty: it holds `aspectLabel`, visually hidden, so a screen reader has a name for
 * the column of aspects.
 */
export function ComparisonTable({
  aspectLabel,
  caption,
  children,
  className,
  columns,
  density,
  ...props
}: ComparisonTableProps) {
  return (
    <table {...props} className={cx(comparisonTableParts.root, className)} data-density={density}>
      {caption ? <caption className={comparisonTableParts.caption}>{caption}</caption> : null}
      <thead>
        <tr>
          <th className={comparisonTableParts.corner} scope="col">
            <span className={comparisonTableParts.cornerLabel}>{aspectLabel}</span>
          </th>
          {columns}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export type ComparisonColumnProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "scope"> & {
  /** The name of one of the things compared. */
  children: ReactNode;
};

/** One thing compared, at the top of its column. */
export function ComparisonColumn({ children, className, ...props }: ComparisonColumnProps) {
  return (
    <th {...props} className={cx(comparisonTableParts.column, className)} scope="col">
      {children}
    </th>
  );
}

export type ComparisonRowProps = HTMLAttributes<HTMLTableRowElement> & {
  /** The aspect the row compares on. */
  label: ReactNode;
  /** `ComparisonCell`s, one per column, in column order. */
  children: ReactNode;
};

/** One aspect, named once on the left and answered in each column. */
export function ComparisonRow({ children, className, label, ...props }: ComparisonRowProps) {
  return (
    <tr {...props} className={cx(comparisonTableParts.row, className)}>
      <th className={comparisonTableParts.rowHeader} scope="row">
        {label}
      </th>
      {children}
    </tr>
  );
}

export type ComparisonCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  /** How one thing answers one aspect: short text, with code or a link. */
  children: ReactNode;
};

/** How one thing answers one aspect. */
export function ComparisonCell({ children, className, ...props }: ComparisonCellProps) {
  return (
    <td {...props} className={cx(comparisonTableParts.cell, className)}>
      {children}
    </td>
  );
}
