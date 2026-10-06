import { useRef, type KeyboardEvent, type ReactNode } from "react";

/*
 * THE TABS OF A PANEL: a row at the top of the panel itself, with the kit's own tab classes (`sk-tabs__*`), so the
 * panel reads as one object with a header and not as a pill floating over it. The kit's Tabs component owns its panels,
 * and these panels are heavy and stay mounted while hidden (the AI conversation must not be lost by looking at the
 * Inspector), so only the strip is used: the tablist, the roving focus and the arrow keys are written here, to the
 * WAI-ARIA tabs pattern, and the caller keeps showing and hiding the panels.
 */
export type PanelTab = { value: string; label: string; /** A small mark on the tab: the thing behind it wants attention. */ badge?: ReactNode };

export function PanelTabs({ label, tabs, value, onValueChange, panelId }: { label: string; tabs: readonly PanelTab[]; value: string; onValueChange: (value: string) => void; panelId: (value: string) => string }) {
  const list = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent) => {
    const at = tabs.findIndex((tab) => tab.value === value);
    const next = event.key === "ArrowRight" ? (at + 1) % tabs.length : event.key === "ArrowLeft" ? (at - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    onValueChange(tabs[next]!.value);
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };
  return (
    /* `sk-tabs` is the root the kit's tab hooks hang from; with no panels of its own it is only the strip's frame. */
    <div className="maker-panel-tabs sk-tabs" data-size="sm">
    <div ref={list} className="sk-tabs__list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => (
        /* ds-exception: a tab of the kit's own strip (its `sk-tabs__*` classes); the kit's Tabs component cannot be used without owning the panels. */
        <button
          key={tab.value}
          type="button"
          role="tab"
          id={`${panelId(tab.value)}-tab`}
          aria-selected={tab.value === value}
          aria-controls={panelId(tab.value)}
          tabIndex={tab.value === value ? 0 : -1}
          data-selected={tab.value === value ? "" : undefined}
          className="sk-tabs__trigger sk-interactive"
          onClick={() => onValueChange(tab.value)}
        >
          {tab.label}
          {tab.badge}
        </button>
      ))}
    </div>
    </div>
  );
}
