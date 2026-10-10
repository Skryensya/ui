import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DialogStack, DialogStackBody, DialogStackClose, DialogStackContent, DialogStackDescription, DialogStackNext, DialogStackPrevious, DialogStackTitle, DialogStackTrigger } from "./dialog-stack.js";

function panels() {
  return <DialogStackBody>
    <DialogStackContent><DialogStackTitle>First</DialogStackTitle><DialogStackDescription>Introduction</DialogStackDescription><DialogStackPrevious>Back</DialogStackPrevious><DialogStackNext>Next</DialogStackNext></DialogStackContent>
    <DialogStackContent><DialogStackTitle>Second</DialogStackTitle><DialogStackPrevious>Back</DialogStackPrevious><DialogStackNext>Next</DialogStackNext><DialogStackClose>Done</DialogStackClose></DialogStackContent>
  </DialogStackBody>;
}

describe("DialogStack", () => {
  it("opens one native modal and names it from the active step", () => {
    const ui = render(<DialogStack><DialogStackTrigger>Open</DialogStackTrigger>{panels()}</DialogStack>);
    fireEvent.click(ui.getByRole("button", { name: "Open" }));
    const dialog = ui.getByRole("dialog", { name: "First" });
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.getAttribute("aria-describedby")).toBe(ui.getByText("Introduction").id);
    expect(ui.container.querySelectorAll("dialog")).toHaveLength(1);
  });

  it("bounds navigation, isolates inactive steps and moves focus", () => {
    const step = vi.fn();
    const ui = render(<DialogStack defaultOpen onStepChange={step}>{panels()}</DialogStack>);
    expect((ui.getByRole("button", { name: "Back" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    const items = ui.container.querySelectorAll<HTMLElement>("section");
    expect(items[0].hasAttribute("inert")).toBe(true);
    expect(items[0].getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(items[1]);
    expect(ui.getByRole("dialog", { name: "Second" }).hasAttribute("aria-describedby")).toBe(false);
    expect((ui.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
    expect(step).toHaveBeenCalledWith(1);
    fireEvent.click(ui.getByRole("button", { name: "Back" }));
    expect(ui.getByRole("dialog", { name: "First" })).toBeTruthy();
  });

  it("closes on Escape, restores the trigger and resets when reopened", () => {
    const change = vi.fn();
    const ui = render(<DialogStack onOpenChange={change}><DialogStackTrigger>Open</DialogStackTrigger>{panels()}</DialogStack>);
    const trigger = ui.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    fireEvent(ui.container.querySelector("dialog")!, new Event("cancel", { cancelable: true }));
    expect(ui.container.querySelector("dialog")!.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(change.mock.calls).toEqual([[true], [false]]);
    fireEvent.click(trigger);
    expect(ui.getByRole("dialog", { name: "First" })).toBeTruthy();
  });

  it("supports controlled open without opening before the owner agrees", () => {
    const change = vi.fn();
    const ui = render(<DialogStack open={false} onOpenChange={change}><DialogStackTrigger>Open</DialogStackTrigger>{panels()}</DialogStack>);
    fireEvent.click(ui.getByRole("button", { name: "Open" }));
    expect(change).toHaveBeenCalledWith(true);
    expect(ui.container.querySelector("dialog")!.open).toBe(false);
    ui.rerender(<DialogStack open onOpenChange={change}><DialogStackTrigger>Open</DialogStackTrigger>{panels()}</DialogStack>);
    expect(ui.getByRole("dialog", { name: "First" })).toBeTruthy();
    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    fireEvent.click(ui.getByRole("button", { name: "Done" }));
    expect(change).toHaveBeenCalledWith(false);
    expect(ui.container.querySelector("dialog")!.open).toBe(true);
  });

  it("restores focus when returning to a step without losing its input", () => {
    const ui = render(<DialogStack defaultOpen><DialogStackBody>
      <DialogStackContent><DialogStackTitle>First</DialogStackTitle><input aria-label="Workspace name" /><DialogStackNext>Next</DialogStackNext></DialogStackContent>
      <DialogStackContent><DialogStackTitle>Second</DialogStackTitle><DialogStackPrevious>Back</DialogStackPrevious></DialogStackContent>
    </DialogStackBody></DialogStack>);
    const input = ui.getByRole("textbox", { name: "Workspace name" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Design team" } });
    const next = ui.getByRole("button", { name: "Next" });
    next.focus();
    fireEvent.click(next);
    fireEvent.click(ui.getByRole("button", { name: "Back" }));
    expect(document.activeElement).toBe(next);
    expect(input.value).toBe("Design team");
  });

  it("does not enable an authored disabled navigation control", () => {
    const ui = render(<DialogStack defaultOpen><DialogStackBody>
      <DialogStackContent><DialogStackTitle>First</DialogStackTitle><DialogStackNext disabled>Next</DialogStackNext></DialogStackContent>
      <DialogStackContent><DialogStackTitle>Second</DialogStackTitle></DialogStackContent>
    </DialogStackBody></DialogStack>);
    const next = ui.getByRole("button", { name: "Next" }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(next);
    expect(ui.getByRole("dialog", { name: "First" })).toBeTruthy();
  });

  it("rejects a non-button asChild trigger before it becomes an inaccessible pseudo-button", () => {
    expect(() => render(<DialogStack><DialogStackTrigger asChild><a href="#open">Open</a></DialogStackTrigger>{panels()}</DialogStack>)).toThrow(
      "DialogStack asChild requires one button element",
    );
  });

  it("asChild preserves the button and respects preventDefault", () => {
    const handler = vi.fn(event => event.preventDefault());
    const ui = render(<DialogStack><DialogStackTrigger asChild className="extra"><button className="custom" onClick={handler}>Open</button></DialogStackTrigger>{panels()}</DialogStack>);
    const trigger = ui.getByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    expect(handler).toHaveBeenCalledOnce();
    expect(trigger.classList.contains("custom")).toBe(true);
    expect(trigger.classList.contains("extra")).toBe(true);
    expect(trigger.querySelector("button")).toBeNull();
    expect(ui.container.querySelector("dialog")!.open).toBe(false);
  });
});
