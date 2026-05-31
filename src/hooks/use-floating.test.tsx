import { afterEach, describe, expect, it } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";

import { useFloating } from "./use-floating.js";

afterEach(cleanup);

function Floater({ matchWidth = false }: { matchWidth?: boolean }) {
  const reference = useRef<HTMLButtonElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  useFloating(reference, floating, { matchWidth });
  return (
    <>
      <button ref={reference}>anchor</button>
      <div ref={floating} data-testid="panel">
        content
      </div>
    </>
  );
}

function DelayedFloater() {
  const [showPanel, setShowPanel] = useState(false);
  const reference = useRef<HTMLButtonElement>(null);
  const floating = useRef<HTMLDivElement>(null);

  useFloating(reference, floating);

  useEffect(() => {
    setShowPanel(true);
  }, []);

  return (
    <>
      <button ref={reference}>anchor</button>
      {showPanel ? (
        <div ref={floating} data-testid="panel">
          content
        </div>
      ) : null}
    </>
  );
}

describe("useFloating", () => {
  it("applies a fixed positioning strategy to the floating element", async () => {
    const { getByTestId } = render(<Floater />);
    const panel = getByTestId("panel");
    await waitFor(() => {
      expect(panel.style.position).toBe("fixed");
      expect(panel.style.top).not.toBe("");
      expect(panel.style.left).not.toBe("");
    });
  });

  it("does not throw and mounts cleanly when matchWidth is enabled", async () => {
    const { getByTestId } = render(<Floater matchWidth />);
    const panel = getByTestId("panel");
    await waitFor(() => {
      expect(panel.style.position).toBe("fixed");
    });
  });

  it("positions a floating element that appears after the first effect pass", async () => {
    const { getByTestId } = render(<DelayedFloater />);
    const panel = getByTestId("panel");

    await waitFor(() => {
      expect(panel.style.position).toBe("fixed");
      expect(panel.style.top).not.toBe("");
      expect(panel.style.left).not.toBe("");
    });
  });
});
