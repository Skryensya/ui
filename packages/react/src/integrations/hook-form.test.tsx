import { zodResolver } from "@hookform/resolvers/zod";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Input } from "../components/input.js";
import { SegmentedControl } from "../components/segmented.js";
import { Checkbox, Switch } from "../components/selection.js";
import { ControlledField, Form } from "./hook-form.js";

const schema = z.object({
  email: z.string().min(1, "Enter your email.").email("Enter a valid email."),
  plan: z.string(),
  terms: z.boolean().refine((accepted) => accepted, "Accept the terms to continue."),
  news: z.boolean(),
});
type Values = z.infer<typeof schema>;

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

function Signup({ onSubmit = () => {}, onInvalid }: { onSubmit?: (values: Values) => void; onInvalid?: () => void }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", plan: "free", terms: false, news: false },
  });
  return (
    <Form form={form} onInvalid={onInvalid} onSubmit={onSubmit}>
      <ControlledField hint="We only use it for receipts." label="Email" name="email" required>
        {({ bind }) => <Input type="email" {...bind.input()} />}
      </ControlledField>
      <ControlledField label="Plan" name="plan">
        {({ bind }) => {
          const { value, onValueChange } = bind.value<string>();
          return <SegmentedControl label="Plan" onValueChange={onValueChange} options={options} value={value} />;
        }}
      </ControlledField>
      <ControlledField label="Terms" name="terms">
        {({ bind }) => <Checkbox {...bind.checked()}>I accept</Checkbox>}
      </ControlledField>
      <ControlledField label="Newsletter" name="news">
        {({ bind }) => <Switch {...bind.checked()} />}
      </ControlledField>
      <button type="submit">Create account</button>
    </Form>
  );
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Create account" }));
const email = () => screen.getByRole("textbox", { name: /Email/ }) as HTMLInputElement;

describe("ControlledField, errors from the schema", () => {
  it("prints the schema's message under the field and marks the control invalid", async () => {
    render(<Signup />);
    submit();

    expect(await screen.findByText("Enter your email.")).toBeTruthy();
    expect(email().getAttribute("aria-invalid")).toBe("true");

    const describedBy = email().getAttribute("aria-describedby")?.split(" ") ?? [];
    const texts = describedBy.map((id) => document.getElementById(id)?.textContent);
    expect(texts).toContain("Enter your email.");
    expect(texts).toContain("We only use it for receipts.");
  });

  it("does not submit while a field is invalid, and says why through onInvalid", async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(<Signup onInvalid={onInvalid} onSubmit={onSubmit} />);
    submit();

    await waitFor(() => expect(onInvalid).toHaveBeenCalledTimes(1));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Accept the terms to continue.")).toBeTruthy();
  });

  it("moves focus to the first invalid field, which is what a keyboard user needs next", async () => {
    render(<Signup />);
    submit();
    await screen.findByText("Enter your email.");
    expect(document.activeElement).toBe(email());
  });

  it("clears the message once the value is corrected", async () => {
    render(<Signup />);
    submit();
    await screen.findByText("Enter your email.");

    fireEvent.change(email(), { target: { value: "ada@example.com" } });
    await waitFor(() => expect(screen.queryByText("Enter your email.")).toBeNull());
    expect(email().getAttribute("aria-invalid")).toBeNull();
  });

  it("draws the required marker from the `required` prop", () => {
    render(<Signup />);
    expect(within(email().closest(".sk-form-field") as HTMLElement).getByText("*")).toBeTruthy();
  });
});

describe("ControlledField, bindings", () => {
  it("submits what each control reported: a string, a segmented value and two booleans", async () => {
    const onSubmit = vi.fn();
    render(<Signup onSubmit={onSubmit} />);

    fireEvent.change(email(), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept/ }));
    fireEvent.click(screen.getByRole("switch"));
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toEqual({ email: "ada@example.com", plan: "pro", terms: true, news: true });
  });

  it("reads an unset input as empty instead of switching it from uncontrolled to controlled", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    function Unset() {
      const form = useForm<{ name?: string }>();
      return (
        <ControlledField control={form.control} label="Name" name="name">
          {({ bind }) => <Input {...bind.input()} />}
        </ControlledField>
      );
    }
    render(<Unset />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/uncontrolled|controlled/);
    warn.mockRestore();
  });

  it("unwraps both shapes of onValueChange: Zag's { value } and a bare value", async () => {
    let report: ((change: unknown) => void) | undefined;
    function Probe() {
      const form = useForm<{ pick: unknown }>({ defaultValues: { pick: "a" } });
      return (
        <ControlledField control={form.control} label="Pick" name="pick">
          {({ bind, field }) => {
            report = bind.value().onValueChange as (change: unknown) => void;
            return <output data-testid="out">{JSON.stringify(field.value)}</output>;
          }}
        </ControlledField>
      );
    }
    render(<Probe />);
    await act(async () => report!({ value: ["x", "y"] }));
    expect(screen.getByTestId("out").textContent).toBe('["x","y"]');
    await act(async () => report!("z"));
    expect(screen.getByTestId("out").textContent).toBe('"z"');
    await act(async () => report!(7));
    expect(screen.getByTestId("out").textContent).toBe("7");
  });

  it("works without a Form when given a control", () => {
    function Alone() {
      const form = useForm<{ name: string }>({ defaultValues: { name: "Ada" } });
      return (
        <ControlledField control={form.control} label="Name" name="name">
          {({ bind }) => <Input {...bind.input()} />}
        </ControlledField>
      );
    }
    render(<Alone />);
    expect((screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value).toBe("Ada");
  });
});

describe("Form", () => {
  it("turns the browser's own validation off, so only one validator speaks", () => {
    const ui = render(<Signup />);
    expect(ui.container.querySelector("form")?.hasAttribute("novalidate")).toBe(true);
  });

  it("has no axe violations while every field shows an error", async () => {
    const ui = render(<Signup />);
    submit();
    await screen.findByText("Enter your email.");
    const results = await axe.run(ui.container);
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
  });
});
