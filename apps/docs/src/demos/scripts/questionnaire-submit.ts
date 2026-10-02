/*
 * What a page does with a submitted questionnaire, in the demo: the browser's own form submission is
 * cancelled (it would reload the frame), and the form gives way to a "received" view.
 *
 * The questionnaire announces a valid submit as `sk:questionnairesubmit`; that is the only thing this
 * waits for. The words on the received view are all in the tree.
 */
const root = document.querySelector<HTMLElement>("[data-questionnaire-demo]");
const form = root?.querySelector<HTMLFormElement>("form");
const done = document.getElementById("questionnaire-done");
const again = document.getElementById("questionnaire-again");

form?.addEventListener("submit", (event) => event.preventDefault());

form?.addEventListener("sk:questionnairesubmit", () => {
  /* `hidden` alone loses to the form's own `display`, so the form is taken out of the layout directly. */
  form.style.display = "none";
  if (done) {
    done.hidden = false;
    done.setAttribute("data-state", "open");
  }
});

again?.addEventListener("click", () => window.location.reload());
