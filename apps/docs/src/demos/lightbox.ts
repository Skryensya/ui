import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { videoPlayerWords } from "./data/video-player-words";

/*
 * The docs' own satin pictures (`tools/frost-backdrop`, one per tint), kept under `public/demos/lightbox/` so the demos and the
 * gates work offline, each with a square
 * 400px thumbnail beside it, drawn at a fixed 200×200 (2x for dense screens), and a `-small` copy at
 * the photo's OWN proportions (480px on the long side) that the lightbox shows blurred while the full
 * one loads: the square is a crop, and a crop is never a placeholder.
 *
 * EVERY PHOTO AT ITS OWN RATIO, never cut to one: a photo cropped to a shape it was not taken in
 * reads as broken the moment the lightbox shows it whole. So the portrait is a photo taken upright,
 * not a landscape cut down to one, and the landscapes are 3:2. Still covered: landscape, portrait, a
 * bright snowfield (where a white icon with no surface of its own would vanish) and a 240px image
 * the viewer must NOT enlarge.
 */
const DIR = "/demos/lightbox";

type Photo = {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly title?: string;
  readonly description?: string;
  readonly credit?: string;
  /** Has a `-small.jpg`: every photo larger than one. The 240px puppy is its own placeholder. */
  readonly small?: boolean;
};

const photos = (t: Translate): readonly Photo[] => [
  {
    file: "fjord",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.dawnAlt"),
    title: t("lightbox.demo.dawnTitle"),
    description: t("lightbox.demo.dawnDescription"),
    credit: "skryensya/ui",
  },
  {
    file: "street",
    small: true,
    width: 1200,
    height: 1600,
    alt: t("lightbox.demo.forestAlt"),
    title: t("lightbox.demo.forestTitle"),
    credit: "skryensya/ui",
  },
  {
    file: "coast",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.panoramaAlt"),
    title: t("lightbox.demo.panoramaTitle"),
    description: t("lightbox.demo.panoramaDescription"),
    credit: "skryensya/ui",
  },
  {
    file: "waterfall",
    small: true,
    width: 1800,
    height: 1201,
    alt: t("lightbox.demo.lighthouseAlt"),
    title: t("lightbox.demo.lighthouseTitle"),
    credit: "skryensya/ui",
  },
  {
    file: "snow-camp",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.snowAlt"),
    description: t("lightbox.demo.snowDescription"),
    credit: "skryensya/ui",
  },
  {
    file: "puppy",
    width: 240,
    height: 144,
    alt: t("lightbox.demo.tinyAlt"),
    description: t("lightbox.demo.tinyDescription"),
    credit: "skryensya/ui",
  },
];

const labels = (t: Translate) => ({
  label: t("lightbox.demo.label"),
  closeLabel: t("lightbox.closeLabel"),
  previousLabel: t("lightbox.previousLabel"),
  nextLabel: t("lightbox.nextLabel"),
  zoomInLabel: t("lightbox.zoomInLabel"),
  zoomOutLabel: t("lightbox.zoomOutLabel"),
  resetZoomLabel: t("lightbox.resetZoomLabel"),
  errorLabel: t("lightbox.errorLabel"),
  counterLabel: t("lightbox.counterLabel"),
});

const thumbnailImage = (photo: Photo): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { aspect: "1/1", radius: "control", src: `${DIR}/${photo.file}-thumb.jpg`, alt: photo.alt },
});

const thumbnailContent = (photo: Photo): UsageTree => thumbnailImage(photo);

const trigger = (opens: string, photo: Photo): UsageTree => ({
  contract: "lightbox",
  signature: "Lightbox.Trigger",
  options: {
    opens,
    triggerSrc: `${DIR}/${photo.file}.jpg`,
    triggerWidth: photo.width,
    triggerHeight: photo.height,
    ...(photo.small ? { triggerThumbnail: `${DIR}/${photo.file}-small.jpg` } : {}),
    ...(photo.title ? { triggerTitle: photo.title } : {}),
    ...(photo.description ? { triggerDescription: photo.description } : {}),
    ...(photo.credit ? { triggerCredit: photo.credit } : {}),
  },
  slots: {
    /* The thumbnail's alt names the link, and the lightbox reuses it for the full image. */
    children: thumbnailContent(photo),
  },
});

