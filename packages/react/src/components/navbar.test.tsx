import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavList, NavListGroup, NavListLink } from "./nav-list.js";
import { Navbar, NavbarActions, NavbarBrand } from "./navbar.js";

describe("Navbar", () => {
  it("serializes its appearance on the bar, plain by default", () => {
    const plain = render(<Navbar>Plain</Navbar>);
    expect(plain.container.querySelector("header")?.getAttribute("data-appearance")).toBe("plain");
    const frosted = render(<Navbar appearance="frosted">Frosted</Navbar>);
    expect(frosted.container.querySelector("header")?.getAttribute("data-appearance")).toBe("frosted");
  });

  it("uses a header landmark while leaving navigation to its NavList child", () => {
    const ui = render(
      <Navbar data-testid="app-navbar">
        <NavbarBrand>Skryensya</NavbarBrand>
        <NavList aria-label="Main navigation" orientation="horizontal">
          <NavListGroup>
            <NavListLink href="/overview">Overview</NavListLink>
          </NavListGroup>
        </NavList>
        <NavbarActions><button type="button">Sign out</button></NavbarActions>
      </Navbar>,
    );

    const header = ui.getByRole("banner");
    expect(header).toBe(ui.getByTestId("app-navbar"));
    expect(ui.getByText("Skryensya").parentElement).toBe(header);
    expect(ui.getByRole("navigation", { name: "Main navigation" }).parentElement).toBe(header);
    expect(ui.getByRole("button", { name: "Sign out" }).parentElement?.parentElement).toBe(header);
  });
});
