import { dockParts, type DockOptions } from "@skryensya/core/dock";
import { useEffect, useRef, type ButtonHTMLAttributes, type ComponentType, type HTMLAttributes, type ReactNode } from "react";
import { animate, motionValue } from "motion";
import { connectDock, dockSpringOptions } from "@skryensya/core/dock-controller";

const cx = (base: string, extra?: string) => extra ? `${base} ${extra}` : base;

export type DockItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label" | "type" | "disabled"> & {
  label: NonNullable<DockOptions["label"]>;
  disabled?: DockOptions["disabled"];
  children: ReactNode;
};

export function DockItem({ label, children, className, ...props }: DockItemProps) {
  return (
    <button {...props} type="button" aria-label={label} className={cx(`${dockParts.item} sk-interactive`, className)}>
      <span className={dockParts.icon} aria-hidden="true">{children}</span>
    </button>
  );
}

export type DockAction = Omit<DockItemProps, "children" | "id"> & {
  id: string | number;
  Icon: ComponentType;
};

export type DockProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "aria-label"> & {
  label: NonNullable<DockOptions["label"]>;
} & (
  | { items: readonly DockAction[]; children?: never }
  | { children: ReactNode; items?: never }
);

/** Icon geometry is consumer-owned; the same structure can also be authored with DockItem children. */
export function Dock({ label, items, children, className, ...props }: DockProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    return connectDock(root.current, (initial, update) => {
      const value = motionValue(initial);
      const unsubscribe = value.on("change", update);
      let playback: ReturnType<typeof animate> | undefined;
      let destination = initial;
      return {
        set(target) {
          if (target === destination) return;
          destination = target;
          playback?.stop();
          playback = animate(value, target, dockSpringOptions);
        },
        destroy() { playback?.stop(); unsubscribe(); value.destroy(); },
      };
    });
  }, [items, children]);
  return (
    <div {...props} ref={root} role="group" aria-label={label} className={cx(dockParts.root, className)}>
      {items ? items.map(({ id, Icon, ...item }) => (
        <DockItem key={id} {...item}><Icon /></DockItem>
      )) : children}
    </div>
  );
}
