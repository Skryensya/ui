import { definePattern, type PatternModule } from "../../model/types.js";
import { box, heading, lanes, stack, text } from "../kit.js";

interface Content {
  label: string;
  aside: { brand: string; title: string; body: string; quote: string; author: string };
  /** Id of the use on the other side: the form. */
  form: string;
}

const { pattern, use } = definePattern<Content>({
  id: "brand-split",
  subject: "form",
  scale: "composition",
  title: { en: "Brand panel beside a form", es: "Panel de marca junto a un formulario" },
  layout: { en: "Two equal lanes (one on a phone): a sunken panel with the brand, a pitch and a customer quote, and the form stretched to the same height.", es: "Dos carriles iguales (uno en el teléfono): un panel hundido con la marca, una propuesta y una cita de cliente, y el formulario estirado a la misma altura." },
  fields: { label: { en: "The pair's accessible name.", es: "El nombre accesible del par." }, aside: { en: "The brand panel's words.", es: "Las palabras del panel de marca." }, form: { en: "Id of the use that is the form.", es: "Id del uso que es el formulario." } },
  notes: [{ en: "The lanes are `equal` (stretch) because the pair is read as one object; the form is a use of its own, so the same form works with or without the panel.", es: "Los carriles son `equal` (stretch) porque el par se lee como un solo objeto; el formulario es un uso propio, así que sirve con o sin el panel." }],
  build: ({ label, aside, form }, ctx) =>
    lanes(
      label,
      [
        box([stack([text(aside.brand, { textRole: "eyebrow" }), stack([heading(aside.title, "h3"), text(aside.body, { tone: "secondary" })], { gap: "sm" }), stack([text(aside.quote, { size: "lg" }), text(aside.author, { size: "sm", tone: "tertiary" })], { gap: "xs" })], { gap: "xl" })], { surface: "sunken", padding: "xl" }),
        ctx.render(form),
      ],
      "2",
      true,
    ),
});

export const brandSplit: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "auth-branded", intent: "identity/access/branded-sign-in", title: { en: "Branded sign-in", es: "Acceso con marca" }, purpose: { en: "The sign-in form beside a panel that says what the product is.", es: "El formulario de entrada junto a un panel que dice qué es el producto." }, content: { label: { en: "Branded sign-in", es: "Acceso con marca" }, aside: { brand: "Lumen", title: { en: "Your whole team, in one place", es: "Todo tu equipo, en un mismo lugar" }, body: { en: "Projects, files and conversations, without jumping between tools.", es: "Proyectos, archivos y conversaciones, sin saltar entre herramientas." }, quote: { en: "“We stopped looking for things and started finishing them.”", es: "«Dejamos de buscar cosas y empezamos a terminarlas.»" }, author: { en: "Marta Ruiz, Design", es: "Marta Ruiz, Diseño" } }, form: "sign-in-email-password" } }),
  ],
};
