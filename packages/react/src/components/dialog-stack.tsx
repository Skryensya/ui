"use client";

import { dialogStackContract, dialogStackParts as p } from "@skryensya/core/dialog-stack";
import { connectDialogStack, type DialogStackController } from "@skryensya/core/dialog-stack-controller";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { cloneElement, isValidElement, useEffect, useRef, type ButtonHTMLAttributes, type DialogHTMLAttributes, type HTMLAttributes, type ReactElement } from "react";

export type DialogStackProps = HTMLAttributes<HTMLDivElement> & SignatureOptionsOf<typeof dialogStackContract, "DialogStack"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStepChange?: (index: number) => void;
};

export function DialogStack({ defaultOpen = dialogStackContract.options.defaultOpen.default, open, onOpenChange, onStepChange, onClick, className, children, ...props }: DialogStackProps) {
  const root = useRef<HTMLDivElement>(null);
  const controller = useRef<DialogStackController | null>(null);
  const latest = useRef({ open, onOpenChange, onStepChange });
  latest.current = { open, onOpenChange, onStepChange };
  const initialOpen = useRef(open ?? defaultOpen);
  useEffect(() => {
    if (!root.current) return;
    const connected = connectDialogStack(root.current, {
      listenClicks: false,
      onOpenRequest(value) {
        if (latest.current.open === undefined) connected.setOpen(value);
        latest.current.onOpenChange?.(value);
      },
      onStepChange(index) { latest.current.onStepChange?.(index); },
    });
    controller.current = connected;
    connected.setOpen(initialOpen.current);
    return () => { connected.destroy(); controller.current = null; };
  }, []);
  useEffect(() => {
    controller.current?.refresh();
    if (open !== undefined) controller.current?.setOpen(open);
  });
  return <div {...props} ref={root} className={classes(p.root, className)} data-sk-dialog-stack="" data-default-open={defaultOpen ? "" : undefined} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) controller.current?.handleClick(event.nativeEvent);
  }}>{children}</div>;
}

const classes = (part: string, extra?: string) => extra ? `${part} ${extra}` : part;

export type DialogStackActionProps = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };
function action(part: string, { asChild, children, className, onClick, ...props }: DialogStackActionProps) {
  if (asChild) {
    if (!isValidElement(children)) throw new Error("DialogStack asChild requires one button element");
    if (typeof children.type === "string" && children.type !== "button") {
      throw new Error("DialogStack asChild requires one button element");
    }
    const child = children as ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
    return cloneElement(child, {
      ...props,
      type: props.type ?? child.props.type ?? "button",
      className: classes(part, [child.props.className, className].filter(Boolean).join(" ")),
      onClick(event) {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      },
    });
  }
  return <button {...props} type={props.type ?? "button"} className={classes(`${part} sk-button sk-interactive`, className)} onClick={onClick}>{children}</button>;
}

/** asChild requires a button or a component forwarding button props and handlers. */
export const DialogStackTrigger = (props: DialogStackActionProps) => action(p.trigger, props);
export const DialogStackNext = (props: DialogStackActionProps) => action(p.next, props);
export const DialogStackPrevious = (props: DialogStackActionProps) => action(p.previous, props);
export const DialogStackClose = (props: DialogStackActionProps) => action(p.close, props);

/** The browser paints ::backdrop. This marker preserves the compound API without a second scrim. */
export function DialogStackOverlay({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={classes(p.overlay, className)} hidden aria-hidden="true" />;
}
export function DialogStackBody({ className, ...props }: DialogHTMLAttributes<HTMLDialogElement>) {
  return <dialog {...props} className={classes(p.body, className)} />;
}
export function DialogStackContent({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} tabIndex={-1} className={classes(p.content, className)} />;
}
export function DialogStackHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header {...props} className={classes(p.header, className)} />;
}
export function DialogStackTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props} className={classes(p.title, className)} />;
}
export function DialogStackDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={classes(p.description, className)} />;
}
export function DialogStackFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer {...props} className={classes(p.footer, className)} />;
}
