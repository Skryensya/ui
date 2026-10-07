import { useEffect, useState } from "react";
import { Loader } from "@skryensya/react/loader";
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
  return (
    <div className={thumbnail ? "studio-thumbnail" : "studio-shot"}>
      {src ? (
        <img src={src} alt="Captured UI reference" loading="lazy" />
      ) : error ? (
        <span>Screenshot unavailable</span>
      ) : (
        <Loader label={thumbnail ? undefined : "Loading screenshot"} />
      )}
    </div>
  );
}
