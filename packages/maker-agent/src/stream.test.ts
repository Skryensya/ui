import { describe, expect, it } from "vitest";
import { OperationStream, sseData } from "./stream.js";

const encode = (parts: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
      controller.close();
    },
  });
const collect = async (parts: string[]) => {
  const out: string[] = [];
  for await (const data of sseData(encode(parts), new AbortController().signal)) out.push(data);
  return out;
};

describe("sseData", () => {
  it("yields each event's data, however the bytes were split", async () => {
    expect(await collect(['data: {"a":1}\n\nda', 'ta: {"b":2}\n', "\ndata: [DONE]\n\n"])).toEqual(['{"a":1}', '{"b":2}', "[DONE]"]);
  });
  it("accepts CRLF, ignores comments and event names, and joins multi-line data", async () => {
    expect(await collect([": ping\r\n\r\nevent: x\r\ndata: one\r\ndata: two\r\n\r\n"])).toEqual(["one\ntwo"]);
  });
  it("yields a final event that has no trailing blank line", async () => {
    expect(await collect(["data: last"])).toEqual(["last"]);
  });
});

describe("OperationStream", () => {
  const insert = (n: number, extra = "") => ({ type: "insert", at: { parent: "a", slot: "children", index: n }, tree: { contract: "layout", signature: "Stack", text: `item ${n}${extra}` } });
  const pageDoc = { operations: [{ type: "page", page: "p1", operations: [insert(0), insert(1), insert(2)] }, { type: "addPage", name: "B", path: "/b" }] };
  const doc = JSON.stringify(pageDoc);
  const feed = (text: string, size: number) => {
    const stream = new OperationStream();
    for (let i = 0; i < text.length; i += size) stream.push(text.slice(i, i + size));
    return stream;
  };

  it("emits each inner operation of a page operation as soon as it closes", () => {
    const stream = new OperationStream();
    const cut = doc.indexOf(JSON.stringify(insert(1)));
    expect(stream.push(doc.slice(0, cut))).toBe(true);
    expect(stream.operations()).toEqual([{ type: "page", page: "p1", operations: [insert(0)] }]);
    expect(stream.count()).toBe(1);
    stream.push(doc.slice(cut, cut + 10));
    expect(stream.operations()).toEqual([{ type: "page", page: "p1", operations: [insert(0)] }]);
    stream.push(doc.slice(cut + 10, doc.indexOf(JSON.stringify(insert(2))) + 4));
    expect(stream.count()).toBe(2);
  });

  it("ends with exactly the document's operations, whatever the chunk size", () => {
    for (const size of [1, 2, 5, 17, 64, doc.length]) {
      expect(feed(doc, size).operations()).toEqual(pageDoc.operations);
    }
    expect(feed(doc, 7).count()).toBe(4);
  });

  it("does not invent anything while an operation is half-written", () => {
    const stream = new OperationStream();
    expect(stream.push('{"operations":[{"type":"page","page":"p1","operations":[{"type":"insert","at":{"par')).toBe(false);
    expect(stream.operations()).toEqual([]);
  });

  it("waits to show inner operations until the page is known, and still ends right", () => {
    const text = JSON.stringify({ operations: [{ type: "page", operations: [insert(0), insert(1)], page: "late" }] });
    const stream = new OperationStream();
    stream.push(text.slice(0, text.indexOf('"page":"late"')));
    expect(stream.operations()).toEqual([]);
    stream.push(text.slice(text.indexOf('"page":"late"')));
    expect(stream.operations()).toEqual([{ type: "page", operations: [insert(0), insert(1)], page: "late" }]);
  });

  it("is not fooled by braces, brackets and escaped quotes inside strings", () => {
    const tricky = JSON.stringify({ operations: [{ type: "page", page: "p", operations: [insert(0, 'x"}]{[ \\ end')] }] });
    const stream = feed(tricky, 3);
    expect(stream.operations()).toEqual([{ type: "page", page: "p", operations: [insert(0, 'x"}]{[ \\ end')] }]);
  });

  it("skips a member that is not valid JSON instead of throwing", () => {
    expect(() => new OperationStream().push('{"operations":[{"type": nope},{"type":"x"}]}')).not.toThrow();
    const stream = new OperationStream();
    stream.push('{"operations":[{"type": nope},{"type":"x"}]}');
    expect(stream.operations()).toEqual([{ type: "x" }]);
  });
});
