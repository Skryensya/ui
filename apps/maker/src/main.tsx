import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "@skryensya/icons-lucide/select.css";
import "./app.css";

/* The chrome is built from the kit, so it loads the kit's sheets; the stage loads its own. */
import.meta.glob("../../../packages/core/css/components/*.css", { eager: true });
import.meta.glob("../../../packages/core/css/patterns/*.css", { eager: true });

document.documentElement.setAttribute("data-scheme", "light");
document.documentElement.style.colorScheme = "light";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
