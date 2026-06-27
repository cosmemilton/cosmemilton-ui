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
});
