import { readFileSync, statSync } from "node:fs";

/*
 * A LONG-LIVED STDIO SERVER GOES STALE WITHOUT KNOWING IT. The catalogue is bundled into
 * `dist/index.js` when the server is built, and Node reads that file once, when the client starts
 * the process. Rebuilding the contract afterwards (which happens several times a day here) updates
 * the bundle on disk and the artifact beside it, and changes nothing in the process already
 * serving: an agent kept composing against options that no longer existed, and the only trace was a
 * `sourceHash` on every answer that nobody compared.
 *
 * So the server compares it. When the compiled index on disk carries a different hash from the one
 * this process serves, every answer says so, in a text block of its own so no tool's output schema
 * moves. It only applies where there is a disk to compare with: the local stdio server started from
 * a checkout. The HTTP server is frozen at deploy and has nothing newer beside it.
 *
 * The file is read again only when its modification time changes, so an unchanged catalogue costs a
 * `stat` per call.
 */
export function stalenessCheck(indexPath: string, servedHash: string): () => string | undefined {
  let seenAt = -1;
  let onDisk: string | undefined;
  return () => {
    let mtime: number;
    try {
      mtime = statSync(indexPath).mtimeMs;
    } catch {
      return undefined;
    }
    if (mtime !== seenAt) {
      seenAt = mtime;
      try {
        onDisk = (JSON.parse(readFileSync(indexPath, "utf8")) as { sourceHash?: string }).sourceHash;
      } catch {
        onDisk = undefined;
      }
    }
    if (!onDisk || onDisk === servedHash) return undefined;
    return (
      `STALE CATALOGUE: this server was started with catalogue ${servedHash}, and the one compiled on ` +
      `disk is now ${onDisk}. Options, signatures or constraints may have changed since. Ask the user ` +
      `to restart the skryensya-ui MCP server (in Claude Code: /mcp, then reconnect) before relying ` +
      `on this answer.`
    );
  };
}
