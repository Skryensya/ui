import { Lightbox, type LightboxHandle } from "@skryensya/react/lightbox";
import { useRef, type ReactNode } from "react";

type Media = {
  src: string;
  thumbnailSrc?: string;
  thumbnailAlt: string;
  alt?: string;
  title?: string;
  description?: string;
  credit?: string;
  width?: number;
  height?: number;
  video?: boolean;
  videoLoop?: boolean;
};

const DEMO: readonly Media[] = [
  {
    src: "/demos/lightbox/fjord.jpg",
    thumbnailSrc: "/demos/lightbox/fjord-thumb.jpg",
    thumbnailAlt: "Blue fjord at dawn",
    alt: "A quiet fjord at dawn, with the mountains reflected in still water.",
    title: "First light",
    description: "A calm morning by the water.",
    credit: "skryensya/ui",
    width: 1800,
    height: 1200,
  },
  {
    src: "/demos/lightbox/coast.jpg",
    thumbnailSrc: "/demos/lightbox/coast-thumb.jpg",
    thumbnailAlt: "Coastline seen from above",
    alt: "A wide coastline with the sea meeting the shore.",
    title: "The coastline",
    width: 1800,
    height: 1200,
  },
];

const WORST: readonly Media[] = [
  {
    src: "/demos/lightbox/fjord.jpg",
    thumbnailSrc: "/demos/lightbox/fjord-thumb.jpg",
    thumbnailAlt: "Aleksandra Wiśniewska-Kowalczyk at the northern fjord",
    alt: "Aleksandra Wiśniewska-Kowalczyk standing beside the fjord after the international billing review.",
    title: "International billing and security notifications - final review",
    description:
      "The billing-contact change takes effect after the monthly close. The finance team has reviewed the affected invoices, confirmed the regional tax records, and scheduled security notifications for every workspace administrator. Keep this full caption visible: it is the only place this gallery records what changed and why.",
    credit: "Photo supplied by the Northwind international billing and compliance team",
    width: 1800,
    height: 1200,
  },
  {
    src: "/demos/lightbox/street.jpg",
    thumbnailSrc: "/demos/lightbox/street-thumb.jpg",
    thumbnailAlt: "Đặng Thị Ngọc Hân walking along a tree-lined street",
    alt: "A tree-lined street in late afternoon light.",
    title: "Benachrichtigungseinstellungen",
    description: "Senior Product Design Engineer, Platform Infrastructure",
    credit: "Đặng Thị Ngọc Hân",
    width: 1200,
    height: 1600,
  },
  {
    src: "/demos/lightbox/coast.jpg",
    thumbnailSrc: "/demos/lightbox/coast-thumb.jpg",
    thumbnailAlt: "A panoramic coastline and the open sea",
    title: "12,345,678.90 - 1,284 items - 0 unresolved",
    description: "<script>alert(1)</script> &amp; **literal text**",
    credit: "International field report - Q3, revised v12",
  },
  {
    src: "/demos/lightbox/snow-camp.jpg",
    thumbnailSrc: "/demos/lightbox/snow-camp-thumb.jpg",
    thumbnailAlt: "A snow-covered camp under a bright sky",
    alt: "A small camp beneath a bright snowfield.",
    description: "الفواتير والتنبيهات الأمنية - 王秀英",
    width: 1800,
    height: 1200,
  },
  {
    src: "/demos/lightbox/puppy.jpg",
    thumbnailSrc: "/demos/lightbox/puppy-thumb.jpg",
    thumbnailAlt: "Jo's small dog resting on a blanket",
    alt: "A small dog curled up on a blanket.",
    title: "Jo",
    width: 240,
    height: 144,
  },
  {
    src: "/demos/lightbox/missing-full-image.jpg",
    thumbnailSrc: "/demos/lightbox/waterfall-thumb.jpg",
    thumbnailAlt: "A waterfall thumbnail whose original is unavailable",
    alt: "A waterfall hidden by mist.",
    title: "Original unavailable",
    description: "The thumbnail loads, but the full-size image returns 404.",
  },
  {
    src: "/demos/lightbox-video/satin-blue.webm",
    thumbnailSrc: "/demos/lightbox-video/satin-blue-thumb.jpg",
    thumbnailAlt: "Blue abstract video poster",
    alt: "A slowly shifting blue abstract gradient.",
    title: "Video clip",
    description: "A video item uses the native player controls and does not zoom.",
    credit: "skryensya/ui",
    width: 1600,
    height: 900,
    video: true,
  },
];

