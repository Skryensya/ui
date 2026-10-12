import { definePattern, type PatternModule } from "../../model/types.js";
import { grid } from "../kit.js";

interface Photo {
  file: string;
  width: number;
  height: number;
  alt: string;
  title?: string;
  credit: string;
}
interface Content {
  label: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetZoomLabel: string;
  errorLabel: string;
  counterLabel: string;
  photos: Photo[];
}

const DIR = "/demos/lightbox";

const { pattern, use } = definePattern<Content>({
  id: "photo-gallery",
  subject: "media",
  scale: "component",
  title: { en: "Photo gallery", es: "Galería de fotos" },
  layout: { en: "A row of square thumbnails, each a link to its full photo, and one Lightbox that opens any of them at that place in the set.", es: "Una fila de miniaturas cuadradas, cada una un enlace a su foto completa, y un Lightbox que abre cualquiera en su lugar del conjunto." },
  fields: { label: { en: "The viewer's name.", es: "El nombre del visor." }, closeLabel: { en: "The close button's name.", es: "El nombre del botón de cerrar." }, previousLabel: { en: "The previous button's name.", es: "El nombre del botón de anterior." }, nextLabel: { en: "The next button's name.", es: "El nombre del botón de siguiente." }, zoomInLabel: { en: "The zoom-in button's name.", es: "El nombre del botón de acercar." }, zoomOutLabel: { en: "The zoom-out button's name.", es: "El nombre del botón de alejar." }, resetZoomLabel: { en: "The reset-zoom button's name.", es: "El nombre del botón de restablecer zoom." }, errorLabel: { en: "What it says when a photo fails to load.", es: "Lo que dice cuando una foto no carga." }, counterLabel: { en: "The position, with {index} and {count}.", es: "La posición, con {index} y {count}." }, photos: { en: "The photos: a file, its real size, what it shows, an optional title and its credit.", es: "Las fotos: un archivo, su tamaño real, qué muestra, un título opcional y su crédito." } },
  notes: [
    { en: "Each thumbnail is a real link to the full photo, so with no script at all it still opens the picture; the viewer takes over the click.", es: "Cada miniatura es un enlace real a la foto completa, así que sin ningún script igual abre la imagen; el visor se encarga del clic." },
    { en: "Give every photo its real width and height, and a small copy at its own proportions: the viewer can then reserve the space and show something while the big one loads.", es: "Da a cada foto su ancho y alto reales y una copia pequeña con sus proporciones: el visor puede reservar el espacio y mostrar algo mientras carga la grande." },
  ],
  build: (content, ctx) => {
    const id = `${ctx.ns}-viewer`;
    return {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        grid(
          content.photos.map((photo) => ({
            contract: "lightbox",
            signature: "Lightbox.Trigger",
            options: { opens: id, triggerSrc: `${DIR}/${photo.file}.jpg`, triggerWidth: photo.width, triggerHeight: photo.height, triggerThumbnail: `${DIR}/${photo.file}-small.jpg`, ...(photo.title ? { triggerTitle: photo.title } : {}), triggerCredit: photo.credit },
            slots: { children: { contract: "image-frame", signature: "ImageFrame", options: { aspect: "1/1", radius: "control", src: `${DIR}/${photo.file}-thumb.jpg`, alt: photo.alt } } },
          })),
          { columns: "3", gap: "sm", responsive: false },
        ),
        {
          contract: "lightbox",
          signature: "Lightbox",
          options: { lightboxId: id, label: content.label, closeLabel: content.closeLabel, previousLabel: content.previousLabel, nextLabel: content.nextLabel, zoomInLabel: content.zoomInLabel, zoomOutLabel: content.zoomOutLabel, resetZoomLabel: content.resetZoomLabel, errorLabel: content.errorLabel, counterLabel: content.counterLabel },
        },
      ],
    };
  },
});

export const photoGallery: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "gallery-landscapes",
      intent: "content/presentation/photo-gallery",
      title: { en: "Landscape photos", es: "Fotos de paisaje" },
      purpose: { en: "Show a small set of photos as thumbnails and let the reader see any of them large, with zoom, one after another.", es: "Mostrar un conjunto pequeño de fotos como miniaturas y dejar que quien lee vea cualquiera en grande, con zoom, una tras otra." },
      content: {
        label: { en: "Landscape photos", es: "Fotos de paisaje" },
        closeLabel: { en: "Close", es: "Cerrar" },
        previousLabel: { en: "Previous photo", es: "Foto anterior" },
        nextLabel: { en: "Next photo", es: "Foto siguiente" },
        zoomInLabel: { en: "Zoom in", es: "Acercar" },
        zoomOutLabel: { en: "Zoom out", es: "Alejar" },
        resetZoomLabel: { en: "Reset zoom", es: "Restablecer zoom" },
        errorLabel: { en: "This photo could not be loaded.", es: "No se pudo cargar esta foto." },
        counterLabel: { en: "Photo {index} of {count}", es: "Foto {index} de {count}" },
        photos: [
          { file: "fjord", width: 1800, height: 1200, alt: { en: "A fjord at dawn: dark water and rock under a pale sky", es: "Un fiordo al amanecer: agua y roca oscuras bajo un cielo pálido" }, title: { en: "Dawn over the fjord", es: "Amanecer en el fiordo" }, credit: "Alexey Topolyanskiy · Unsplash" },
          { file: "coast", width: 1800, height: 1200, alt: { en: "A wide coast with blue sea and green hills", es: "Una costa amplia con mar azul y colinas verdes" }, title: { en: "The wide coast", es: "La costa amplia" }, credit: "Paul Jarvis · Unsplash" },
          { file: "waterfall", width: 1800, height: 1201, alt: { en: "A waterfall in a green forest", es: "Una cascada en un bosque verde" }, credit: "Andrew Coelho · Unsplash" },
        ],
      },
    }),
  ],
};
