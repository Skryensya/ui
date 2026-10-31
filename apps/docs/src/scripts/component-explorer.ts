import { prepareComponentSearch, scoreComponentQuery } from "../lib/component-search";

const compareRank = (a: { rank: number }, b: { rank: number }): number => a.rank === b.rank ? 0 : a.rank - b.rank;

function reorder(parent: HTMLElement, children: HTMLElement[]): void {
  if (children.some((child, index) => parent.children[index] !== child)) parent.append(...children);
}

export function initComponentExplorer(): void {
  const root = document.querySelector<HTMLElement>("[data-component-explorer]");
  if (!root) return;

  const input = root.querySelector<HTMLInputElement>("[data-component-search] input")!;
  const category = root.querySelector<HTMLElement>("[data-component-category]")!;
  const chips = [...category.querySelectorAll<HTMLButtonElement>("button[data-category]")];
  const count = root.querySelector<HTMLElement>("[data-component-count]")!;
  const empty = root.querySelector<HTMLElement>("[data-component-empty]")!;
  const emptyDescription = root.querySelector<HTMLElement>("[data-component-empty-description]")!;
  const clear = root.querySelector<HTMLButtonElement>("[data-component-clear]")!;
  const results = root.querySelector<HTMLElement>("#component-results")!;
  const groups = [...root.querySelectorAll<HTMLElement>("[data-component-group]")].map((element) => ({
    element,
    rank: Infinity,
    list: element.querySelector<HTMLElement>(".sk-list")!,
    count: element.querySelector<HTMLElement>("[data-component-group-count]")!,
    entries: [...element.querySelectorAll<HTMLElement>("[data-component-entry]")].map((element) => ({
      element,
      search: prepareComponentSearch(JSON.parse(element.dataset.componentNames!), element.dataset.componentWords ?? ""),
    })),
  }));
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

  input.setAttribute("aria-controls", "component-results");

  const params = new URLSearchParams(location.search);
  if (params.has("q")) input.value = params.get("q")!;
  let selectedCategory = chips.find((chip) => chip.dataset.category === params.get("category"))?.dataset.category ?? "";

  const update = (): void => {
    for (const chip of chips) chip.setAttribute("aria-pressed", String(chip.dataset.category === selectedCategory));
    let shown = 0;
    for (const group of groups) {
      const ranked = group.entries.map((entry) => ({
        element: entry.element,
        rank: !selectedCategory || group.element.dataset.componentGroup === selectedCategory
          ? scoreComponentQuery(entry.search, input.value) ?? Infinity
          : Infinity,
      })).sort(compareRank);
      let visible = 0;
      for (const entry of ranked) {
        entry.element.hidden = !Number.isFinite(entry.rank);
        if (!entry.element.hidden) visible++;
      }
      group.rank = ranked[0]?.rank ?? Infinity;
      group.element.hidden = visible === 0;
      group.count.textContent = String(visible);
      shown += visible;
      reorder(group.list, ranked.map((entry) => entry.element));
    }
    reorder(results, [...groups].sort(compareRank).map((group) => group.element));

    count.textContent = root.dataset.countTemplate!
      .replace("{count}", String(shown)).replace("{total}", String(total));
    results.hidden = shown === 0;
    empty.hidden = shown !== 0;
    emptyDescription.textContent = root.dataset.emptyTemplate!.replace("{query}", input.value.trim());
    clear.hidden = input.value === "" && selectedCategory === "";

    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value);
    else url.searchParams.delete("q");
    if (selectedCategory) url.searchParams.set("category", selectedCategory);
    else url.searchParams.delete("category");
    // Filters are one browsing state, not a new Back-button entry for each keystroke.
    if (url.href !== location.href) history.replaceState(history.state, "", url);

    // Keep the selected chip visible without moving the page vertically.
    const selected = chips.find((chip) => chip.dataset.category === selectedCategory)!;
    category.scrollLeft = selected.offsetLeft - (category.clientWidth - selected.offsetWidth) / 2;
  };

  input.addEventListener("input", update);
  for (const chip of chips) chip.addEventListener("click", () => {
    const value = chip.dataset.category!;
    selectedCategory = selectedCategory === value ? "" : value;
    update();
  });
  const reset = (): void => {
    input.value = "";
    selectedCategory = "";
    // SearchField owns its clear button and hears the reset through the same native event as typing.
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus({ preventScroll: true });
  };
  clear.addEventListener("click", reset);
  window.addEventListener("pageshow", update);
  update();
}
