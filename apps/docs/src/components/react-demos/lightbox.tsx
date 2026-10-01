import { useRef } from "react";
import { Lightbox, type LightboxHandle, type LightboxImage } from "@skryensya/react/lightbox";
import { framedIn } from "./framed";

const framed = framedIn("lightbox");

const demoCss = `.lightbox-card-demo {
  display: grid;
  gap: var(--space-stack-md);
  inline-size: min(100%, 24rem);
  padding: var(--space-inset-md);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-surface);
  background: var(--color-bg-surface);
}

.lightbox-card-demo__image {
  display: block;
  inline-size: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-control);
  object-fit: cover;
}

.lightbox-card-demo__body {
  display: grid;
  gap: var(--space-stack-xs);
}

.lightbox-card-demo__title,
.lightbox-card-demo__copy {
  margin: 0;
}

.lightbox-card-demo__title {
  font-weight: var(--font-weight-label);
}

.lightbox-card-demo__copy {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
}`;

type LightboxCardDemoProps = {
  title: string;
  body: string;
  action: string;
  label: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetZoomLabel: string;
  errorLabel: string;
  counterLabel: string;
  images: LightboxImage[];
};

export const LightboxCardDemo = framed(function LightboxCardDemo({
  action,
  body,
  closeLabel,
  counterLabel,
  errorLabel,
  images,
  label,
  nextLabel,
  previousLabel,
  resetZoomLabel,
  title,
  zoomInLabel,
  zoomOutLabel,
}: LightboxCardDemoProps) {
  const lightbox = useRef<LightboxHandle>(null);
  const hero = images[0];

  return (
    <>
      <article className="lightbox-card-demo">
        {hero ? <img className="lightbox-card-demo__image" src={hero.thumbnailSrc ?? hero.src} alt={hero.alt} /> : null}
        <div className="lightbox-card-demo__body">
          <h4 className="lightbox-card-demo__title">{title}</h4>
          <p className="lightbox-card-demo__copy">{body}</p>
        </div>
        <button
          className="sk-button sk-interactive"
          data-tone="accent"
          type="button"
          onClick={() => lightbox.current?.open({ images, index: 0 })}
        >
          {action}
        </button>
      </article>
      <Lightbox
        ref={lightbox}
        label={label}
        closeLabel={closeLabel}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
        resetZoomLabel={resetZoomLabel}
        errorLabel={errorLabel}
        counterLabel={counterLabel}
      />
    </>
  );
}, { css: demoCss, minHeight: "24rem", viewport: "overlay" });
