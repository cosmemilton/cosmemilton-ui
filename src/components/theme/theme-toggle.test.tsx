import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmThemeProvider } from "./theme-provider.js";
import { CmThemeMenu } from "./theme-toggle.js";

beforeEach(() => {
  window.localStorage.clear();
});

describe("CmThemeMenu V4", () => {
  it("offers only the three new palettes and changes the active label and icon", async () => {
    const user = userEvent.setup();
    render(
      <CmThemeProvider>
        <CmThemeMenu />
      </CmThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Selecionar tema: Claro" });
    expect(trigger.querySelector("svg.lucide-sun")).toHaveAttribute("aria-hidden", "true");
    await user.click(trigger);
    const options = within(screen.getByRole("menu")).getAllByRole("menuitem");
    expect(options.map((option) => option.textContent)).toEqual(["ClaroAtual", "Escuro", "Aurora"]);
    expect(options.every((option) => option.querySelector('svg[aria-hidden="true"]'))).toBe(true);
    await user.click(screen.getByRole("menuitem", { name: "Escuro" }));
    expect(
      screen
        .getByRole("button", { name: "Selecionar tema: Escuro" })
        .querySelector("svg.lucide-moon-star"),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-dark");
    expect(localStorage.getItem("cm-theme")).toBe("cm-v4-dark");
    await user.click(screen.getByRole("button", { name: "Selecionar tema: Escuro" }));
    await user.click(screen.getByRole("menuitem", { name: "Aurora" }));
    expect(
      screen
        .getByRole("button", { name: "Selecionar tema: Aurora" })
        .querySelector("svg.lucide-sparkles"),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "cm-v4-aurora");
  });

  it("uses caller labels and icons for the selected option as well as its menu", async () => {
    render(
      <CmThemeProvider themeName="cm-v4-dark" storageKey={false}>
        <CmThemeMenu
          themes={[{ name: "cm-v4-dark", label: "Noite" }]}
          getThemeIcon={() => (
            <span aria-hidden="true" data-testid="custom-theme-icon">
              ☾
            </span>
          )}
        />
      </CmThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Selecionar tema: Noite" });
    expect(within(trigger).getByTestId("custom-theme-icon")).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(within(screen.getByRole("menu")).getByTestId("custom-theme-icon")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Noite/ })).toBeInTheDocument();
  });
});
