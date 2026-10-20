import { act, fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toastEvents } from "@skryensya/core/content";
import { Toast, ToastRegion, toastQueue, useToastQueue } from "./content.js";

describe("content component contracts", () => {
  it("defaults to a neutral toast and announces danger assertively", () => {
    const plain = render(<Toast>Copied.</Toast>);
    expect(within(plain.container).getByRole("status").getAttribute("data-tone")).toBe("neutral");
    plain.unmount();

    const onDismiss = vi.fn();
    const ui = render(
      <ToastRegion>
        <Toast onDismiss={onDismiss} tone="danger">
          Deployment failed.
        </Toast>
      </ToastRegion>,
    );

    const screen = within(ui.container);
    expect(ui.container.querySelector(".sk-toast-region")?.getAttribute("aria-live")).toBe("polite");
    const toast = screen.getByRole("alert");
    expect(toast.classList.contains("sk-callout")).toBe(true);
    expect(toast.getAttribute("aria-live")).toBe("assertive");
    expect(toast.getAttribute("data-tone")).toBe("danger");
    expect(toast.getAttribute("data-sk-toast")).toBe("");
    expect(toast.querySelector(".sk-callout__description")?.textContent).toBe("Deployment failed.");

    expect(screen.getByRole("button", { name: "Dismiss notification" }).getAttribute("type")).toBe("button");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledWith({ reason: "dismiss" });
  });

  it("dispatches sk:toastdismiss on the host for Vanilla DOM parity", () => {
    const onDismiss = vi.fn();
    const onDom = vi.fn();
    const ui = render(
      <Toast onDismiss={onDismiss} title="Saved">
        Draft stored.
      </Toast>,
    );
    const toast = within(ui.container).getByRole("status");
    toast.addEventListener(toastEvents.dismiss, onDom as EventListener);

    fireEvent.click(within(ui.container).getByRole("button", { name: "Dismiss notification" }));

    expect(onDismiss).toHaveBeenCalledWith({ reason: "dismiss" });
    expect(onDom).toHaveBeenCalledTimes(1);
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ reason: "dismiss" });
    expect(toast.hasAttribute("data-dismissing")).toBe(true);
  });

  it("renders callout anatomy for title, icon and actions", () => {
    const ui = render(
      <Toast actions={<a href="/logs">View logs</a>} icon="!" title="Deploy failed" tone="danger">
        Check the pipeline.
      </Toast>,
    );

    const toast = within(ui.container).getByRole("alert");
    expect(toast.querySelector(".sk-callout__icon")).not.toBeNull();
    expect(toast.querySelector(".sk-callout__title")?.textContent).toBe("Deploy failed");
    expect(toast.querySelector(".sk-callout__actions")?.textContent).toContain("View logs");
  });

  it("writes data-timeout and fires timeout dismiss without requiring onDismiss", () => {
    vi.useFakeTimers();
    const onDom = vi.fn();
    const timed = render(
      <Toast timeout={1_000}>
        Saved.
      </Toast>,
    );
    const toast = within(timed.container).getByRole("status");
    expect(toast.getAttribute("data-timeout")).toBe("1000");
    toast.addEventListener(toastEvents.dismiss, onDom as EventListener);

    vi.advanceTimersByTime(1_000);
    expect(onDom).toHaveBeenCalledTimes(1);
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ reason: "timeout" });

    timed.unmount();
    vi.useRealTimers();
  });

  it("requests timeout dismissal only when configured and clears it on unmount", () => {
    vi.useFakeTimers();
    const withoutTimeout = vi.fn();
    const withTimeout = vi.fn();
    const persistent = render(<Toast onDismiss={withoutTimeout}>Saved.</Toast>);
    const timed = render(
      <Toast onDismiss={withTimeout} timeout={1_000}>
        Saved.
      </Toast>,
    );

    vi.advanceTimersByTime(1_000);
    expect(withoutTimeout).not.toHaveBeenCalled();
    expect(withTimeout).toHaveBeenCalledWith({ reason: "timeout" });

    const afterUnmount = vi.fn();
    const cleanup = render(
      <Toast onDismiss={afterUnmount} timeout={1_000}>
        Saved.
      </Toast>,
    );
    cleanup.unmount();
    vi.advanceTimersByTime(1_000);
    expect(afterUnmount).not.toHaveBeenCalled();

    const manuallyDismissed = vi.fn();
    const manual = render(
      <Toast onDismiss={manuallyDismissed} timeout={1_000}>
        Saved.
      </Toast>,
    );
    fireEvent.click(within(manual.container).getByRole("button", { name: "Dismiss notification" }));
    vi.advanceTimersByTime(1_000);
    expect(manuallyDismissed).toHaveBeenCalledTimes(1);
    expect(manuallyDismissed).toHaveBeenCalledWith({ reason: "dismiss" });
    manual.unmount();

    persistent.unmount();
    timed.unmount();
    vi.useRealTimers();
  });
});

describe("toastQueue / useToastQueue", () => {
  function Toaster() {
    const { toasts, remove } = useToastQueue();
    return (
      <ToastRegion>
        {toasts.map((item) => (
          <Toast key={item.id} {...item} onDismiss={() => remove(item.id)} />
        ))}
      </ToastRegion>
    );
  }

  it("shows, updates and dismisses a toast from outside any component", () => {
    const ui = render(<Toaster />);
    let id = "";
    act(() => {
      id = toastQueue.show({ children: "Uploading…" });
    });
    expect(ui.getByText("Uploading…")).toBeTruthy();

    act(() => {
      toastQueue.update(id, { children: "Uploaded." });
    });
    expect(ui.getByText("Uploaded.")).toBeTruthy();

    act(() => {
      toastQueue.dismiss(id);
    });
    expect(ui.queryByText("Uploaded.")).toBeNull();
  });

  it("removes a toast when its own dismiss button is clicked, through the hook's remove", () => {
    const ui = render(<Toaster />);
    act(() => {
      toastQueue.show({ children: "Saved.", dismissible: true });
    });
    const toast = ui.getByText("Saved.").closest("[data-sk-toast]")!;
    fireEvent.click(within(toast as HTMLElement).getByRole("button", { name: "Dismiss notification" }));
    expect(ui.queryByText("Saved.")).toBeNull();
  });
});
