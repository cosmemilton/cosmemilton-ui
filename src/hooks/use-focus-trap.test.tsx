import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { useFocusTrap } from "./use-focus-trap.js";
import { CmPortal } from "../components/ui/portal.js";

afterEach(() => {
  cleanup();
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

function PortalTrap() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return (
    <CmPortal>
      <div ref={ref} tabIndex={-1}>
        <button>portal first</button>
        <button>portal last</button>
      </div>
    </CmPortal>
  );
}

function HiddenTrap() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return (
    <div ref={ref} tabIndex={-1}>
      <button tabIndex={-1}>programmatic</button>
      <button>visible first</button>
      <button>visible last</button>
      <div aria-hidden="true">
        <button>collapsed submenu</button>
      </div>
      <div hidden>
        <button>hidden ancestor</button>
      </div>
      <div style={{ display: "none" }}>
        <button>css hidden ancestor</button>
      </div>
      <div inert>
        <button>inert ancestor</button>
      </div>
    </div>
  );
}

function AutofocusPortalTrap() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return <CmPortal><div ref={ref} tabIndex={-1}>
    <button>close dialog</button>
    <input aria-label="autofocus field" ref={(element) => element?.focus()} />
    <button>last dialog action</button>
  </div></CmPortal>;
}

describe("useFocusTrap", () => {
  it("does not steal a deliberate focus handoff when the trap is disabled", () => {
    const opener = document.createElement("button");
    const nextDialogField = document.createElement("input");
    document.body.append(opener, nextDialogField);
    opener.focus();
    const { rerender } = render(<Trap />);
    nextDialogField.focus();
    rerender(<Trap enabled={false} />);
    expect(document.activeElement).toBe(nextDialogField);
  });
  it("preserves focus already placed by autofocus before a portal trap attaches", async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = render(<AutofocusPortalTrap />);
    await waitFor(() => expect(document.activeElement).toBe(getByLabelText("autofocus field")));
    await user.tab();
    expect(document.activeElement).toBe(getByText("last dialog action"));
    await user.tab();
    expect(document.activeElement).toBe(getByText("close dialog"));
  });
  it("initializes when a portal mounts the panel after the parent effect", async () => {
    const user = userEvent.setup();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { getByText, unmount } = render(<PortalTrap />);
    await waitFor(() => expect(document.activeElement).toBe(getByText("portal first")));
    getByText("portal last").focus();
    await user.tab();
    expect(document.activeElement).toBe(getByText("portal first"));
    unmount();
    expect(document.activeElement).toBe(trigger);
  });

  it("skips negative tabIndex and wraps around hidden or inert descendants", async () => {
    const user = userEvent.setup();
    const { getByText } = render(<HiddenTrap />);
    expect(document.activeElement).toBe(getByText("visible first"));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(getByText("visible last"));
    await user.tab();
    expect(document.activeElement).toBe(getByText("visible first"));
  });
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
