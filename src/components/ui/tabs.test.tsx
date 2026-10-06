import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmTabs, CmTabsList, CmTabsTrigger } from "./tabs.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderTabs(
  variant: "default" | "modal" | "folder" = "default",
  showScrollButtons = true,
  defaultValue = "one",
) {
  return render(
    <CmTabs defaultValue={defaultValue} variant={variant}>
      <CmTabsList showScrollButtons={showScrollButtons}>
        <CmTabsTrigger value="one">One</CmTabsTrigger>
        <CmTabsTrigger value="two">Two</CmTabsTrigger>
        <CmTabsTrigger value="three">Three</CmTabsTrigger>
      </CmTabsList>
    </CmTabs>,
  );
}

function mockHorizontalLayout(
  list: HTMLElement,
  clientWidth: number,
  scrollWidth: number,
  shellWidth = clientWidth,
) {
  let scrollLeft = 0;
  Object.defineProperty(list.parentElement, "clientWidth", {
    configurable: true,
    value: shellWidth,
  });
  Object.defineProperties(list, {
    clientWidth: { configurable: true, value: clientWidth },
    scrollWidth: { configurable: true, value: scrollWidth },
    scrollLeft: {
      configurable: true,
      get: () => scrollLeft,
      set: (value: number) => {
        scrollLeft = value;
      },
    },
    scrollTo: {
      configurable: true,
      value: vi.fn(({ left }: ScrollToOptions) => {
        scrollLeft = left ?? 0;
        fireEvent.scroll(list);
      }),
    },
  });
  fireEvent(window, new Event("resize"));
}

function mockTabLayout(tab: HTMLElement, offsetLeft: number, offsetWidth: number) {
  Object.defineProperties(tab, {
    offsetLeft: { configurable: true, value: offsetLeft },
    offsetWidth: { configurable: true, value: offsetWidth },
  });
}

