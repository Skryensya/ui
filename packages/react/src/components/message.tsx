import { messageContract, messageParts, type MessageAlign } from "@skryensya/core/message";
import { type HTMLAttributes, type ReactNode } from "react";

const { align: alignOption } = messageContract.options;
const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type DivProps = HTMLAttributes<HTMLDivElement>;

export type MessageProps = DivProps & {
  children: ReactNode;
  /** Which side of the conversation the row belongs to. */
  align?: MessageAlign;
};

export type MessageGroupProps = DivProps & { children: ReactNode };
export type MessageAvatarProps = DivProps & { children?: ReactNode };
export type MessageContentProps = DivProps & { children: ReactNode };
export type MessageHeaderProps = DivProps & { children: ReactNode };
export type MessageFooterProps = DivProps & { children: ReactNode };
export type MessageActionsProps = DivProps & { children: ReactNode };

export function Message({ align = alignOption.default, children, className, ...props }: MessageProps) {
  return (
    <div {...props} className={cx(messageParts.root, className)} data-align={align}>
      {children}
    </div>
  );
}

export function MessageGroup({ children, className, ...props }: MessageGroupProps) {
  return (
    <div {...props} className={cx(messageParts.group, className)}>
      {children}
    </div>
  );
}

export function MessageAvatar({ children, className, ...props }: MessageAvatarProps) {
  return (
    <div {...props} className={cx(messageParts.avatar, className)}>
      {children}
    </div>
  );
}

export function MessageContent({ children, className, ...props }: MessageContentProps) {
  return (
    <div {...props} className={cx(messageParts.content, className)}>
      {children}
    </div>
  );
}

export function MessageHeader({ children, className, ...props }: MessageHeaderProps) {
  return (
    <div {...props} className={cx(messageParts.header, className)}>
      {children}
    </div>
  );
}

export function MessageFooter({ children, className, ...props }: MessageFooterProps) {
  return (
    <div {...props} className={cx(messageParts.footer, className)}>
      {children}
    </div>
  );
}

export function MessageActions({ children, className, ...props }: MessageActionsProps) {
  return (
    <div {...props} className={cx(messageParts.actions, className)}>
      {children}
    </div>
  );
}
