/* A static anatomy specimen: keep Window's portalled panel inside its inert subject. */
const subject = document.querySelector<HTMLElement>(".sk-annotated__subject");
const root = subject?.querySelector<HTMLElement>(".sk-window");
const positioner = document.querySelector<HTMLElement>(".sk-window__positioner");
if (subject && root && positioner) {
  subject.inert = true;
  positioner.inert = true;
  root.append(positioner);
}
