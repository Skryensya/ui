import { procedureParts } from "@skryensya/core/procedure";
import { type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ProcedureProps = OlHTMLAttributes<HTMLOListElement> & {
  children: ReactNode;
};

/** A static ordered sequence of instructions. Progress state belongs to Steps. */
export function Procedure({ children, className, ...props }: ProcedureProps) {
  return (
    <ol {...props} className={cx(procedureParts.root, className)} role="list">
      {children}
    </ol>
  );
}

export type ProcedureStepProps = Omit<LiHTMLAttributes<HTMLLIElement>, "title"> & {
  children?: ReactNode;
  /** Plain instruction title. Matches the contract slot (`accepts: "text"`). */
  title: string;
};

/** One instruction and its arbitrary flow content. */
export function ProcedureStep({ children, className, title, ...props }: ProcedureStepProps) {
  return (
    <li {...props} className={cx(procedureParts.step, className)}>
      <div className={procedureParts.content}>
        <span className={procedureParts.title}>{title}</span>
        {children}
      </div>
    </li>
  );
}
