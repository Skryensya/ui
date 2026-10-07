import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyScheme, storedScheme } from "./theme";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "@skryensya/icons-lucide/select.css";
import "./studio.css";

/* The studio is built from the kit, so it loads the kit's sheets. */
import.meta.glob("../../../packages/core/css/components/*.css", {
  eager: true,
});
import.meta.glob("../../../packages/core/css/patterns/*.css", { eager: true });

applyScheme(storedScheme());
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
