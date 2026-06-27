import { afterEach, describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmPopover } from "./popover.js";

afterEach(cleanup);

function renderPopover(props: Partial<Parameters<typeof CmPopover>[0]> = {}) {
  return render(
    <CmPopover
      trigger={({ ref, toggle }) => (
        <button ref={ref} onClick={toggle}>
          Open
        </button>
      )}
      {...(props as Parameters<typeof CmPopover>[0])}
    >
      <div style={{ width: 384 }}>Conteúdo</div>
    </CmPopover>,
  );
}

const panel = () => document.querySelector<HTMLElement>(".cm-popover__panel");

describe("CmPopover sizing props", () => {
  it("exposes maxWidth and width as CSS custom properties on the panel", async () => {
    const user = userEvent.setup();
    renderPopover({ width: 320, maxWidth: 400 });
    await user.click(document.querySelector("button")!);

    const el = panel();
    expect(el).not.toBeNull();
    expect(el!.style.getPropertyValue("--cm-popover-width")).toBe("320px");
    expect(el!.style.getPropertyValue("--cm-popover-max-width")).toBe("400px");
  });

  it("accepts string sizes verbatim", async () => {
    const user = userEvent.setup();
    renderPopover({ maxWidth: "30rem" });
    await user.click(document.querySelector("button")!);

    expect(panel()!.style.getPropertyValue("--cm-popover-max-width")).toBe("30rem");
  });

  it("sets no width custom properties when the props are omitted (keeps the 22rem default)", async () => {
    const user = userEvent.setup();
    renderPopover();
    await user.click(document.querySelector("button")!);

    const el = panel();
    expect(el!.style.getPropertyValue("--cm-popover-width")).toBe("");
    expect(el!.style.getPropertyValue("--cm-popover-max-width")).toBe("");
  });
});
