import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dock, DockItem } from "./dock.js";

const SearchIcon = () => <svg data-testid="search-art" />;

describe("Dock", () => {
  it("renders named native actions and decorative artwork from items", () => {
    render(<Dock label="Quick actions" items={[{ id: 1, label: "Search", Icon: SearchIcon }]} />);
    expect(screen.getByRole("group", { name: "Quick actions" }).className).toBe("sk-dock");
    const button = screen.getByRole("button", { name: "Search" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.querySelector(".sk-dock__icon")?.getAttribute("aria-hidden")).toBe("true");
    expect(button.hasAttribute("tabindex")).toBe(false);
  });

  it("calls actions without submitting an enclosing form", () => {
    const action = vi.fn();
    const submit = vi.fn();
    render(<form onSubmit={submit}><Dock label="Actions" items={[{ id: "search", label: "Search", Icon: SearchIcon, onClick: action }]} /></form>);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(action).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it("preserves native disabled behavior", () => {
    const action = vi.fn();
    render(<Dock label="Actions" items={[{ id: 1, label: "Search", Icon: SearchIcon, disabled: true, onClick: action }]} />);
    const button = screen.getByRole("button", { name: "Search" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(action).not.toHaveBeenCalled();
  });

  it("supports composed children and forwards host attributes", () => {
    render(<Dock label="Actions" id="actions" className="custom"><DockItem label="Search" id="search" className="mine"><SearchIcon /></DockItem></Dock>);
    expect(screen.getByRole("group").className).toBe("sk-dock custom");
    expect(screen.getByRole("group").id).toBe("actions");
    expect(screen.getByRole("button").className).toBe("sk-dock__item sk-interactive mine");
    expect(screen.getByRole("button").id).toBe("search");
  });
});
