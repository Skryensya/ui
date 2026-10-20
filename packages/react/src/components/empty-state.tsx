import { emptyStateParts, type EmptyStateOptions } from "@skryensya/core/empty-state";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  /** Plain text title. Matches the contract slot (`accepts: "text"`). */
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  /** The title's heading level. `h1` when the state is the whole page; `h2` (the default) inside one. */
  headingElement?: EmptyStateOptions["headingElement"];
};

export function EmptyState({
  actions,
  description,
  headingElement: Heading = "h2",
  icon,
  title,
}: EmptyStateProps) {
  return (
    <section className={emptyStateParts.root}>
      {icon ? (
        <div aria-hidden="true" className={emptyStateParts.icon}>
          {icon}
        </div>
      ) : null}
      <Heading className={emptyStateParts.title}>{title}</Heading>
      {description ? (
        <div className={emptyStateParts.description}>{description}</div>
      ) : null}
      {actions ? (
        <div className={emptyStateParts.actions}>{actions}</div>
      ) : null}
    </section>
  );
}
