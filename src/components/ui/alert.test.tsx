import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmAlert } from "./alert.js";

afterEach(cleanup);

describe("CmAlert", () => {
  it("renders its title and description", () => {
    render(<CmAlert title="Saved" description="Your changes were saved." />);
    expect(screen.getByRole("heading", { name: "Saved" })).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
  });

  it('uses role="status" for non-urgent tones', () => {
    render(<CmAlert title="Heads up" tone="info" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('uses role="alert" for danger and warning tones', () => {
    const { rerender } = render(<CmAlert title="Boom" tone="danger" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<CmAlert title="Careful" tone="warning" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("dismisses itself and notifies when uncontrolled", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CmAlert
        title="Closable"
        dismissible
        onDismiss={onDismiss}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dispensar alerta" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("heading", { name: "Closable" })).not.toBeInTheDocument();
  });

  it("stays visible when controlled and only notifies", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <CmAlert title="Controlled" dismissible open onOpenChange={onOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Dispensar alerta" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: the consumer owns visibility, so it remains until open changes.
    expect(screen.getByRole("heading", { name: "Controlled" })).toBeInTheDocument();
  });

  it("renders nothing when defaultOpen is false", () => {
    render(<CmAlert title="Hidden" defaultOpen={false} />);
    expect(screen.queryByRole("heading", { name: "Hidden" })).not.toBeInTheDocument();
  });
});
