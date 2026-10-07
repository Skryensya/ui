import { definePattern, type PatternModule } from "../../model/types.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  src: string;
  alt: string;
  /** What kind of thing the image stands for: one word. */
  label: string;
  /** True when a clipping card carries the image to its edge, so the image drops its own radius. */
  flush?: boolean;
}

const { pattern, use } = definePattern<Content>({
  id: "corner-label-image",
  subject: "card",
  scale: "fragment",
  title: { en: "Image with a corner label", es: "Imagen con etiqueta en la esquina" },
  layout: { en: "A 16:9 image with a Badge overlaid at its top edge.", es: "Una imagen 16:9 con una Badge superpuesta en su borde superior." },
  fields: { src: { en: "Image address.", es: "Dirección de la imagen." }, alt: { en: "What the image shows.", es: "Qué muestra la imagen." }, label: { en: "The kind of content, one word.", es: "El tipo de contenido, una palabra." }, flush: { en: "Drop the image's radius for a card that clips its corners.", es: "Quitar el radio de la imagen en una card que recorta sus esquinas." } },
  notes: [{ en: "The Badge lives in the image's caption overlay, so it moves with the image and is read after it.", es: "La Badge vive en el overlay de la imagen, así que se mueve con ella y se lee después." }],
  build: ({ src, alt, label, flush }): UsageTree => ({
    contract: "image-frame",
    signature: "ImageFrame",
    options: { src, alt, aspect: "16/9", fit: "cover", radius: flush ? "none" : "surface" },
    slots: {
      caption: {
        contract: "media-overlay",
        signature: "MediaOverlay",
        options: { edge: "top" },
        children: [{ contract: "badge", signature: "Badge", children: label }],
      },
    },
  }),
});

export const cornerLabelImage: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "guide-image",
      intent: "content/presentation/labelled-image",
      title: { en: "Labelled image", es: "Imagen con etiqueta" },
      purpose: { en: "An image that classifies its content with a label on top.", es: "Una imagen que clasifica su contenido con una etiqueta encima." },
      content: { src: "https://dummyimage.com/640x360/d9e2ec/334e68&text=%20", alt: { en: "Sample image", es: "Imagen de ejemplo" }, label: { en: "Guide", es: "Guía" } },
    }),
  ],
};
