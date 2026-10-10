import "@skryensya/core/components/button.css";
import "@skryensya/core/components/dialog.css";
import "@skryensya/core/components/file-upload.css";
import "@skryensya/core/components/image-cropper.css";
import "@skryensya/core/components/typography.css";
import "@skryensya/core/patterns/icon.css";
import { Button } from "@skryensya/react/button";
import { Dialog } from "@skryensya/react/dialog";
import { FileUpload } from "@skryensya/react/file-upload";
import { ImageCropper, type ImageCropperHandle } from "@skryensya/react/image-cropper";
import type { ImageCropperConfirmDetails, ImageCropperError, ImageCropperValue } from "@skryensya/core/image-cropper";
import { useEffect, useRef, useState } from "react";
import { CROPPER_PICTURE } from "@docs/demos/image-cropper";
import type { Meta, StoryObj } from "../tree-story";

/*
 * THE RECIPES: what a tree cannot say because it has state or a page around it. A controlled cropper, one in a dialog, the file that
 * comes out, the join with FileUpload, a picture heavy enough to be seen loading. The plain examples (rectangle, circle, free, 16:9,
 * custom ratio, rotation and zoom, disabled, error) are the generated stories beside these.
 */
export default { title: "Components/Media & Visuals/Image Cropper/Recipes", parameters: { layout: "padded" } } satisfies Meta;

const alt = "A mountain landscape at sunset, with the sun above a lake";
const start: ImageCropperValue = { position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 };
const stack = { display: "grid", gap: "1rem", maxInlineSize: "44rem" } as const;
const mono = { margin: 0, padding: "0.75rem", fontSize: "0.8125rem", background: "var(--color-bg-sunken, #f4f4f4)", borderRadius: "0.5rem", overflow: "auto" } as const;

/** What `onCropConfirm` hands over, made into a file and a number for the eye. */
function useExport() {
  const [result, setResult] = useState<{ url: string; type: string; size: number; width: number; height: number } | null>(null);
  const [error, setError] = useState<ImageCropperError | null>(null);
  const previous = useRef("");
  useEffect(() => () => void (previous.current && URL.revokeObjectURL(previous.current)), []);
  const confirm = async (details: ImageCropperConfirmDetails) => {
    try {
      const blob = await details.exportBlob();
      const bitmap = await createImageBitmap(blob);
      if (previous.current) URL.revokeObjectURL(previous.current);
      previous.current = URL.createObjectURL(blob);
      setResult({ url: previous.current, type: blob.type, size: blob.size, width: bitmap.width, height: bitmap.height });
      setError(null);
    } catch (reason) {
      setError(reason as ImageCropperError);
    }
  };
  return { result, error, confirm };
}

function Result({ result, error, round }: { result: ReturnType<typeof useExport>["result"]; error: ImageCropperError | null; round?: boolean }) {
  if (error) return <p role="alert">{`${error.code}: ${error.message}`}</p>;
  if (!result) return <p>Apply the crop to see the file that comes out.</p>;
  return (
    <figure style={{ margin: 0, display: "grid", gap: "0.5rem", justifyItems: "start" }}>
      <img alt="The exported crop" src={result.url} style={{ maxInlineSize: "14rem", borderRadius: round ? "50%" : "0.5rem", background: "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 16px 16px" }} />
      <figcaption>{`${result.type}, ${result.width} × ${result.height} px, ${(result.size / 1024).toFixed(1)} kB`}</figcaption>
    </figure>
  );
}

/** The cropper held by the page: `value` goes in, `onValueChange` comes out, and a button from outside moves it. */
export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = useState<ImageCropperValue>({ position: { x: 0.2, y: 0.7 }, zoom: 1.8, rotation: 10 });
    return (
      <div style={stack}>
        <ImageCropper alt={alt} aspect="4:3" onValueChange={(details) => setValue(details.value)} src={CROPPER_PICTURE} value={value} />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button onClick={() => setValue(start)} variant="soft">Reset from outside</Button>
          <Button onClick={() => setValue({ position: { x: 0.9, y: 0.2 }, zoom: 2.5, rotation: -20 })} variant="soft">Jump to a stored crop</Button>
        </div>
        <pre style={mono}>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  },
};

