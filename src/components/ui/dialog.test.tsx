import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmDialog } from "./dialog.js";
import { CmThemeProvider } from "../theme/theme-provider.js";

function renderDialog(props: Partial<Parameters<typeof CmDialog>[0]> = {}) {
  return render(
    <CmThemeProvider>
      <CmDialog open onClose={() => {}} title="Confirm" description="Are you sure?" {...props}>
        <button>Inside action</button>
      </CmDialog>
    </CmThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("CmDialog", () => {
  it("renders an accessible dialog with its title and description", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Confirm" })).toBeInTheDocument();
  });

  it("locks body scroll while open and restores it when closed", () => {
    const { rerender } = renderDialog();
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <CmThemeProvider>
        <CmDialog open={false} onClose={() => {}} title="Confirm" />
      </CmThemeProvider>,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when not dismissible", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose, dismissible: false });
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("moves focus into the dialog when opened", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
