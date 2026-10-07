/* The saved connection: entered once in the Connection view, read by every capture. */
export type Connection = { server: string; studio: string; token: string };

const keys = ["server", "studio", "token"] as const;

export function parseConnection(input: Partial<Record<string, unknown>>): Connection {
  const [server, studio, token] = keys.map((key) => String(input[key] ?? "").trim());
  for (const [label, value] of [
    ["Reference Server", server],
    ["Reference Studio", studio],
  ] as const) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${label} needs a full URL, like http://localhost:4318`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new Error(`${label} must use http or https`);
  }
  if (!token) throw new Error("Access token is required");
  return { server: server.replace(/\/+$/, ""), studio, token };
}

/* null when nothing usable is saved, so the popup opens on the Connection view. */
export function storedConnection(stored: Partial<Record<string, unknown>>): Connection | null {
  try {
    return parseConnection(stored);
  } catch {
    return null;
  }
}

export const serverPermission = (connection: Connection) => ({
  origins: [`${new URL(connection.server).origin}/*`],
});

export const describeConnection = (connection: Connection) =>
  `Connected to ${new URL(connection.server).host}`;
