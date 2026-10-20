/*
 * CARD EXAMPLE DATA, shared by the two locale pages and by the live React demos.
 *
 * Card is not a component, so the docs teach it with a LADDER of compositions: each example is a
 * grid of three cards, and the ladder runs from plain content with no container at all, through a
 * bare Box, to a media Tile that navigates. The copy
 * lives here, once per locale, because three consumers need the same strings (the Spanish page, the
 * English page, and the React island that renders next to both), and a card whose demo says one
 * thing while its source says another teaches nothing.
 *
 * The images are the docs' own satin placeholders (`lib/satin.ts`): a card example is about the
 * COMPOSITION, and a stock photograph invites the reader to believe the asset is part of the system.
 * Abstract folds cannot be mistaken for one, work offline, and match the look of the rest of the docs.
 */

import type { StableIconName } from "@skryensya/core/icon";
import { satin } from "../lib/satin";

export type CardLang = "es" | "en";

export type PlainMediaCard = { src: string; alt: string; title: string; body: string };
export type BasicCard = { title: string; body: string };
export type MetaCard = { badge: string; tone: "neutral" | "accent" | "success" | "warning"; date: string; title: string; body: string };
export type StatCard = { label: string; value: string; change: string; trend: "up" | "down" };
export type LinkCard = { icon: StableIconName; title: string; body: string };
export type ActionCard = { icon: StableIconName; title: string; body: string };
export type SelectCard = { title: string; body: string; checked: boolean };
export type MediaCard = { src: string; alt: string; badge: string; title: string; body: string };
/** `strength` varies across the three so the grid shows what the hook actually does. */
export type GradientCard = { src: string; alt: string; strength: "subtle" | "moderate" | "strong"; eyebrow: string; title: string; body: string };
export type MediaLinkCard = { src: string; alt: string; eyebrow: string; title: string; body: string };
export type ProductCard = { badge: string; tone: "accent" | "neutral"; title: string; body: string; price: string; period: string };

export type CardCopy = {
  /** Label rendered on the grid's accessible name, per example. */
  labels: Record<string, string>;
  plainMedia: PlainMediaCard[];
  basic: BasicCard[];
  meta: MetaCard[];
  stat: StatCard[];
  link: LinkCard[];
  action: ActionCard[];
  select: SelectCard[];
  media: MediaCard[];
  gradient: GradientCard[];
  mediaLink: MediaLinkCard[];
  product: ProductCard[];
  /** Recurring micro-copy: call-to-action strings that repeat across examples. */
  cta: { read: string; open: string; add: string; details: string; month: string };
};

/* Three dark tints so a grid of three reads as a set. */
const media = { a: satin("blue"), b: satin("sage"), c: satin("lilac") } as const;

/*
 * PALE satin, and only for the two examples that put a caption on the image.
 *
 * The wash exists to hold white text over a picture that might be bright. Demonstrated over the dark
 * tints above, it was invisible (dark ink fading into dark), and the example argued against itself: a
 * reader would conclude the gradient does nothing. A pale picture is the honest stand-in for the bright
 * one the wash is actually for.
 */
const paleMedia = { a: "pearl", b: "mist", c: "blush" } as const;
const tall = (k: keyof typeof paleMedia) => satin(paleMedia[k], "4x5");
const wide = (k: keyof typeof paleMedia) => satin(paleMedia[k], "16x9");

