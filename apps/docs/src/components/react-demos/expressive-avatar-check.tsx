/*
 * CHECK YOUR FACE. Pick the images of an expressive avatar, named after their expressions, and it says what is
 * missing, which are not the same square, and shows the face alive with the files you chose. Nothing leaves the
 * browser: the images are read through object URLs and revoked when the choice changes.
 */
import { useEffect, useRef, useState } from "react";
import { ExpressiveAvatar } from "@skryensya/react/expressive-avatar";
import {
  checkExpressiveAvatarImages,
  expressiveAvatarLooks,
  type ExpressiveAvatarImageReport,
} from "@skryensya/core/expressive-avatar";

type Copy = {
  choose: string;
  idle: string;
  reading: string;
  ok: string;
  missingBase: string;
  notSquare: string;
  mixedSizes: string;
  builtIn: string;
  custom: string;
  fallsBack: string;
  preview: string;
  notImages: string;
};

type Chosen = { urls: Record<string, string>; report: ExpressiveAvatarImageReport };

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

const measure = (url: string) =>
  new Promise<{ width: number; height: number } | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });

export function ExpressiveAvatarCheck({ copy }: { copy: Copy }) {
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejected, setRejected] = useState(false);
  const current = useRef<Chosen | null>(null);

  const release = () => {
    for (const url of Object.values(current.current?.urls ?? {})) URL.revokeObjectURL(url);
    current.current = null;
  };
  useEffect(() => release, []);

  async function choose(files: FileList | null) {
    const images = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    release();
    setChosen(null);
    setRejected(Boolean(files?.length) && images.length === 0);
    if (!images.length) return;
    setBusy(true);
    const urls: Record<string, string> = {};
    const sizes: Record<string, { width: number; height: number }> = {};
    for (const file of images) {
      /* The name of the expression is the name of the file, without its extension. */
      const name = file.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(file);
      const size = await measure(url);
      if (!size) {
        URL.revokeObjectURL(url);
        continue;
      }
      urls[name] = url;
      sizes[name] = size;
    }
    const next = { urls, report: checkExpressiveAvatarImages(sizes) };
    current.current = next;
    setChosen(next);
    setBusy(false);
  }

  const report = chosen?.report;
  const list = (names: string[]) => names.map((name) => `${name}`).join(", ");

  return (
    <div className="ea-check">
      <label className="ea-check__drop">
        <input className="ea-check__input" type="file" accept="image/*" multiple onChange={(event) => void choose(event.target.files)} />
        <span>{copy.choose}</span>
      </label>

      <div className="ea-check__report" role="status" aria-live="polite">
        {busy ? (
          <p>{copy.reading}</p>
        ) : rejected ? (
          <p>{copy.notImages}</p>
        ) : !report ? (
          <p>{copy.idle}</p>
        ) : (
          <ul className="ea-check__list">
            {report.ok && (
              <li data-state="ok">{fill(copy.ok, { count: Object.keys(chosen!.urls).length, size: report.sizes[0] ?? "" })}</li>
            )}
            {!report.hasBase && <li data-state="problem" dangerouslySetInnerHTML={{ __html: copy.missingBase }} />}
            {report.notSquare.length > 0 && <li data-state="problem">{fill(copy.notSquare, { names: list(report.notSquare) })}</li>}
            {report.sizes.length > 1 && <li data-state="problem">{fill(copy.mixedSizes, { sizes: list(report.sizes) })}</li>}
            <li>{fill(copy.builtIn, { found: report.looks.length, total: expressiveAvatarLooks.length })}</li>
            {report.hasBase && report.missing.length > 0 && report.missing.length < expressiveAvatarLooks.length - 1 && (
              <li>{fill(copy.fallsBack, { names: list(report.missing) })}</li>
            )}
            {report.custom.length > 0 && <li>{fill(copy.custom, { names: list(report.custom) })}</li>}
          </ul>
        )}
      </div>

      {chosen && chosen.report.hasBase && (
        <figure className="ea-check__preview">
          <ExpressiveAvatar name={copy.preview} size="xl" interactive images={chosen.urls} phrases={{}} />
          <figcaption>{copy.preview}</figcaption>
        </figure>
      )}
    </div>
  );
}
