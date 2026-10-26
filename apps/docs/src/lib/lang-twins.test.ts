import { describe, expect, it } from "vitest";
import { buildLangTwins } from "../pages/lang-twins.nginx.conf";

describe("lang-twins.nginx.conf", () => {
  const conf = buildLangTwins();

  it("maps each unprefixed page to its Spanish twin, slash or not", () => {
    expect(conf).toContain('  "/architecture" "/es/arquitectura";');
    expect(conf).toContain('  "/architecture/" "/es/arquitectura";');
    expect(conf).toContain('  "/components/listbox" "/es/componentes/listbox";');
    expect(conf).toMatch(/^ {2}"\/" "\/es";$/m);
  });

  it("maps each Spanish page back to its English twin", () => {
    expect(conf).toContain('  "/es/arquitectura" "/architecture";');
    expect(conf).toContain('  "/es/componentes/listbox/" "/components/listbox";');
  });

  it("is two nginx map blocks with an empty default", () => {
    expect(conf.match(/^map \$uri \$sk_twin_(es|en) \{\n {2}default "";$/gm)).toHaveLength(2);
  });
});