export const cardCopy: Record<CardLang, CardCopy> = {
  es: {
    labels: {
      plainMedia: "Casos de estudio",
      basic: "Notas del equipo",
      meta: "Últimas publicaciones",
      stat: "Resumen del negocio",
      link: "Accesos directos",
      action: "Acciones del proyecto",
      select: "Preferencias de la cuenta",
      media: "Guías con portada",
      gradient: "Historias destacadas",
      mediaLink: "Artículos recientes",
      product: "Planes de suscripción",
    },
    cta: {
      read: "Leer nota",
      open: "Abrir",
      add: "Añadir",
      details: "Ver detalle",
      month: "/mes",
    },
    plainMedia: [
      { src: media.a, alt: "Equipo de Acme trabajando en su oficina", title: "Cómo Acme redujo su tiempo de carga", body: "Migraron a Grid y Stack y sacaron cuarenta líneas de CSS propio por vista." },
      { src: media.b, alt: "Equipo de soporte de Nimbus", title: "El soporte de Nimbus responde en minutos", body: "Un tablero compartido reemplazó tres hojas de cálculo distintas." },
      { src: media.c, alt: "Equipo de producto de Vela", title: "Vela cambió Slack por avisos dentro del producto", body: "Menos ruido, y la alerta llega justo donde se toma la decisión." },
    ],
    basic: [
      { title: "Versión 2.4", body: "Mejora la búsqueda y reduce el tiempo de carga en los proyectos grandes." },
      { title: "Versión 2.3", body: "Añade historial de actividad por proyecto y filtros guardados." },
      { title: "Versión 2.2", body: "Corrige el foco visible en los diálogos anidados y en el menú." },
    ],
    meta: [
      { badge: "Publicado", tone: "success", date: "18 de julio", title: "Cómo diseñamos la vista de actividad", body: "Las decisiones que permiten recorrer seis meses de cambios sin perder el contexto." },
      { badge: "Borrador", tone: "warning", date: "12 de julio", title: "Anatomía de una tarjeta", body: "Por qué la forma visual no alcanza para decidir el elemento que va en la raíz." },
      { badge: "Interno", tone: "neutral", date: "4 de julio", title: "Densidad y toque", body: "Cómo la densidad aprieta el layout sin tocar nunca el área de toque nativa." },
    ],
    stat: [
      { label: "Ingresos", value: "48.200 €", change: "12,5%", trend: "up" },
      { label: "Pedidos", value: "1.204", change: "8,2%", trend: "up" },
      { label: "Cancelaciones", value: "0,9%", change: "0,3 puntos", trend: "down" },
    ],
    link: [
      { icon: "info", title: "Documentación", body: "Guías, contratos y decisiones del sistema." },
      { icon: "external-link", title: "Repositorio", body: "Código fuente, issues y releases." },
      { icon: "user", title: "Soporte", body: "Escríbenos y respondemos el mismo día." },
    ],
    action: [
      { icon: "add", title: "Nuevo proyecto", body: "Empieza desde una plantilla o desde cero." },
      { icon: "upload", title: "Importar datos", body: "Sube un CSV y mapea las columnas." },
      { icon: "user", title: "Invitar equipo", body: "Suma personas y asigna un rol." },
    ],
    select: [
      { title: "Resumen semanal", body: "Un correo los lunes con la actividad de tus proyectos.", checked: true },
      { title: "Menciones", body: "Avisos cuando alguien te nombra en un comentario.", checked: false },
      { title: "Novedades", body: "Cambios del producto y notas de versión.", checked: false },
    ],
    media: [
      { src: media.a, alt: "Portada de la guía de tokens", badge: "Guía", title: "Tokens de color", body: "Cómo se elige una rampa y por qué el modo oscuro no es un invertido." },
      { src: media.b, alt: "Portada de la guía de layout", badge: "Guía", title: "Layout y densidad", body: "Stack, Inline y Grid resuelven el 90% de las pantallas sin CSS propio." },
      { src: media.c, alt: "Portada de la guía de movimiento", badge: "Guía", title: "Movimiento", body: "Duraciones, curvas y la regla que respeta a quien pide menos movimiento." },
    ],
    gradient: [
      { src: tall("a"), strength: "subtle", alt: "Fotografía de la campaña Aurora", eyebrow: "Campaña · subtle", title: "Aurora", body: "El lavado más liviano, para una foto que ya es oscura donde va el texto." },
      { src: tall("b"), strength: "moderate", alt: "Fotografía de la campaña Marea", eyebrow: "Campaña · moderate", title: "Marea", body: "El valor por defecto, y el que sirve para casi cualquier fotografía." },
      { src: tall("c"), strength: "strong", alt: "Fotografía de la campaña Cobalto", eyebrow: "Campaña · strong", title: "Cobalto", body: "El más denso, para una foto clara o con mucho detalle bajo el texto." },
    ],
    mediaLink: [
      { src: wide("a"), alt: "Portada del artículo sobre anclaje", eyebrow: "Producto · 6 min", title: "Anclaje sin JavaScript", body: "Dejamos que el navegador coloque los popups y el código se volvió más chico." },
      { src: wide("b"), alt: "Portada del artículo sobre contraste", eyebrow: "Accesibilidad · 4 min", title: "Contraste que sobrevive un rebranding", body: "Los pares de contraste se prueban solos, y una marca nueva no los rompe." },
      { src: wide("c"), alt: "Portada del artículo sobre bindings", eyebrow: "Ingeniería · 8 min", title: "Un contrato, dos bindings", body: "El mismo marcado en Vanilla y en React, sin una segunda receta de estilos." },
    ],
    product: [
      { badge: "Inicial", tone: "neutral", title: "Inicial", body: "Para una persona que empieza: tres proyectos y treinta días de historial.", price: "0 €", period: "/mes" },
      { badge: "Recomendado", tone: "accent", title: "Profesional", body: "Proyectos ilimitados, historial completo y roles por proyecto.", price: "24 €", period: "/mes" },
      { badge: "Equipos", tone: "neutral", title: "Negocio", body: "Auditoría, inicio de sesión único y soporte con acuerdo de nivel.", price: "72 €", period: "/mes" },
    ],
  },
  en: {
    labels: {
      plainMedia: "Case studies",
      basic: "Team notes",
      meta: "Latest posts",
      stat: "Business summary",
      link: "Shortcuts",
      action: "Project actions",
      select: "Account preferences",
      media: "Guides with cover",
      gradient: "Featured stories",
      mediaLink: "Recent articles",
      product: "Subscription plans",
    },
    cta: {
      read: "Read note",
      open: "Open",
      add: "Add",
      details: "See details",
      month: "/month",
    },
    plainMedia: [
      { src: media.a, alt: "The Acme team working in their office", title: "How Acme cut their load time", body: "They moved to Grid and Stack and dropped forty lines of their own CSS per view." },
      { src: media.b, alt: "The Nimbus support team", title: "Nimbus support answers in minutes", body: "One shared board replaced three separate spreadsheets." },
      { src: media.c, alt: "The Vela product team", title: "Vela swapped Slack for in-product alerts", body: "Less noise, and the alert lands right where the decision gets made." },
    ],
    basic: [
      { title: "Version 2.4", body: "Improves search and cuts loading time on large projects." },
      { title: "Version 2.3", body: "Adds per-project activity history and saved filters." },
      { title: "Version 2.2", body: "Fixes visible focus in nested dialogs and in the menu." },
    ],
    meta: [
      { badge: "Published", tone: "success", date: "July 18", title: "How we designed the activity view", body: "The decisions that let you walk six months of changes without losing context." },
      { badge: "Draft", tone: "warning", date: "July 12", title: "Anatomy of a card", body: "Why the visual shape is not enough to decide which element goes at the root." },
      { badge: "Internal", tone: "neutral", date: "July 4", title: "Density and touch", body: "How density tightens the layout without ever touching the native touch target." },
    ],
    stat: [
      { label: "Revenue", value: "€48,200", change: "12.5%", trend: "up" },
      { label: "Orders", value: "1,204", change: "8.2%", trend: "up" },
      { label: "Cancellations", value: "0.9%", change: "0.3 points", trend: "down" },
    ],
    link: [
      { icon: "info", title: "Documentation", body: "Guides, contracts and system decisions." },
      { icon: "external-link", title: "Repository", body: "Source code, issues and releases." },
      { icon: "user", title: "Support", body: "Write to us and we answer the same day." },
    ],
    action: [
      { icon: "add", title: "New project", body: "Start from a template or from scratch." },
      { icon: "upload", title: "Import data", body: "Upload a CSV and map the columns." },
      { icon: "user", title: "Invite team", body: "Add people and assign a role." },
    ],
    select: [
      { title: "Weekly digest", body: "An email on Mondays with your project activity.", checked: true },
      { title: "Mentions", body: "Notices when somebody names you in a comment.", checked: false },
      { title: "Product updates", body: "Product changes and release notes.", checked: false },
    ],
    media: [
      { src: media.a, alt: "Cover of the tokens guide", badge: "Guide", title: "Color tokens", body: "How a ramp is chosen and why dark mode is not an inverted palette." },
      { src: media.b, alt: "Cover of the layout guide", badge: "Guide", title: "Layout and density", body: "Stack, Inline and Grid solve 90% of screens with no CSS of your own." },
      { src: media.c, alt: "Cover of the motion guide", badge: "Guide", title: "Motion", body: "Durations, curves and the rule that respects anyone asking for less motion." },
    ],
    gradient: [
      { src: tall("a"), strength: "subtle", alt: "Photograph from the Aurora campaign", eyebrow: "Campaign · subtle", title: "Aurora", body: "The lightest wash, for a photo already dark where the text sits." },
      { src: tall("b"), strength: "moderate", alt: "Photograph from the Tide campaign", eyebrow: "Campaign · moderate", title: "Tide", body: "The default, and the one that works for almost any photograph." },
      { src: tall("c"), strength: "strong", alt: "Photograph from the Cobalt campaign", eyebrow: "Campaign · strong", title: "Cobalt", body: "The densest, for a bright photo or heavy detail under the text." },
    ],
    mediaLink: [
      { src: wide("a"), alt: "Cover of the anchoring article", eyebrow: "Product · 6 min", title: "Anchoring without JavaScript", body: "We let the browser place the popups and the code got smaller." },
      { src: wide("b"), alt: "Cover of the contrast article", eyebrow: "Accessibility · 4 min", title: "Contrast that survives a rebrand", body: "Contrast pairs test themselves, and a new brand does not break them." },
      { src: wide("c"), alt: "Cover of the bindings article", eyebrow: "Engineering · 8 min", title: "One contract, two bindings", body: "The same markup in Vanilla and React, with no second styling recipe." },
    ],
    product: [
      { badge: "Starter", tone: "neutral", title: "Starter", body: "For one person getting going: three projects and thirty days of history.", price: "€0", period: "/month" },
      { badge: "Recommended", tone: "accent", title: "Professional", body: "Unlimited projects, full history and per-project roles.", price: "€24", period: "/month" },
      { badge: "Teams", tone: "neutral", title: "Business", body: "Audit log, single sign-on and support with a service level agreement.", price: "€72", period: "/month" },
    ],
  },
};
