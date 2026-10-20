export type TagSelectionMode = "single" | "multiple";

export function nextTagSelection(selected: readonly boolean[], index: number, mode: TagSelectionMode): boolean[] {
  return selected.map((isSelected, current) =>
    current === index ? !isSelected : mode === "single" ? false : isSelected,
  );
}
