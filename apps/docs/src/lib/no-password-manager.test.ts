// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { hardenInputs, hardenInputsInHtml } from "./no-password-manager";

describe("password manager opt-out", () => {
  it("marks fields in markup once and leaves other elements alone", () => {
    const html = hardenInputsInHtml('<input type="password"><textarea></textarea><input data-1p-ignore><div></div>');
    expect(html.match(/data-1p-ignore/g)).toHaveLength(3);
    expect(html).toContain("data-bwignore=\"true\"");
    expect(html).toContain("<div></div>");
  });

  it("marks live and later-added fields, keeping a stated autocomplete", async () => {
    document.body.innerHTML = '<input id="a" type="password" autocomplete="current-password"><input id="b">';
    hardenInputs(document);
    const a = document.getElementById("a")!;
    expect([a.getAttribute("autocomplete"), a.hasAttribute("data-1p-ignore"), document.getElementById("b")!.getAttribute("autocomplete")]).toEqual(["current-password", true, "off"]);
    document.body.insertAdjacentHTML("beforeend", '<input id="c">');
    await Promise.resolve();
    expect(document.getElementById("c")!.hasAttribute("data-lpignore")).toBe(true);
  });
});
