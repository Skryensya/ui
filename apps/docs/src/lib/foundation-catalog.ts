import { canonicalPath, type Locale } from "../i18n";
import { documentationNavigation, getNavigation, type NavigationSection } from "./navigation";

type FoundationDescription = Readonly<Record<Locale, string>>;

/*
 * Short, purpose-first summaries for the foundations explorer. Keyed by canonical Spanish href so
 * both locale pages share one inventory; missing copy is a build error, same contract as
 * `component-catalog.ts`.
 */
const foundationDescriptions = {
  "/prerequisites": {
    es: "Reúne los conceptos de HTML, CSS y JavaScript que necesitas para usar el sistema.",
    en: "Covers the HTML, CSS, and JavaScript concepts you need to use the system.",
  },
  "/installation": {
    es: "Instala los paquetes, carga los estilos y elige el binding para tu proyecto.",
    en: "Installs the packages, loads the styles, and chooses a binding for your project.",
  },
  "/first-component": {
    es: "Construye tu primer componente con el mismo contrato en React o HTML.",
    en: "Builds your first component from the same contract in React or HTML.",
  },
  "/automatic-mounting": {
    es: "Activa el comportamiento del HTML con montaje automático o imports específicos.",
    en: "Adds behavior to authored HTML through automatic mounting or targeted imports.",
  },
  "/dependencies": {
    es: "Distingue qué resuelve el kit y qué delega en librerías de terceros.",
    en: "Distinguishes what the kit owns from what it delegates to third-party libraries.",
  },
  "/appearance": {
    es: "Compara las apariencias del kit sin cambiar la estructura ni el comportamiento de los componentes.",
    en: "Compares the kit's appearances without changing component structure or behavior.",
  },
  "/react-hook-form": {
    es: "Conecta los controles del kit con React Hook Form para manejar valores, validación y errores.",
    en: "Connects kit controls to React Hook Form for values, validation, and errors.",
  },
  "/tanstack-table": {
    es: "Compone tablas con ordenación, selección y paginación sobre TanStack Table.",
    en: "Composes sorting, selection, and pagination on top of TanStack Table.",
  },
  "/architecture": {
    es: "Explica cómo un Contract de Core define markup, comportamiento y bindings antes de React o Vanilla.",
    en: "Explains how a Core Contract defines markup, behavior, and bindings before React or Vanilla.",
  },
  "/tiers": {
    es: "Define qué puede referenciar cada tier y por qué la dirección de las referencias sostiene el sistema.",
    en: "Defines what each tier may reference and why reference direction holds the system together.",
  },
  "/reference": {
    es: "Busca cada token del sistema con su tier, valor declarado y valor resuelto en vivo.",
    en: "Looks up every system token with its tier, declared value, and live resolved value.",
  },
  "/dimensions": {
    es: "Compone modo de color, contraste, densidad y radio como cuatro ejes independientes en la cascada.",
    en: "Composes color mode, contrast, density, and radius as four independent cascade axes.",
  },
  "/density": {
    es: "Recalcula tokens de espacio y control dentro de un componente sin compactar el resto de la interfaz.",
    en: "Recalculates spacing and control tokens inside one component without compacting the rest of the interface.",
  },
  "/elevation": {
    es: "Ofrece cinco niveles de sombra nombrados para profundidad sin escribir box-shadow a mano.",
    en: "Offers five named shadow levels for depth without hand-written box-shadow.",
  },
  "/typography": {
    es: "Empareja cada tamaño con su interlineado y nombra un peso por rol, sobre una familia que viaja con el paquete.",
    en: "Pairs every size with its line-height and names one weight per role, on a family that ships with the package.",
  },
  "/icons": {
    es: "Nombra roles de icono estables mientras un set elige la geometría de marca de cada rol.",
    en: "Names stable icon roles while a set chooses the brand geometry for each role.",
  },
  "/styling-hooks": {
    es: "Expone las perillas públicas con las que redefinir la pintura de un componente ya publicado.",
    en: "Exposes the public knobs for redefining a shipped component's paint.",
  },
  "/state-layer": {
    es: "Pinta hover, focus, pressed y selected con un overlay compartido teñido por currentColor.",
    en: "Paints hover, focus, pressed, and selected feedback with one shared currentColor overlay.",
  },
  "/motion": {
    es: "Consume tokens de intención para que los componentes describan el sentido del movimiento, no duraciones crudas.",
    en: "Consumes intent tokens so components describe what movement means, not raw durations.",
  },
  "/effects": {
    es: "Agrega clases CSS opt-in para motion decorativo sobre markup o componentes existentes.",
    en: "Adds opt-in CSS classes for decorative motion on existing markup or components.",
  },
  "/zoom": {
    es: "Conserva contenido, controles y funcionalidad al ampliar texto y obligar al layout a refluir.",
    en: "Preserves content, controls, and functionality when text enlarges and layout must reflow.",
  },
  "/keyboard": {
    es: "Documenta qué hace cada tecla en cada componente, verificada contra su máquina o elemento nativo.",
    en: "Documents what each key does per component, verified against its machine or native element.",
  },
  "/storage": {
    es: "Persiste preferencias declaradas con un códec en Core y bindings para Vanilla y React.",
    en: "Persists declared preferences through one core codec with vanilla and React bindings.",
  },
  "/anchoring": {
    es: "Posiciona superficies flotantes contra un ancla, volteándolas cuando no caben en pantalla.",
    en: "Positions floating surfaces against an anchor, flipping them when they do not fit.",
  },
  "/splitter": {
    es: "Redimensiona paneles o columnas vecinas con un separador arrastrable compartido por teclado o puntero.",
    en: "Resizes neighboring panels or columns with one shared draggable separator handle.",
  },
  "/scroll-lock": {
    es: "Congela el scroll detrás de un dialog modal y reserva el gutter de la scrollbar para evitar saltos.",
    en: "Freezes scroll behind a modal dialog and reserves the scrollbar gutter to prevent layout shift.",
  },
  "/transparency": {
    es: "La política de toda superficie translúcida: base opaca, blur progresivo y reducción de transparencia.",
    en: "The policy behind every translucent surface: opaque baseline, progressive blur, reduced transparency.",
  },
} as const satisfies Readonly<Record<string, FoundationDescription>>;

type FoundationDescriptionHref = keyof typeof foundationDescriptions;

/** Resolve a localized route back to its canonical catalog summary. Missing copy is a build error. */
export function getFoundationDescription(href: string, locale: Locale): string {
  const canonical = canonicalPath(href) as FoundationDescriptionHref;
  const description = foundationDescriptions[canonical];

  if (!description) {
    throw new Error(`Missing foundation catalog description for ${canonical}`);
  }

  return description[locale];
}

/** Keep the authored reading path, rather than the sidebar's alphabetical order. */
export function foundationGroups(locale: Locale) {
  const section = getNavigation(locale).find((entry) => entry.id === "foundations");
  if (!section) throw new Error("Missing foundations navigation section");
  const authored: NavigationSection = documentationNavigation.find((entry) => entry.id === "foundations")!;
  const order = new Map(authored.groups.flatMap((group) => group.items.map((item) => item.href))
    .map((href, index) => [href, index]));

  return section.groups.map((group, index) => ({
    ...group,
    headingId: `foundations-group-${index}`,
    items: group.items.filter((item) => !item.todo)
      .sort((a, b) => order.get(canonicalPath(a.href))! - order.get(canonicalPath(b.href))!)
      .map((item) => ({ ...item, description: getFoundationDescription(item.href, locale) })),
  }));
}
