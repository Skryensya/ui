const region = document.querySelector("[data-emit-region]");
const template = document.querySelector<HTMLTemplateElement>("[data-toast-template]");

document.querySelector("[data-emit-toast]")?.addEventListener("click", async () => {
  // `content` is a DocumentFragment and only a <template> has one, which is why the query above
  // asks for the element type rather than for any Element. React renders a <template>'s children as
  // real nodes instead of into `content`, so fall back to them.
  const toast = (template?.content.firstElementChild ?? template?.firstElementChild)?.cloneNode(true);
  if (!region || !(toast instanceof Element)) return;

  region.append(toast);
  await window.skMount?.(toast);
});