const thumbnail = (photo: Photo): UsageTree => thumbnailContent(photo);

const lightboxSpecimen = (children: UsageTree | UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  attrs: { style: "inline-size: 28rem; max-inline-size: 100%;" },
  children,
});

const ddText = (children: string, tone: "primary" | "secondary" | "danger" = "secondary"): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "sm", tone },
  children,
});

const compactThumbRow = (children: readonly UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "sm", responsive: false },
  attrs: { role: "list", style: "inline-size: 100%;" },
  children: children.map((child) => ({
    contract: "layout",
    signature: "Stack",
    attrs: { role: "listitem", style: "min-inline-size: 0;" },
    children: child,
  })),
});

const galleryItem = (image: UsageTree, label: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [image, ddText(label)],
});

export const lightboxDoGalleryDdTree = (t: Translate): UsageTree => {
  const items = photos(t).slice(0, 3).map((photo) =>
    galleryItem(trigger("demo-lightbox-dd-gallery", photo), t("lightbox.dd.gallery.itemDo")),
  );
  return lightboxSpecimen([
    compactThumbRow(items),
    ddText(t("lightbox.dd.gallery.specimenDo")),
    { contract: "lightbox", signature: "Lightbox", options: { lightboxId: "demo-lightbox-dd-gallery", ...labels(t) } },
  ]);
};

export const lightboxDontStaticDdTree = (t: Translate): UsageTree => {
  const items = photos(t).slice(0, 3).map((photo) => galleryItem(thumbnail(photo), t("lightbox.dd.gallery.itemDont")));
  return lightboxSpecimen([
    compactThumbRow(items),
    ddText(t("lightbox.dd.gallery.specimenDont"), "danger"),
  ]);
};

const captionDetails = (children: UsageTree | UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "sunken", padding: "sm" },
  children,
});

export const lightboxDoCaptionDdTree = (t: Translate): UsageTree => {
  const photo = photos(t)[0]!;
  return lightboxSpecimen([
    compactThumbRow([trigger("demo-lightbox-dd-caption", photo)]),
    captionDetails([
      { contract: "typography", signature: "Text", options: { size: "sm", weight: "label" }, children: photo.title! },
      ddText(photo.description!),
      { contract: "typography", signature: "Text", options: { size: "caption", tone: "tertiary" }, children: photo.credit! },
    ]),
    { contract: "lightbox", signature: "Lightbox", options: { lightboxId: "demo-lightbox-dd-caption", ...labels(t) } },
  ]);
};

export const lightboxDontNoCaptionDdTree = (t: Translate): UsageTree => {
  const photo = photos(t)[1]!;
  const noCaption = { ...photo, title: undefined, description: undefined, credit: undefined };
  return lightboxSpecimen([
    compactThumbRow([trigger("demo-lightbox-dd-no-caption", noCaption)]),
    captionDetails(ddText(t("lightbox.dd.caption.specimenDont"), "danger")),
    { contract: "lightbox", signature: "Lightbox", options: { lightboxId: "demo-lightbox-dd-no-caption", ...labels(t) } },
  ]);
};

const lightboxCardImage = (photo: Photo): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { aspect: "16/9", radius: "top", src: `${DIR}/${photo.file}-thumb.jpg`, alt: photo.alt },
});

