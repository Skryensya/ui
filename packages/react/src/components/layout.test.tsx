import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell, Box, Footer, Grid, Hero, Inline, LayoutGrid, Main, Stack, Wrapper } from "./layout.js";

describe("layout primitives", () => {
  it("keeps semantic ownership with the caller while applying Box defaults", () => {
    const ui = render(
      <Box as="section" aria-label="Summary" border="subtle" padding="lg" surface="raised">
        Summary
      </Box>,
    );

    const box = ui.getByRole("region", { name: "Summary" });
    expect(box.classList).toContain("sk-box");
    expect(box.getAttribute("data-surface")).toBe("raised");
    expect(box.getAttribute("data-border")).toBe("subtle");
    expect(box.getAttribute("data-padding")).toBe("lg");
  });

  it("serializes Box appearance, plain by default, like its other options", () => {
    const ui = render(
      <>
        <Box padding="md">Plain</Box>
        <Box appearance="brutalist" surface="surface">Brutalist</Box>
        <Box appearance="frosted" surface="raised">Frosted</Box>
      </>,
    );

    expect(ui.getByText("Plain").getAttribute("data-appearance")).toBe("plain");
    expect(ui.getByText("Brutalist").getAttribute("data-appearance")).toBe("brutalist");
    expect(ui.getByText("Frosted").getAttribute("data-appearance")).toBe("frosted");
    expect(ui.getByText("Frosted").getAttribute("data-surface")).toBe("raised");
  });

  it("serializes Hero's appearance, plain by default", () => {
    const ui = render(
      <>
        <Hero>Plain</Hero>
        <Hero appearance="frosted" surface="raised">Frosted</Hero>
      </>,
    );
    expect(ui.getByText("Plain").getAttribute("data-appearance")).toBe("plain");
    expect(ui.getByText("Frosted").getAttribute("data-appearance")).toBe("frosted");
  });

  it("serializes Footer's appearance, plain by default", () => {
    const ui = render(
      <>
        <Footer as="div">Plain</Footer>
        <Footer as="div" appearance="brutalist">Brutalist</Footer>
      </>,
    );
    expect(ui.getByText("Plain").getAttribute("data-appearance")).toBe("plain");
    expect(ui.getByText("Brutalist").getAttribute("data-appearance")).toBe("brutalist");
  });

  it("renders Stack, Inline and Grid as the documented layout contracts", () => {
    const ui = render(
      <>
        <Stack as="ul" align="stretch" gap="lg"><li>One</li></Stack>
        <Inline align="baseline" blockStart="auto" equal gap="sm" justify="between" wrap={false}>Inline</Inline>
        <Grid columns={3} gap="xs" multicol>Grid</Grid>
      </>,
    );

    expect(ui.container.querySelector("ul.sk-stack")?.getAttribute("data-gap")).toBe("lg");
    expect(ui.container.querySelector(".sk-inline")?.getAttribute("data-wrap")).toBe("false");
    expect(ui.container.querySelector(".sk-inline")?.getAttribute("data-justify")).toBe("between");
    expect(ui.container.querySelector(".sk-inline")?.hasAttribute("data-equal")).toBe(true);
    expect(ui.container.querySelector(".sk-grid")?.getAttribute("data-columns")).toBe("3");
    expect(ui.container.querySelector(".sk-grid")?.hasAttribute("data-multicol")).toBe(true);
  });

  it("writes data-block-start=none for Inline's default, as the emitted markup does", () => {
    const ui = render(<Inline>Inline</Inline>);

    expect(ui.container.querySelector(".sk-inline")?.getAttribute("data-block-start")).toBe("none");
  });

  it("switches Grid into responsive rows and lets a child request a wider span", () => {
    const ui = render(
      <Grid columns={3} gap="sm" responsive>
        <div data-span="2">Featured</div>
        <div>Plain</div>
      </Grid>,
    );

    const grid = ui.container.querySelector(".sk-grid");
    expect(grid?.hasAttribute("data-responsive")).toBe(true);
    expect(grid?.hasAttribute("data-multicol")).toBe(false);
    expect(grid?.querySelector("[data-span='2']")?.textContent).toBe("Featured");
  });

  it("writes the block-axis justify and the one-sided show a Stack declares", () => {
    const ui = render(
      <Stack justify="center" show="expanded">
        <div>A</div>
      </Stack>,
    );

    const stack = ui.container.querySelector(".sk-stack");
    expect(stack?.getAttribute("data-justify")).toBe("center");
    expect(stack?.getAttribute("data-show")).toBe("expanded");
  });

  it("leaves a Stack with no justify free of data-justify, so it never claims height", () => {
    const ui = render(<Stack>A</Stack>);

    expect(ui.container.querySelector(".sk-stack")?.hasAttribute("data-justify")).toBe(false);
  });

  it("writes AppShell's scroll and sticky header, and nothing for the defaults", () => {
    const ui = render(
      <>
        <AppShell scroll="regions" stickyHeader data-testid="app">
          <Main />
        </AppShell>
        <AppShell data-testid="page">
          <Main />
        </AppShell>
      </>,
    );

    expect(ui.getByTestId("app").getAttribute("data-scroll")).toBe("regions");
    expect(ui.getByTestId("app").hasAttribute("data-sticky-header")).toBe(true);
    expect(ui.getByTestId("page").hasAttribute("data-scroll")).toBe(false);
    expect(ui.getByTestId("page").hasAttribute("data-sticky-header")).toBe(false);
  });

  it("renders LayoutGrid while leaving width on its semantic children", () => {
    const ui = render(
      <LayoutGrid as="main" className="document">
        <p data-width="narrow">Summary</p>
        <section data-width="full-width">Hero</section>
        <nav data-width="rail-start">Index</nav>
        <aside data-width="rail">Toc</aside>
      </LayoutGrid>,
    );

    const grid = ui.container.querySelector("main.sk-layout-grid.document");
    expect(grid).not.toBeNull();
    expect(grid?.querySelector("p")?.getAttribute("data-width")).toBe("narrow");
    expect(grid?.querySelector("section")?.getAttribute("data-width")).toBe("full-width");
    expect(grid?.querySelector("nav")?.getAttribute("data-width")).toBe("rail-start");
    expect(grid?.querySelector("aside")?.getAttribute("data-width")).toBe("rail");
  });

  it("renders Main as an empty application landmark", () => {
    const ui = render(<Main aria-label="Workspace" />);

    expect(ui.getByRole("main", { name: "Workspace" }).childElementCount).toBe(0);
  });

  it("renders Main with its part and the block inset it declares", () => {
    const ui = render(<Main aria-label="Workspace" paddingBlock="lg" paddingBlockExpanded="section" />);

    const main = ui.getByRole("main", { name: "Workspace" });
    expect(main.classList.contains("sk-main")).toBe(true);
    expect(main.getAttribute("data-padding-block")).toBe("lg");
    expect(main.getAttribute("data-padding-block-expanded")).toBe("section");
  });

  it("renders Wrapper as a page column on the size scale", () => {
    const ui = render(
      <Wrapper as="main" size="lg">
        Document
      </Wrapper>,
    );

    const wrapper = ui.container.querySelector("main.sk-wrapper");
    expect(wrapper?.getAttribute("data-size")).toBe("lg");
  });

  it("writes Wrapper's default md size and keeps the caller's class", () => {
    const ui = render(<Wrapper className="page">Document</Wrapper>);

    const wrapper = ui.container.querySelector("div.sk-wrapper.page");
    expect(wrapper?.getAttribute("data-size")).toBe("md");
  });

  it("renders Footer as a contentinfo landmark with its documented defaults", () => {
    const ui = render(<Footer aria-label="Site footer">Footer content</Footer>);

    const footer = ui.getByRole("contentinfo", { name: "Site footer" });
    expect(footer.classList).toContain("sk-footer");
    expect(footer.getAttribute("data-padding")).toBe("lg");
    expect(footer.getAttribute("data-surface")).toBe("sunken");
    expect(footer.getAttribute("data-divider")).toBe("");
  });

  it("lets Footer opt out of the divider, change padding/surface, and drop the landmark via `as`", () => {
    const ui = render(
      <Footer as="div" divider={false} padding="sm" surface="raised" data-testid="nested-footer">
        Nested footer
      </Footer>,
    );

    const footer = ui.getByTestId("nested-footer");
    expect(footer.tagName).toBe("DIV");
    expect(footer.getAttribute("data-divider")).toBe("false");
    expect(footer.getAttribute("data-padding")).toBe("sm");
    expect(footer.getAttribute("data-surface")).toBe("raised");
  });

  it("renders Hero as a plain div with its documented defaults", () => {
    const ui = render(<Hero data-testid="hero">Opening pitch</Hero>);

    const hero = ui.getByTestId("hero");
    expect(hero.tagName).toBe("DIV");
    expect(hero.classList).toContain("sk-hero");
    expect(hero.getAttribute("data-align")).toBe("start");
    expect(hero.getAttribute("data-padding")).toBe("xl");
    expect(hero.getAttribute("data-surface")).toBe("surface");
  });

  it("lets Hero change align/padding/surface and render as a different element via `as`", () => {
    const ui = render(
      <Hero as="section" align="center" padding="lg" surface="sunken" aria-label="Pitch">
        Opening pitch
      </Hero>,
    );

    const hero = ui.getByRole("region", { name: "Pitch" });
    expect(hero.tagName).toBe("SECTION");
    expect(hero.getAttribute("data-align")).toBe("center");
    expect(hero.getAttribute("data-padding")).toBe("lg");
    expect(hero.getAttribute("data-surface")).toBe("sunken");
  });

  /*
   * DECISION 30: the expanded side of a spacing choice is declared, never inferred. Each `*Expanded`
   * prop lands on its own `data-*-expanded` attribute, and leaving it off writes nothing, so the plain
   * value holds at every width exactly as it did before the prop existed.
   */
  it("writes each declared expanded spacing beside its compact value", () => {
    const ui = render(
      <>
        <Box padding="md" paddingExpanded="xl">Card</Box>
        <Stack gap="md" gapExpanded="xl">Stack</Stack>
        <Inline gap="sm" gapExpanded="lg">Inline</Inline>
        <Grid gap="sm" gapExpanded="lg">Grid</Grid>
        <Hero padding="md" paddingExpanded="xl">Pitch</Hero>
        <Footer padding="md" paddingExpanded="lg">Footer</Footer>
        <Wrapper gutter="md" gutterExpanded="lg">Column</Wrapper>
      </>,
    );

    const attrs = (selector: string, name: string) => {
      const el = ui.container.querySelector(selector);
      return [el?.getAttribute(`data-${name}`), el?.getAttribute(`data-${name}-expanded`)];
    };
    expect(attrs(".sk-box", "padding")).toEqual(["md", "xl"]);
    expect(attrs(".sk-stack", "gap")).toEqual(["md", "xl"]);
    expect(attrs(".sk-inline", "gap")).toEqual(["sm", "lg"]);
    expect(attrs(".sk-grid", "gap")).toEqual(["sm", "lg"]);
    expect(attrs(".sk-hero", "padding")).toEqual(["md", "xl"]);
    expect(attrs(".sk-footer", "padding")).toEqual(["md", "lg"]);
    expect(attrs(".sk-wrapper", "gutter")).toEqual(["md", "lg"]);
  });

  it("writes no expanded attribute, and no Wrapper gutter, when none was declared", () => {
    const ui = render(
      <>
        <Box padding="lg">Card</Box>
        <Stack>Stack</Stack>
        <Wrapper>Column</Wrapper>
      </>,
    );

    expect(ui.container.querySelector(".sk-box")?.hasAttribute("data-padding-expanded")).toBe(false);
    expect(ui.container.querySelector(".sk-stack")?.hasAttribute("data-gap-expanded")).toBe(false);
    expect(ui.container.querySelector(".sk-wrapper")?.hasAttribute("data-gutter")).toBe(false);
    expect(ui.container.querySelector(".sk-wrapper")?.hasAttribute("data-gutter-expanded")).toBe(false);
  });

  /* DECISION 31: the sizing the Maker exposes is the contract's, written only when declared. */
  it("writes Box measure and Grid minColumn only when declared", () => {
    const ui = render(
      <>
        <Box measure="sm">Measured</Box>
        <Grid minColumn="md">Auto-fit</Grid>
        <Box padding="md">Plain</Box>
        <Grid columns={2}>Fixed</Grid>
      </>,
    );
    const [measured, plain] = ui.container.querySelectorAll(".sk-box");
    const [autoFit, fixed] = ui.container.querySelectorAll(".sk-grid");

    expect(measured?.getAttribute("data-measure")).toBe("sm");
    expect(plain?.hasAttribute("data-measure")).toBe(false);
    expect(autoFit?.getAttribute("data-min-column")).toBe("md");
    expect(fixed?.hasAttribute("data-min-column")).toBe(false);
  });

  it("serializes Box radius only when asked, so an absent one keeps the surface radius", () => {
    const ui = render(
      <>
        <Box padding="md">Default</Box>
        <Box padding="md" radius="none">Band</Box>
      </>,
    );
    const [plain, band] = ui.container.querySelectorAll(".sk-box");
    expect(plain?.hasAttribute("data-radius")).toBe(false);
    expect(band?.getAttribute("data-radius")).toBe("none");
  });

  it("renders the AppShell as the shell class, with no options, keeping the caller's own props", () => {
    const ui = render(
      <AppShell className="mine" data-testid="shell">
        <header>Bar</header>
        <Main>Work</Main>
      </AppShell>,
    );
    const shell = ui.getByTestId("shell");
    expect(shell.classList).toContain("sk-app-shell");
    expect(shell.classList).toContain("mine");
    expect(shell.querySelector("main")).not.toBeNull();
  });
});