describe("CmTabsList overflow navigation", () => {
  it.each(["default", "modal", "folder"] as const)(
    "shows scroll controls only when the %s variant overflows",
    async (variant) => {
      const user = userEvent.setup();
      renderTabs(variant);
      const list = screen.getByRole("tablist");

      mockHorizontalLayout(list, 200, 800);
      expect(screen.getByRole("button", { name: "Rolar abas para a direita" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Rolar abas para a esquerda" }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Rolar abas para a direita" }));
      expect(list.scrollTo).toHaveBeenCalledWith({ left: 160, behavior: "smooth" });
      expect(list.scrollLeft).toBe(160);
      expect(screen.getByRole("button", { name: "Rolar abas para a esquerda" })).toBeVisible();
    },
  );

  it("still reveals the initially selected tab when no manual scroll supersedes the frame", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    renderTabs("folder", true, "three");
    const list = screen.getByRole("tablist");
    // Measure overflow first, then let the initial frame see the final tab offsets.
    mockHorizontalLayout(list, 200, 500, 264);
    mockTabLayout(screen.getByRole("tab", { name: "Three" }), 300, 120);
    expect(list.scrollLeft).toBe(0);
    act(() => frames.splice(0).forEach((callback) => callback(0)));
    expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "instant" });
    expect(list.scrollLeft).toBe(220);
  });

  it("does not render controls when every tab fits", () => {
    renderTabs();
    mockHorizontalLayout(screen.getByRole("tablist"), 400, 400);

    expect(screen.queryByLabelText(/Rolar abas/)).not.toBeInTheDocument();
  });

  it("can keep automatic controls disabled while preserving the scrollable list", () => {
    renderTabs("folder", false);
    const list = screen.getByRole("tablist");
    mockHorizontalLayout(list, 200, 800);

    expect(screen.queryByLabelText(/Rolar abas/)).not.toBeInTheDocument();
    expect(list).toHaveClass("cm-tabs-list--folder");
  });

  it.each(["default", "modal", "folder"] as const)(
    "reveals selected tabs using the %s list width after reserving space for the arrows",
    async (variant) => {
      const user = userEvent.setup();
      renderTabs(variant);
      const list = screen.getByRole("tablist");
      mockTabLayout(screen.getByRole("tab", { name: "One" }), 4, 100);
      mockTabLayout(screen.getByRole("tab", { name: "Three" }), 300, 120);
      mockHorizontalLayout(list, 200, 500, 264);

      await user.click(screen.getByRole("tab", { name: "Three" }));
      expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "smooth" });

      await user.click(screen.getByRole("tab", { name: "One" }));
      expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 4, behavior: "smooth" });
    },
  );

  it.each(["default", "modal", "folder"] as const)(
    "keeps the selected %s tab visible when the viewport shrinks",
    async (variant) => {
      const user = userEvent.setup();
      renderTabs(variant);
      const list = screen.getByRole("tablist");
      mockTabLayout(screen.getByRole("tab", { name: "Three" }), 300, 120);
      mockHorizontalLayout(list, 500, 500);
      await user.click(screen.getByRole("tab", { name: "Three" }));
      expect(list.scrollLeft).toBe(0);

      mockHorizontalLayout(list, 200, 500, 264);
      expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "instant" });
      expect(list.scrollLeft).toBe(220);
    },
  );

  it("removes controls when the tabs fit the full shell, even if the reserved list still overflows", () => {
    renderTabs();
    const list = screen.getByRole("tablist");
    mockHorizontalLayout(list, 200, 500, 264);
    expect(screen.getByRole("button", { name: "Rolar abas para a direita" })).toBeVisible();

    mockHorizontalLayout(list, 250, 300, 314);
    expect(screen.queryByLabelText(/Rolar abas/)).not.toBeInTheDocument();
  });

  it("reveals selected tabs when scroll controls are disabled", async () => {
    const user = userEvent.setup();
    renderTabs("folder", false);
    const list = screen.getByRole("tablist");
    mockTabLayout(screen.getByRole("tab", { name: "Three" }), 300, 120);
    mockHorizontalLayout(list, 264, 500);

    await user.click(screen.getByRole("tab", { name: "Three" }));
    expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 156, behavior: "smooth" });
    expect(screen.queryByLabelText(/Rolar abas/)).not.toBeInTheDocument();
  });

  it("aligns an oversized tab to its start without repeated scrolling during resize", async () => {
    const user = userEvent.setup();
    renderTabs();
    const list = screen.getByRole("tablist");
    mockTabLayout(screen.getByRole("tab", { name: "Two" }), 200, 260);
    mockHorizontalLayout(list, 200, 600, 264);

    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 200, behavior: "smooth" });

    vi.mocked(list.scrollTo).mockClear();
    fireEvent(window, new Event("resize"));
    expect(list.scrollTo).not.toHaveBeenCalled();
  });

  it("preserves manual arrow navigation when the parent renders the same tabs again", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    const user = userEvent.setup();
    const view = renderTabs();
    const list = screen.getByRole("tablist");
    mockTabLayout(screen.getByRole("tab", { name: "One" }), 4, 100);
    mockHorizontalLayout(list, 200, 500, 264);

    await user.click(screen.getByRole("button", { name: "Rolar abas para a direita" }));
    vi.mocked(list.scrollTo).mockClear();
    view.rerender(
      <CmTabs defaultValue="one">
        <CmTabsList>
          <CmTabsTrigger value="one">One</CmTabsTrigger>
          <CmTabsTrigger value="two">Two</CmTabsTrigger>
          <CmTabsTrigger value="three">Three</CmTabsTrigger>
        </CmTabsList>
      </CmTabs>,
    );

    expect(list.scrollLeft).toBe(160);
    expect(list.scrollTo).not.toHaveBeenCalled();
  });

  it.each(["default", "modal", "folder"] as const)(
    "preserves manual %s scrolling when the initial layout frame arrives later",
    async (variant) => {
      const frames: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });
      const user = userEvent.setup();
      renderTabs(variant);
      const list = screen.getByRole("tablist");
      mockTabLayout(screen.getByRole("tab", { name: "One" }), 4, 100);
      mockTabLayout(screen.getByRole("tab", { name: "Three" }), 300, 120);
      mockHorizontalLayout(list, 200, 500, 264);

      await user.click(screen.getByRole("button", { name: "Rolar abas para a direita" }));
      expect(list.scrollLeft).toBe(160);
      act(() => frames.splice(0).forEach((callback) => callback(0)));
      expect(list.scrollLeft).toBe(160);
      expect(screen.getByRole("button", { name: "Rolar abas para a esquerda" })).toBeVisible();

      // A later resize and an explicit selection must still reveal the active tab.
      fireEvent(window, new Event("resize"));
      expect(list.scrollLeft).toBe(4);
      await user.click(screen.getByRole("tab", { name: "Three" }));
      expect(list.scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "smooth" });
    },
  );
});
