import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, type Node } from "../kit.js";

interface Control {
  label: string;
  icon: string;
}
interface Content {
  label: string;
  groups: { label: string; controls: Control[] }[];
}

const control = ({ label, icon: name }: Control): Node => ({
  contract: "tooltip",
  signature: "Tooltip",
  slots: { content: label },
  children: { contract: "button", signature: "Button.action", options: { variant: "ghost", iconOnly: true }, attrs: { "aria-label": label }, children: icon(name) },
});

const { pattern, use } = definePattern<Content>({
  id: "viewer-toolbar",
  subject: "action",
  scale: "component",
  title: { en: "Grouped toolbar", es: "Barra con grupos" },
  layout: { en: "A Toolbar of named groups of icon-only buttons, a separator between groups, each button with its tooltip.", es: "Una Toolbar con grupos nombrados de botones solo de ícono, un separador entre grupos, cada botón con su tooltip." },
  fields: { label: { en: "The toolbar's accessible name.", es: "El nombre accesible de la barra." }, groups: { en: "Each group: its accessible name and its controls, each a label and an icon.", es: "Cada grupo: su nombre accesible y sus controles, cada uno con etiqueta e ícono." } },
  notes: [
    { en: "One Toolbar is one tab stop and arrows move inside it: group the controls that belong together instead of making two bars.", es: "Una Toolbar es una sola parada de tabulador y las flechas se mueven dentro: agrupa lo que va junto en vez de hacer dos barras." },
    { en: "The label is also the button's `aria-label`: a tooltip is not a name.", es: "La etiqueta es también el `aria-label` del botón: un tooltip no es un nombre." },
  ],
  build: ({ label, groups }) => ({
    contract: "toolbar",
    signature: "Toolbar",
    options: { label },
    children: groups.flatMap((group, index): Node[] => [
      ...(index > 0 ? [{ contract: "toolbar", signature: "ToolbarSeparator" } satisfies Node] : []),
      { contract: "toolbar", signature: "ToolbarGroup", options: { groupLabel: group.label }, children: group.controls.map(control) },
    ]),
  }),
});

export const viewerToolbar: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "viewer-zoom-toolbar", intent: "actions/toolbars/icon-toolbar", title: { en: "Viewer controls", es: "Controles de visor" }, purpose: { en: "Two kinds of controls on one bar: how the document is seen, and what is done with it.", es: "Dos tipos de controles en una barra: cómo se ve el documento y qué se hace con él." }, content: { label: { en: "Document viewer", es: "Visor de documento" }, groups: [{ label: { en: "View", es: "Vista" }, controls: [{ label: { en: "Zoom out", es: "Alejar" }, icon: "zoom-out" }, { label: { en: "Zoom in", es: "Acercar" }, icon: "zoom-in" }, { label: { en: "Fit to width", es: "Ajustar al ancho" }, icon: "fit" }] }, { label: { en: "File", es: "Archivo" }, controls: [{ label: { en: "Download", es: "Descargar" }, icon: "download" }, { label: { en: "Copy link", es: "Copiar enlace" }, icon: "copy" }] }] } }),
  ],
};
