const root = document.querySelector<HTMLElement>(".placeholder-example");
const status = root?.querySelector<HTMLElement>("[data-placeholder-status]");
const swap = root?.querySelector(".placeholder-example__swap");
const loading = root?.querySelector("[data-placeholder-loading]");
const content = root?.querySelector("[data-placeholder-content]");
const restart = root?.querySelector<HTMLButtonElement>("[data-placeholder-restart]");

// Both words come from the markup, not from this file: they are translations, and translations
// live in the tree. Written here, the script would have to be built once per language.
const loadingText = status?.textContent ?? "";
const loadedText = status?.dataset.loaded ?? "";
const LOAD_MS = 5000;

let timer = 0;

/* Back to the skeleton: what the reader sees before the "request" returns. */
const reset = () => {
  window.clearTimeout(timer);
  root?.setAttribute("aria-busy", "true");
  swap?.setAttribute("data-state", "loading");
  loading?.setAttribute("aria-hidden", "false");
  content?.setAttribute("aria-hidden", "true");
  if (status) status.textContent = loadingText;
};

const load = () => {
  root?.setAttribute("aria-busy", "false");
  swap?.setAttribute("data-state", "loaded");
  loading?.setAttribute("aria-hidden", "true");
  content?.setAttribute("aria-hidden", "false");
  if (status) status.textContent = loadedText;
};

/* One "request": show the skeleton, then swap after LOAD_MS. */
const run = () => {
  reset();
  timer = window.setTimeout(load, LOAD_MS);
};

restart?.addEventListener("click", run);

/*
 * The clock does not start until the example is on screen. Started on mount, a reader who scrolls
 * to it late finds the swap already done and never sees a skeleton at all. Once is enough: after
 * that the button is the way to watch it again.
 */
if (swap && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    },
    { threshold: 0.6 },
  );
  observer.observe(swap);
} else {
  run();
}
