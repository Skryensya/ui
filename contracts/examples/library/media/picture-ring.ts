import { definePattern, type PatternModule } from "../../model/types.js";

interface Picture {
  tint: string;
  alt: string;
}
interface Content {
  label: string;
  curve: "convex" | "concave";
  pictures: Picture[];
}

const { pattern, use } = definePattern<Content>({
  id: "picture-ring",
  subject: "media",
  scale: "component",
  title: { en: "Picture ring", es: "Anillo de imágenes" },
  layout: { en: "A centred Carousel of pictures on a ring, looping, opening mid-way so there are pictures on both sides.", es: "Un Carousel centrado de imágenes sobre un anillo, en bucle, que abre a la mitad para que haya imágenes a ambos lados." },
  fields: {
    label: { en: "What the set is, for assistive tech.", es: "Qué es el conjunto, para la tecnología de asistencia." },
    curve: { en: "convex to see the ring from outside, concave to stand inside it.", es: "convex para ver el anillo desde fuera, concave para estar dentro." },
    pictures: { en: "The pictures, six to ten: a satin tint and what each shows.", es: "Las imágenes, de seis a diez: un tono de satén y qué muestra cada una." },
  },
  notes: [
    { en: "align=\"center\" with an edgePadding of half the track minus half a slide: the picture at rest is the middle one, and the first and last can reach it.", es: "align=\"center\" con un edgePadding de la mitad de la pista menos media slide: la imagen en reposo es la del medio, y la primera y la última pueden llegar ahí." },
    { en: "defaultPage opens it mid-way. Opened on the first picture, a ring has an empty half.", es: "defaultPage lo abre a la mitad. Abierto en la primera imagen, un anillo tiene una mitad vacía." },
    { en: "One picture per slide: the curve turns the slide's content, so a slide holding two things would turn them apart.", es: "Una imagen por slide: la curva gira el contenido de la slide, así que una slide con dos cosas las giraría por separado." },
  ],
  build: (content) => ({
    contract: "carousel",
    signature: "Carousel",
    options: {
      curve: content.curve,
      align: "center",
      edgePadding: "calc(50% - min(30%, 9rem))",
      slideSize: "min(60%, 18rem)",
      loop: true,
      defaultPage: Math.floor(content.pictures.length / 2) - 1,
    },
    attrs: { "aria-label": content.label },
    children: content.pictures.map((picture) => ({
      contract: "carousel",
      signature: "CarouselSlide",
      children: { contract: "image-frame", signature: "ImageFrame", options: { src: `/demos/satin/satin-${picture.tint}-4x3.jpg`, alt: picture.alt, aspect: "3/4", radius: "surface" } },
    })),
  }),
});

const satin = (tint: string, en: string, es: string) => ({ tint, alt: { en: `${en} satin folds`, es: `Pliegues de satén ${es}` } });
const pictures = [
  satin("blue", "Blue", "azul"),
  satin("sand", "Sand", "arena"),
  satin("sage", "Sage-green", "verde salvia"),
  satin("lilac", "Lilac", "lila"),
  satin("slate", "Slate-grey", "gris pizarra"),
  satin("graphite", "Graphite", "grafito"),
  satin("blue", "Blue", "azul"),
  satin("sand", "Sand", "arena"),
];

export const pictureRing: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "ring-featured-work",
      intent: "content/presentation/featured-ring",
      title: { en: "Featured work", es: "Trabajos destacados" },
      purpose: { en: "Open a portfolio or a launch with a few pieces seen from outside a ring: the chosen one stands in front, the rest turn away.", es: "Abrir un portafolio o un lanzamiento con unas pocas piezas vistas desde fuera de un anillo: la elegida queda al frente y el resto gira alejándose." },
      content: { label: { en: "Featured work", es: "Trabajos destacados" }, curve: "convex", pictures },
    }),
    use({
      id: "ring-gallery-room",
      intent: "content/presentation/panorama",
      title: { en: "Gallery room", es: "Sala de galería" },
      purpose: { en: "Put the reader inside a set of pictures, like a panorama room: the one ahead recedes and the sides wrap around.", es: "Poner a quien mira dentro de un conjunto de imágenes, como una sala panorámica: la de enfrente se aleja y los lados la rodean." },
      content: { label: { en: "Gallery room", es: "Sala de galería" }, curve: "concave", pictures },
    }),
  ],
};