const lightboxCardSpecimen = (photo: Photo, action?: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "sm" },
  attrs: { style: "inline-size: min(100%, 15rem);" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "start" },
    children: [
      lightboxCardImage(photo),
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          { contract: "typography", signature: "Heading", options: { headingElement: "h3", headingSize: "h5", flush: true }, children: photo.title ?? photo.alt },
          { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: photo.credit ?? photo.alt },
        ],
      },
      ...(action ? [{ contract: "button", signature: "Button.action", options: { tone: "accent", size: "sm" }, children: action } as UsageTree] : []),
    ],
  },
});

export const lightboxDoCardDdTree = (t: Translate): UsageTree =>
  lightboxCardSpecimen(photos(t)[0]!, t("lightbox.cardAction"));

export const lightboxDontImageOnlyDdTree = (t: Translate): UsageTree =>
  lightboxCardSpecimen(photos(t)[0]!);

/*
 * A GALLERY IS THE TRIGGERS. Six thumbnails naming one lightbox's id, in page order; clicking one
 * opens the lightbox at that position. No script: the controller listens for them itself. A
 * wrapping row of fixed 200px thumbnails, not a grid: a thumbnail that grows with the stage is a
 * second copy of the photo, and the lightbox is where it gets big.
 */
export const lightboxGalleryTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm" },
      attrs: { role: "list", "aria-label": t("lightbox.demo.galleryLabel") },
      children: photos(t).map((photo) => ({
        contract: "layout",
        signature: "Stack",
        attrs: { role: "listitem" },
        children: [trigger("demo-lightbox-gallery", photo)],
      })),
    },
    {
      contract: "lightbox",
      signature: "Lightbox",
      options: { lightboxId: "demo-lightbox-gallery", ...labels(t) },
    },
  ],
});

/* One photo: no counter, no arrows, nothing a single image does not need. */
export const lightboxSingleTree = (t: Translate): UsageTree => {
  const photo = photos(t)[2]!;
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      trigger("demo-lightbox-single", photo),
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-single", ...labels(t) },
      },
    ],
  };
};

export const lightboxCaptionTree = (t: Translate): UsageTree => {
  const [dawn, snow] = [photos(t)[0]!, photos(t)[4]!];
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: true },
        children: [dawn, snow].map((photo) => trigger("demo-lightbox-caption", photo)),
      },
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-caption", ...labels(t) },
      },
    ],
  };
};

export const lightboxTinyTree = (t: Translate): UsageTree => {
  const photo = photos(t)[5]!;
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      trigger("demo-lightbox-tiny", photo),
      {
        contract: "typography",
        signature: "Text",
        options: { size: "sm", tone: "secondary" },
        children: t("lightbox.tinyNote"),
      },
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-tiny", ...labels(t) },
      },
    ],
  };
};

/*
 * VIDEOS: the same triggers and the same viewer, pointed at clips. The file name says it is a video (`.webm`), so nothing but the
 * clip's own address, its size and its poster (the thumbnail's bigger twin) is needed; `triggerVideoLoop` keeps each clip running,
 * and the viewer's counter and error words say "video". The thumbnails are the posters, so what flies out of the page is what the
 * clip starts as.
 */
const VIDEO_DIR = "/demos/lightbox-video";
type Clip = { readonly file: string; readonly alt: string; readonly title: string; readonly description?: string };
const clips = (t: Translate): readonly Clip[] => [
  { file: "satin-blue", alt: t("lightbox.demo.videoBlueAlt"), title: t("lightbox.demo.videoBlueTitle"), description: t("lightbox.demo.videoBlueDescription") },
  { file: "satin-sage", alt: t("lightbox.demo.videoSageAlt"), title: t("lightbox.demo.videoSageTitle") },
  { file: "satin-sand", alt: t("lightbox.demo.videoSandAlt"), title: t("lightbox.demo.videoSandTitle"), description: t("lightbox.demo.videoSandDescription") },
  { file: "satin-lilac", alt: t("lightbox.demo.videoLilacAlt"), title: t("lightbox.demo.videoLilacTitle") },
];

