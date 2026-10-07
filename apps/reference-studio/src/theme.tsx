import { useEffect, useState } from "react";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
export type Scheme = "system" | "light" | "dark";
const key = "reference-studio:scheme";
const order: Scheme[] = ["system", "light", "dark"];
const labels: Record<Scheme, string> = {
  system: "Color mode: system",
  light: "Color mode: light",
  dark: "Color mode: dark",
};
export function storedScheme(): Scheme {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}
/* The tokens are light-dark() pairs, so `color-scheme` on <html> is the whole switch;
 * `data-scheme` is what the kit's Theme Toggle reads to light its face. */
export function applyScheme(scheme: Scheme) {
  const root = document.documentElement;
  root.dataset.scheme = scheme;
  root.style.colorScheme = scheme === "system" ? "light dark" : scheme;
}
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
    <Button
      variant="ghost"
      iconOnly
      className="sk-icon-toggle sk-theme-toggle"
      aria-label={labels[scheme]}
      title={labels[scheme]}
      onClick={() =>
        setScheme(order[(order.indexOf(scheme) + 1) % order.length]!)
      }
    >
      {order.map((face) => (
        <span key={face} data-face={face}>
          <Icon name={`mode-${face}`} />
        </span>
      ))}
    </Button>
  );
}
