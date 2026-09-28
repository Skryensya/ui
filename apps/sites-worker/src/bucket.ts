/*
 * The part of Cloudflare's R2 binding this Worker uses, written out so the Worker type-checks and is
 * tested without Cloudflare's type package or its local runtime. `memoryBucket` is the stand-in the
 * tests run against; in production `env.SITES` is the real binding, which has this same shape.
 */
export type StoredObject = {
  readonly body: ReadableStream | null;
  readonly httpEtag: string;
  readonly httpMetadata?: { readonly contentType?: string };
  text(): Promise<string>;
};

export type Listed = {
  readonly objects: readonly { readonly key: string }[];
  readonly delimitedPrefixes: readonly string[];
  readonly truncated: boolean;
  readonly cursor?: string;
};

export interface Bucket {
  get(key: string): Promise<StoredObject | null>;
  head(key: string): Promise<unknown | null>;
  put(key: string, value: string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
  list(options: { prefix?: string; delimiter?: string; cursor?: string; limit?: number }): Promise<Listed>;
}

export function memoryBucket(): Bucket & { readonly keys: () => string[] } {
  const store = new Map<string, { value: string; contentType?: string; etag: string }>();
  let version = 0;
  return {
    keys: () => [...store.keys()].sort(),
    async get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      return {
        body: new Response(entry.value).body,
        httpEtag: `"${entry.etag}"`,
        httpMetadata: { contentType: entry.contentType },
        text: async () => entry.value,
      };
    },
    async head(key) {
      return store.has(key) ? {} : null;
    },
    async put(key, value, options) {
      store.set(key, { value, contentType: options?.httpMetadata?.contentType, etag: `v${++version}` });
      return {};
    },
    async delete(keys) {
      for (const key of Array.isArray(keys) ? keys : [keys]) store.delete(key);
    },
    async list({ prefix = "", delimiter }) {
      const matching = [...store.keys()].filter((key) => key.startsWith(prefix)).sort();
      if (!delimiter) return { objects: matching.map((key) => ({ key })), delimitedPrefixes: [], truncated: false };
      const prefixes = new Set<string>();
      const objects: { key: string }[] = [];
      for (const key of matching) {
        const rest = key.slice(prefix.length);
        const cut = rest.indexOf(delimiter);
        if (cut === -1) objects.push({ key });
        else prefixes.add(prefix + rest.slice(0, cut + 1));
      }
      return { objects, delimitedPrefixes: [...prefixes], truncated: false };
    },
  };
}
