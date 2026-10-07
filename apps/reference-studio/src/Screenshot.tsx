import { useEffect, useState, type CSSProperties } from "react";
import { Loader } from "@skryensya/react/loader";
import type { ReferenceClient } from "./client";
export type NaturalSize = { width: number; height: number };
export function Screenshot({
  client,
  id,
  thumbnail = false,
  className,
  style,
  onNaturalSize,
}: {
  client: ReferenceClient;
  id: string;
  thumbnail?: boolean;
  className?: string;
  /** Sizing for the image itself; the frame around it follows. */
  style?: CSSProperties;
  /** The image's own pixel size, once it has loaded. */
  onNaturalSize?: (size: NaturalSize) => void;
}) {
  const [src, setSrc] = useState<string>(),
    [error, setError] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    let objectUrl: string | undefined;
    setError(false);
    setSrc(undefined);
    void client
      .screenshot(id, abort.signal, thumbnail)
      .then((blob) => {
        if (abort.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!abort.signal.aborted) setError(true);
      });
    return () => {
      abort.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, id, thumbnail]);
  return (
    <div
      className={className ?? (thumbnail ? "studio-thumbnail" : "studio-shot")}
    >
      {src ? (
        <img
          src={src}
          alt="Captured UI reference"
          loading={thumbnail ? "lazy" : undefined}
          style={style}
          onLoad={(e) =>
            onNaturalSize?.({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            })
          }
        />
      ) : error ? (
        <span>Screenshot unavailable</span>
      ) : (
        <Loader label={thumbnail ? undefined : "Loading screenshot"} />
      )}
    </div>
  );
}