/** The cropper inside a modal dialog: Cancel closes it, Apply exports and closes it, focus returns to the button that opened it. */
export const InDialog: StoryObj = {
  render: () => {
    const opener = useRef<HTMLElement | null>(null);
    const { result, error, confirm } = useExport();
    const dialog = () => document.getElementById("image-cropper-dialog") as HTMLDialogElement | null;
    const close = () => {
      dialog()?.close();
      opener.current?.focus();
    };
    return (
      <div style={stack}>
        <Button
          onClick={(event) => {
            opener.current = event.currentTarget;
            dialog()?.showModal();
          }}
        >
          Change profile picture
        </Button>
        <Dialog id="image-cropper-dialog" onClose={() => opener.current?.focus()} title="Profile picture">
          <ImageCropper
            alt={alt}
            maxZoom={3}
            onCancel={close}
            onCropConfirm={async (details) => {
              await confirm(details);
              close();
            }}
            shape="circle"
            src={CROPPER_PICTURE}
          />
        </Dialog>
        <Result error={error} result={result} round />
      </div>
    );
  },
};

/** What comes out: type, size and the exact pixels, for a rectangle and for a circle. Try 16:9 with a JPEG, and the circle. */
export const ExportedFile: StoryObj = {
  render: () => {
    const [circle, setCircle] = useState(false);
    const { result, error, confirm } = useExport();
    return (
      <div style={stack}>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input checked={circle} onChange={(event) => setCircle(event.target.checked)} type="checkbox" /> Circle (always a transparent PNG)
        </label>
        <ImageCropper alt={alt} aspect="16:9" onCropConfirm={confirm} outputQuality={0.85} outputType="image/jpeg" outputWidth={1200} shape={circle ? "circle" : "rectangle"} src={CROPPER_PICTURE} />
        <Result error={error} result={result} round={circle} />
      </div>
    );
  },
};

/** Three components, none of which knows the others: the file chosen, the picture cropped, the crop shown. The join is the page's. */
export const WithFileUpload: StoryObj = {
  render: () => {
    const [src, setSrc] = useState(CROPPER_PICTURE);
    const created = useRef("");
    const { result, error, confirm } = useExport();
    useEffect(() => () => void (created.current && URL.revokeObjectURL(created.current)), []);
    return (
      <div style={stack}>
        <FileUpload
          accept="image/*"
          dropzoneLabel="Drop an image here"
          label="Choose a photo"
          maxFiles={1}
          onFileChange={({ acceptedFiles }) => {
            const [file] = acceptedFiles;
            if (!file) return;
            if (created.current) URL.revokeObjectURL(created.current);
            created.current = URL.createObjectURL(file);
            setSrc(created.current);
          }}
          triggerLabel="Browse files"
        />
        <ImageCropper alt="The photo you are going to crop" onCropConfirm={confirm} shape="circle" src={src} />
        <Result error={error} result={result} round />
      </div>
    );
  },
};

/** A picture heavy enough to be seen loading: it is drawn on the spot, so the stage says so while it decodes. */
export const LargeImageLoading: StoryObj = {
  render: () => {
    const [src, setSrc] = useState("");
    const [status, setStatus] = useState<"idle" | "making" | "ready">("idle");
    const handle = useRef<ImageCropperHandle>(null);
    const created = useRef("");
    useEffect(() => () => void (created.current && URL.revokeObjectURL(created.current)), []);
    const make = async () => {
      setStatus("making");
      const canvas = document.createElement("canvas");
      canvas.width = 9000;
      canvas.height = 6000;
      const context = canvas.getContext("2d")!;
      const gradient = context.createLinearGradient(0, 0, 9000, 6000);
      gradient.addColorStop(0, "#1e3a8a");
      gradient.addColorStop(1, "#f59e0b");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 9000, 6000);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((made) => resolve(made!), "image/png"));
      created.current = URL.createObjectURL(blob);
      setSrc(created.current);
      setStatus("ready");
    };
    return (
      <div style={stack}>
        <Button onClick={make}>{status === "making" ? "Drawing 54 megapixels…" : "Crop a 9000 × 6000 image"}</Button>
        {src ? <ImageCropper alt="A very large gradient" aspect="16:9" ref={handle} src={src} /> : <p>Nothing to crop yet.</p>}
      </div>
    );
  },
};

/** In a narrow container (a phone, a sidebar, a small dialog): the preview goes under the stage and every control is a finger tall. */
export const NarrowContainer: StoryObj = {
  render: () => (
    <div style={{ inlineSize: "22rem", maxInlineSize: "100%" }}>
      <ImageCropper alt={alt} shape="circle" src={CROPPER_PICTURE} />
    </div>
  ),
};
