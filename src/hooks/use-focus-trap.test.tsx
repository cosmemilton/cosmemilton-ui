import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { useFocusTrap } from "./use-focus-trap.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function Trap({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { enabled });
  return (
    <div ref={ref} tabIndex={-1}>
      <button>first</button>
      <button>last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable element on mount", () => {
    const { getByText } = render(<Trap />);
    expect(document.activeElement).toBe(getByText("first"));
  });

  it("wraps focus from the last element back to the first on Tab", async () => {
    const user = userEvent.setup();
    const { getByText } = render(<Trap />);
    getByText("last").focus();
    await user.tab();
    expect(document.activeElement).toBe(getByText("first"));
  });

  it("wraps backwards from the first element to the last on Shift+Tab", async () => {
    const user = userEvent.setup();
    const { getByText } = render(<Trap />);
    getByText("first").focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getByText("last"));
  });

  it("restores focus to the trigger on unmount", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(<Trap />);
    unmount();
    expect(document.activeElement).toBe(trigger);
  });
});
