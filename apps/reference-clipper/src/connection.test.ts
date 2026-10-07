import { describe, expect, it } from "vitest";
import { describeConnection, parseConnection, serverPermission, storedConnection } from "./connection";

const valid = { server: " http://localhost:4318/ ", studio: "http://localhost:5174", token: "secret" };

describe("parseConnection", () => {
  it("trims values and drops the server's trailing slash", () => {
    expect(parseConnection(valid)).toEqual({
      server: "http://localhost:4318",
      studio: "http://localhost:5174",
      token: "secret",
    });
  });
  it("rejects a value that is not a URL", () => {
    expect(() => parseConnection({ ...valid, server: "localhost" })).toThrow("Reference Server needs a full URL");
  });
  it("rejects protocols other than http(s)", () => {
    expect(() => parseConnection({ ...valid, studio: "ftp://example.com" })).toThrow("Reference Studio must use http or https");
  });
  it("requires a token", () => {
    expect(() => parseConnection({ ...valid, token: "  " })).toThrow("Access token is required");
  });
});

describe("storedConnection", () => {
  it("is null until a complete connection is saved", () => {
    expect(storedConnection({})).toBeNull();
    expect(storedConnection({ ...valid, token: undefined })).toBeNull();
    expect(storedConnection(valid)?.server).toBe("http://localhost:4318");
  });
});

it("asks for the server origin and names its host", () => {
  const connection = parseConnection({ ...valid, server: "https://refs.example.com/api" });
  expect(serverPermission(connection)).toEqual({ origins: ["https://refs.example.com/*"] });
  expect(describeConnection(connection)).toBe("Connected to refs.example.com");
});
