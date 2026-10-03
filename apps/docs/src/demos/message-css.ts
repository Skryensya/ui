/* The demo rules for Message, kept apart so `message.ts` stays about trees. */
export const messageDemoRules = `
  .message-demo {
    display: grid;
    gap: var(--space-stack-md);
    margin-block: var(--space-stack-sm) var(--space-stack-lg);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-inset-xl);
    background: var(--color-bg-surface-raised);
  }

  .message-demo__avatar {
    display: grid;
    place-items: center;
    inline-size: var(--size-control-md);
    block-size: var(--size-control-md);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-pill);
    background: var(--color-bg-surface-raised);
    color: var(--color-text-secondary);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.02em;
  }

  .message-demo__avatar--me {
    border-color: var(--color-border-accent);
    background: var(--color-bg-accent-subtle);
    color: var(--color-text-accent);
  }

  .message-demo__surface {
    position: relative;
    display: inline-flex;
    align-self: flex-start;
  }

  .sk-message[data-align="end"] .message-demo__surface {
    align-self: flex-end;
  }

  .message-demo__bubble {
    --message-demo-bubble-bg: var(--color-bg-surface);
    --message-demo-bubble-border: var(--color-border-subtle);

    position: relative;
    box-sizing: border-box;
    min-block-size: calc(var(--font-size-body) * var(--font-line-height-body) + var(--space-inset-sm) * 2 + 2px);
    max-inline-size: 28rem;
    border: 1px solid var(--message-demo-bubble-border);
    border-radius: 1.25rem;
    border-start-start-radius: 0.25rem;
    padding: var(--space-inset-sm) var(--space-inline-md);
    background: var(--message-demo-bubble-bg);
    color: var(--color-text-primary);
    line-height: var(--font-line-height-body);
    box-shadow: var(--elevation-raised);
    transition: background-color 150ms ease, border-color 150ms ease;
  }

  .sk-message[data-align="end"] .message-demo__bubble {
    --message-demo-bubble-bg: var(--color-bg-accent-subtle);
    --message-demo-bubble-border: color-mix(in oklab, var(--color-border-accent) 48%, transparent);

    border-radius: 1.25rem;
    border-start-end-radius: 0.25rem;
    color: var(--color-text-accent);
  }

  .message-demo__bubble--accent {
    --message-demo-bubble-bg: var(--color-bg-accent-subtle);
    --message-demo-bubble-border: color-mix(in oklab, var(--color-border-accent) 48%, transparent);

    color: var(--color-text-accent);
  }

  .message-demo__typing {
    --message-demo-bubble-bg: var(--color-bg-surface);

    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--space-inline-xs);
    min-block-size: calc(var(--font-size-body) * var(--font-line-height-body) + var(--space-inset-sm) * 2 + 2px);
    border: 1px solid var(--color-border-subtle);
    border-radius: 1.25rem;
    border-start-start-radius: 0.25rem;
    padding: var(--space-inset-sm) var(--space-inline-md);
    background: var(--message-demo-bubble-bg);
    box-shadow: var(--elevation-raised);
  }

  .sk-message[data-align="end"] .message-demo__typing {
    border-radius: 1.25rem;
    border-start-end-radius: 0.25rem;
  }

  .message-demo__typing > * {
    margin: 0;
    font-size: 0.5rem;
    line-height: 1;
    color: var(--color-text-tertiary);
    animation: message-typing 1.2s ease-in-out infinite;
  }

  .message-demo__typing > *:nth-child(2) { animation-delay: 0.16s; }
  .message-demo__typing > *:nth-child(3) { animation-delay: 0.32s; }

  .message-demo__action {
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-pill);
    padding: var(--space-inset-xs) var(--space-inline-sm);
    background: var(--color-bg-surface);
    color: var(--color-text-secondary);
    font: inherit;
    font-size: var(--font-size-caption);
    line-height: var(--font-line-height-caption);
    cursor: pointer;
  }

  .message-demo__action:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
  }

  .message-demo__action--danger {
    color: var(--color-text-danger);
  }

  .message-demo__reaction {
    position: absolute;
    inset-block-end: -0.85rem;
    inset-inline-end: -0.4rem;
    display: inline-grid;
    place-items: center;
    min-inline-size: 1.85rem;
    block-size: 1.5rem;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-pill);
    padding-inline: var(--space-inline-xs);
    background: var(--color-bg-surface-raised);
    box-shadow: var(--elevation-raised);
    font-size: var(--font-size-caption);
  }

  .sk-message[data-align="end"] .message-demo__reaction {
    inset-inline: -0.4rem auto;
  }

  .message-demo--pair {
    margin: 0;
    border: 0;
    padding: var(--space-inset-md);
    background: transparent;
    box-shadow: none;
  }

  @keyframes message-typing {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
    40% { transform: translateY(-0.18rem); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .message-demo__typing > * {
      animation: none;
    }
  }

[data-message-action-demo] .sk-message[data-message-context-target] {
  border-radius: var(--radius-lg);
  padding: var(--space-inset-xs);
  outline: var(--focus-ring-width, 2px) solid transparent;
  outline-offset: 2px;
  cursor: default;
  transition: background-color 150ms ease;
}
/* SELECTED and FOCUSED are two different things and look different: selection is a wash behind the row,
   focus is the ring. Focus alone never selects. */
[data-message-action-demo] .sk-message[data-message-context-target][data-selected] {
  background: color-mix(in oklab, var(--color-border-accent) 14%, transparent);
}
[data-message-action-demo] .sk-message[data-message-context-target]:focus-visible {
  outline-color: var(--focus-ring-color, var(--color-border-focus));
}
.message-demo__context-menu[popover] {
  position: fixed;
  inset: auto;
  margin: 0;
  min-inline-size: 10rem;
  padding: var(--space-inset-xs);
  overflow: visible;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface-overlay);
  box-shadow: var(--elevation-overlay);
}
.message-demo__context-menu:not(:popover-open) {
  display: none;
}
.message-demo__context-menu:popover-open {
  display: grid;
}
.message-demo__context-menu .sk-button {
  justify-content: flex-start;
  inline-size: 100%;
}
[hidden] {
  display: none !important;
}
`;
