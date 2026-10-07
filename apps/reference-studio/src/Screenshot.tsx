import { useEffect, useState } from "react";
import type { ReferenceClient } from "./client";
export function Screenshot({
  client,
  id,
  thumbnail = false,
}: {
  client: ReferenceClient;
  id: string;
  thumbnail?: boolean;
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
  return src ? (
    <img src={src} alt="Captured UI reference" loading="lazy" />
  ) : (
    <p>{error ? "Screenshot unavailable" : "Loading screenshot…"}</p>
  );
}
