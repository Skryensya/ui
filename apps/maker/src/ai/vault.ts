import type { ProviderConnection } from "@skryensya/maker-agent";

/*
 * THE KEY, KEPT ON THIS DEVICE. The API key is encrypted with AES-GCM under a key the browser generated as
 * NON-EXTRACTABLE: the page can ask the browser to encrypt and decrypt with it, but no script can read the key
 * material, so a copy of the stored record (a disk image, a profile backup, a devtools export) opens to nothing.
 * It does not defend against script running in this page, which can still ask the browser to decrypt; nothing
 * client-side can. The key goes straight to the provider as before, and Forget deletes it all.
 *
 * Nothing here touches localStorage, the project, or the server.
 */

const DB = "maker-ai";
const STORE = "vault";
const SLOT = "connection";

type Record_ = { key: CryptoKey; iv: Uint8Array<ArrayBuffer>; secret: ArrayBuffer; provider: ProviderConnection["provider"]; model: string; endpoint?: string };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

/** Whether this browser can keep a key at all (IndexedDB and WebCrypto both present). */
export const canRemember = () => typeof indexedDB !== "undefined" && typeof crypto?.subtle !== "undefined";

export async function remember(connection: ProviderConnection): Promise<void> {
  if (!canRemember() || !connection.apiKey) return;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
  const secret = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(connection.apiKey));
  const record: Record_ = { key, iv, secret, provider: connection.provider, model: connection.model, ...(connection.endpoint ? { endpoint: connection.endpoint } : {}) };
  await run("readwrite", (store) => store.put(record, SLOT));
}

/** The remembered connection, or nothing: also nothing if it can no longer be decrypted, so a bad record never blocks setup. */
export async function recall(): Promise<ProviderConnection | undefined> {
  if (!canRemember()) return undefined;
  try {
    const record = await run<Record_ | undefined>("readonly", (store) => store.get(SLOT));
    if (!record) return undefined;
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: record.iv }, record.key, record.secret);
    return { provider: record.provider, model: record.model, apiKey: new TextDecoder().decode(plain), ...(record.endpoint ? { endpoint: record.endpoint } : {}) };
  } catch {
    return undefined;
  }
}

export async function forget(): Promise<void> {
  if (!canRemember()) return;
  try {
    await run("readwrite", (store) => store.delete(SLOT));
  } catch {
    /* nothing stored, or storage blocked: either way there is nothing left to forget */
  }
}
