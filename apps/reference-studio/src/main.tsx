import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "./studio.css";
import "@skryensya/core/components/button.css";
import "@skryensya/core/components/badge.css";
import "@skryensya/core/patterns/state-layer.css";
document.documentElement.dataset.scheme = "light";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
