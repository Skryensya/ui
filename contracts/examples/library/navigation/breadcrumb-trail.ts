import { definePattern, type PatternModule } from "../../model/types.js";
import { icon } from "../kit.js";

interface Content {
  label: string;
  /** Ancestors first; the last one is the page you are on. */
  trail: string[];
}

const { pattern, use } = definePattern<Content>({
  id: "breadcrumb-trail",
  subject: "navigation",
  scale: "fragment",
  title: { en: "Breadcrumb trail", es: "Ruta de migas" },
  layout: { en: "A Breadcrumb of ancestor links with a chevron between them, ending in the current page as plain text.", es: "Un Breadcrumb de enlaces a los ancestros con un chevron entre ellos, que termina en la página actual como texto." },
  fields: { label: { en: "The landmark's name, to tell it from other navs.", es: "El nombre del landmark, para distinguirlo de otras navegaciones." }, trail: { en: "The levels from the top down; the last is where you are.", es: "Los niveles de arriba abajo; el último es dónde estás." } },
  notes: [{ en: "The current page is the only crumb that is not a link, and it carries `aria-current`. A long trail collapses its middle levels by itself.", es: "La página actual es la única miga que no es enlace, y lleva `aria-current`. Una ruta larga colapsa sola sus niveles de en medio." }],
  build: ({ label, trail }) => ({
    contract: "breadcrumb",
    signature: "Breadcrumb",
    options: { label },
    slots: {
      separator: icon("chevron-right", "sm"),
      items: trail.map((crumb, index) => (index === trail.length - 1 ? { options: { current: true }, slots: { label: crumb } } : { options: { href: "#" }, slots: { label: crumb } })),
    },
  }),
});

export const breadcrumbTrail: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "breadcrumb-members", intent: "navigation/destinations/breadcrumb", title: { en: "Where am I", es: "Dónde estoy" }, purpose: { en: "Say where a deep page sits in its hierarchy and let the reader climb back up.", es: "Decir dónde está una página profunda en su jerarquía y dejar subir de nivel." }, content: { label: { en: "Breadcrumb", es: "Ruta de navegación" }, trail: [{ en: "Projects", es: "Proyectos" }, "Northwind", { en: "Settings", es: "Ajustes" }, { en: "Members", es: "Miembros" }] } }),
  ],
};
