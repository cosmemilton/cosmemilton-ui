import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmTabs, CmTabsList, CmTabsTrigger } from "./tabs.js";

afterEach(cleanup);

function renderTabs(variant: "default" | "modal" | "folder" = "default", showScrollButtons = true) {
  return render(
    <CmTabs defaultValue="one" variant={variant}>
      <CmTabsList showScrollButtons={showScrollButtons}>
        <CmTabsTrigger value="one">One</CmTabsTrigger>
        <CmTabsTrigger value="two">Two</CmTabsTrigger>
        <CmTabsTrigger value="three">Three</CmTabsTrigger>
      </CmTabsList>
    </CmTabs>,
  );
}

function mockHorizontalLayout(list: HTMLElement, clientWidth: number, scrollWidth: number) {
  let scrollLeft = 0;
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
      expect(screen.getByRole("button", { name: "Rolar abas para a esquerda" })).toBeVisible();
    },
  );

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
});
