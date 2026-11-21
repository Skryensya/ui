import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { applyScheme, storedScheme } from "./theme";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import { IconSetProvider } from "@skryensya/react/icon";
import { icons } from "./icons";
import "./icons.css";
import "./studio.css";

/* The studio is built from the kit, so it loads the kit's sheets. */
/* Components first, then their appearance sheets: a base that loads after one wins every tie. */
import.meta.glob(["../../../packages/core/css/components/*.css", "!../../../packages/core/css/components/*.*.css"], { eager: true });
import.meta.glob("../../../packages/core/css/components/*.*.css", { eager: true });
import.meta.glob("../../../packages/core/css/patterns/*.css", { eager: true });

applyScheme(storedScheme());
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconSetProvider set={icons}>
      <App />
    </IconSetProvider>
  </StrictMode>,
);
