import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@iconify/react", () => ({
  Icon: ({ icon, ...props }: { icon: string } & React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon" data-icon={icon} {...props} />
  ),
}));

import { CmButton } from "./button.js";
import { CmIcon } from "./icon.js";

describe("CmIcon", () => {
  it("uses the contextual default size when size is omitted", () => {
    render(
      <CmButton size="xs">
        <CmIcon name="lucide:sparkles" />
      </CmButton>,
    );

    const icon = screen.getByTestId("icon");
    expect(icon).toHaveClass("cm-icon--default-size");
    expect(icon).not.toHaveAttribute("width");
    expect(icon).not.toHaveAttribute("height");
  });

  it("preserves an explicit size override", () => {
    render(<CmIcon name="lucide:sparkles" size={12} />);

    const icon = screen.getByTestId("icon");
    expect(icon).not.toHaveClass("cm-icon--default-size");
    expect(icon).toHaveAttribute("width", "12");
    expect(icon).toHaveAttribute("height", "12");
  });

  it("renders bundled navigation icons without Iconify requests and preserves their accessible label", () => {
    render(<CmIcon name="lucide:library" title="Biblioteca" size={18} />);
    const icon = screen.getByRole("img", { name: "Biblioteca" });
    expect(icon).toHaveClass("lucide-library", "cm-icon");
    expect(icon).toHaveAttribute("width", "18");
    expect(icon.querySelector("path")).not.toBeNull();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });
});