const HUGE: readonly Media[] = Array.from({ length: 1_000 }, (_, index) => {
  const number = String(index + 1).padStart(4, "0");
  return {
    src: `/demos/lightbox/coast.jpg?frame=${number}`,
    thumbnailSrc: "/demos/lightbox/coast-thumb.jpg",
    thumbnailAlt: `Saved coastline photo ${number}`,
    alt: `A coastline from saved photo ${number}.`,
    title: `Saved photo ${number}`,
    width: 1800,
    height: 1200,
  };
});

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Gallery({
  id,
  label,
  images,
  dir,
}: {
  id: string;
  label: string;
  images: readonly Media[];
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="break-w-320">
      {images.length === 0 ? <p className="break-lightbox-empty">0 images; no thumbnails to open.</p> : null}
      <div className="break-lightbox-gallery">
        {images.map((image, index) => (
          <Lightbox.Trigger
            key={`${index}-${image.src}`}
            alt={image.alt}
            credit={image.credit}
            description={image.description}
            height={image.height}
            opens={id}
            src={image.src}
            thumbnailSrc={image.thumbnailSrc}
            title={image.title}
            video={image.video}
            videoLoop={image.videoLoop}
            width={image.width}
          >
            <img
              alt={image.thumbnailAlt}
              className="break-lightbox-thumb"
              loading="lazy"
              src={image.thumbnailSrc ?? image.src}
            />
          </Lightbox.Trigger>
        ))}
      </div>
      <Lightbox
        closeLabel="Close image viewer"
        counterLabel="Image {index} of {count}"
        dir={dir}
        errorLabel="This original image could not be loaded. Check the source or return to the gallery."
        id={id}
        label={label}
        loop
        maxZoom={10}
      />
    </div>
  );
}

function EmptyGallery() {
  const ref = useRef<LightboxHandle>(null);
  return (
    <div className="break-w-320">
      <p className="break-lightbox-empty">0 images. Opening an empty gallery is a no-op.</p>
      <button className="sk-button sk-interactive" onClick={() => ref.current?.open({ images: [] })} type="button">
        Open empty gallery
      </button>
      <Lightbox id="lightbox-empty" label="Empty gallery" ref={ref} />
    </div>
  );
}

export function LightboxBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Lightbox</h1>
        <p className="break-intro">
          A gallery has no declared item or caption-length limit. These real local media fixtures cover
          mixed aspect ratios, missing metadata, an unavailable original, video, empty/single galleries,
          and 1,000 thumbnails. Open the worst-case images at 320px, 200% zoom, dark mode and RTL.
        </p>
      </header>

      <div className="break-scenario-grid">
        <Case label="Lightbox - Demo data - 320px">
          <Gallery id="lightbox-demo" label="Workspace photos" images={DEMO} />
        </Case>
        <Case label="Lightbox - Worst case - 320px">
          <Gallery id="lightbox-worst" label="International billing and security photo archive" images={WORST} />
        </Case>
        <Case label="Lightbox - Worst case - RTL">
          <Gallery dir="rtl" id="lightbox-rtl" label="معرض صور الفواتير والتنبيهات الأمنية" images={WORST} />
        </Case>
        <Case label="Lightbox - Empty gallery">
          <EmptyGallery />
        </Case>
        <Case label="Lightbox - One image">
          <Gallery id="lightbox-one" label="One saved photo" images={[DEMO[0]!]} />
        </Case>
        <Case label="Lightbox - 1,000 images">
          <Gallery id="lightbox-huge" label="Saved photo archive" images={HUGE} />
        </Case>
      </div>
    </div>
  );
}