const clipTrigger = (opens: string, clip: Clip): UsageTree => ({
  contract: "lightbox",
  signature: "Lightbox.Trigger",
  options: {
    opens,
    triggerSrc: `${VIDEO_DIR}/${clip.file}.webm`,
    triggerWidth: 1600,
    triggerHeight: 900,
    triggerThumbnail: `${VIDEO_DIR}/${clip.file}-poster.jpg`,
    triggerVideoLoop: true,
    triggerTitle: clip.title,
    ...(clip.description ? { triggerDescription: clip.description } : {}),
    triggerCredit: "skryensya/ui",
  },
  slots: {
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "1/1", radius: "control", src: `${VIDEO_DIR}/${clip.file}-thumb.jpg`, alt: clip.alt },
    },
  },
});

export const lightboxVideoTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm" },
      attrs: { role: "list", "aria-label": t("lightbox.demo.videoLabel") },
      children: clips(t).map((clip) => ({
        contract: "layout",
        signature: "Stack",
        attrs: { role: "listitem" },
        children: [clipTrigger("demo-lightbox-video", clip)],
      })),
    },
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      children: t("lightbox.videoNote"),
    },
    {
      contract: "lightbox",
      signature: "Lightbox",
      options: {
        lightboxId: "demo-lightbox-video",
        loop: true,
        ...labels(t),
        label: t("lightbox.demo.videoViewerLabel"),
        counterLabel: t("lightbox.videoCounterLabel"),
        errorLabel: t("lightbox.videoErrorLabel"),
      },
      slots: {
        /* The system's VideoPlayer, in the page's language. Its `src` is only the first clip: the viewer loads each item's own file into it. */
        video: {
          contract: "video-player",
          signature: "VideoPlayer",
          options: { src: `${VIDEO_DIR}/${clips(t)[0]!.file}.webm`, ...videoPlayerWords(t), autoHide: true },
        },
      },
    },
  ],
});

/* Loop on, and a broken image in the middle: navigation carries on straight through the error. */
export const lightboxLoopTree = (t: Translate): UsageTree => {
  const [dawn, forest] = photos(t);
  const broken: Photo = {
    file: "missing",
    width: 1600,
    height: 1000,
    alt: t("lightbox.demo.brokenAlt"),
    title: t("lightbox.demo.brokenTitle"),
  };
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm" },
        children: [dawn!, broken, forest!].map((photo) => ({
          contract: "layout",
          signature: "Stack",
          children: [
            photo.file === "missing"
              ? {
                  ...trigger("demo-lightbox-loop", photo),
                  slots: {
                    children: {
                      contract: "image-frame",
                      signature: "ImageFrame",
                      options: { aspect: "1/1", radius: "control", src: `${DIR}/snow-camp-thumb.jpg`, alt: photo.alt },
                    },
                  },
                }
              : trigger("demo-lightbox-loop", photo),
          ],
        })),
      },
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-loop", loop: true, ...labels(t) },
      },
    ],
  };
};

/* ImageFrame is the thumbnail's own; the lightbox's sheet brings button + loader. */
export const lightboxDemoCss = `.sk-lightbox__trigger {
  inline-size: 200px;
}

/* A thumbnail that opens a clip says so: a play mark over its middle, drawn here because the viewer styles the viewer, not the page's thumbnails. */
.sk-lightbox__trigger:is([href$=".webm"], [href$=".mp4"]) {
  position: relative;
}
.sk-lightbox__trigger:is([href$=".webm"], [href$=".mp4"])::after {
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  inline-size: 3rem;
  block-size: 3rem;
  translate: -50% -50%;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.45);
  clip-path: none;
  pointer-events: none;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
.sk-lightbox__trigger:is([href$=".webm"], [href$=".mp4"])::before {
  content: "";
  position: absolute;
  z-index: 1;
  inset: 50% auto auto 50%;
  inline-size: 1rem;
  block-size: 1.2rem;
  translate: -35% -50%;
  background: white;
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  pointer-events: none;
}`;

