import { ImageFrame, type ImageFrameProps } from "@skryensya/react/image-frame";
import type { CSSProperties } from "react";
import { BreakCaseFindings } from "./debug-case-findings";

function calibrationImage(width: number, height: number) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#d8e4ed"/><path d="M0 0L${width} ${height}M0 ${height}L${width} 0" stroke="#254d6f" stroke-width="8"/><circle cx="${width / 2}" cy="${height / 2}" r="60" fill="#b54c4c"/></svg>`)}`;
}
const CASES: { label: string; props: ImageFrameProps; note?: string }[] = [
  {
    label: "Demo",
    props: {
      src: "/demos/lightbox/coast.jpg",
      alt: "Coastal landscape",
      aspect: "16/9",
    },
  },
  {
    label: "Panorama 4000×200",
    props: {
      src: calibrationImage(4000, 200),
      alt: "Panorama calibration target",
      aspect: "1/1",
      fit: "cover",
    },
    note: "Calibration source tests crop geometry, not photographic quality.",
  },
  {
    label: "Portrait 200×4000",
    props: {
      src: calibrationImage(200, 4000),
      alt: "Portrait calibration target",
      aspect: "1/1",
      fit: "contain",
    },
  },
  {
    label: "Broken source",
    props: {
      src: "/debug/missing-image-frame-fixture.jpg",
      alt: "International billing reconciliation and security review - Aleksandra Wiśniewska-Kowalczyk",
      aspect: "16/9",
    },
    note: "The 404 is intentional. Inspect the actual broken-image/alt state; no harness fallback is inserted.",
  },
  {
    label: "Missing media (invalid contract)",
    props: { aspect: "16/9" },
    note: "Contract requires exactly one media source. Deliberately invalid input; not a supported empty state.",
  },
  {
    label: "Transparent artwork",
    props: {
      src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><text x="20" y="120" font-size="64" fill="black">Northwind</text></svg>')}`,
      alt: "Northwind wordmark",
      aspect: "3/2",
      fit: "contain",
    },
    note: "Black artwork on transparency: inspect it in dark mode. The asset itself has no theme awareness - ImageFrame cannot know what color an arbitrary image's pixels are, and must not guess (inverting colors wholesale breaks the photos that are fine).",
  },
  {
    label: "Transparent artwork, backed",
    props: {
      src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><text x="20" y="120" font-size="64" fill="black">Northwind</text></svg>')}`,
      alt: "Northwind wordmark",
      aspect: "3/2",
      fit: "contain",
      style: { "--sk-image-frame-bg": "#fff" } as CSSProperties,
    },
    note: "Same asset, same both themes - but the caller who KNOWS this logo needs a light backing sets --sk-image-frame-bg (already a published hook; see imageFrameContract.hooks) once, on this instance only. Legible in dark mode without touching the SVG or any other image on the page.",
  },
];

export function ImageFrameBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: ImageFrame</h1>
        <p className="break-intro">
          Real media plus calibrated extreme aspect ratios, an intentional 404,
          missing media and transparent artwork. The harness does not repair a
          broken source, invert colors, or choose a replacement background for
          an image it knows nothing about - the one exception is{" "}
          <strong>Transparent artwork, backed</strong>, which sets the
          already-published <code>--sk-image-frame-bg</code> hook, something
          any caller who knows their own asset can do the same way.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, props, note }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">ImageFrame - {label}</h2>
            <BreakCaseFindings component="image-frame" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <ImageFrame {...props} />
              </div>
            </div>
            {note ? <p className="break-case__note">{note}</p> : null}
          </section>
        ))}
      </div>
    </div>
  );
}
