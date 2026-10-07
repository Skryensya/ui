import { useEffect, useState } from "react";
import { SegmentedControl } from "@skryensya/react/segmented";
export type Scheme = "system" | "light" | "dark";
const key = "reference-studio:scheme";
const order: Scheme[] = ["system", "light", "dark"];
const labels: Record<Scheme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};
export function storedScheme(): Scheme {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}
/* The tokens are light-dark() pairs, so `color-scheme` on <html> is the whole switch; "system"
 * leaves both open and the OS decides, live. `data-scheme` mirrors the choice for any kit CSS that
 * keys off it. */
export function applyScheme(scheme: Scheme) {
  const root = document.documentElement;
  root.dataset.scheme = scheme;
  root.style.colorScheme = scheme === "system" ? "light dark" : scheme;
}
/*
 * An explicit three-way choice, not a cycling icon: a cycle that starts on "system" spends its first
 * click on whichever mode the OS already shows, so that click changes nothing on screen and reads as
 * broken. Every option is visible here, and the current one is marked.
 */
export function ThemeToggle() {
  const [scheme, setScheme] = useState(storedScheme);
  useEffect(() => {
    applyScheme(scheme);
    try {
      if (scheme === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, scheme);
    } catch {
      /* not remembered */
    }
  }, [scheme]);
  return (
    <SegmentedControl
      label="Color mode"
      size="sm"
      value={scheme}
      onValueChange={(value) => setScheme(value as Scheme)}
      options={order.map((value) => ({ value, label: labels[value] }))}
    />
  );
}
