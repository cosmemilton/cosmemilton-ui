import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmGrid, CmGridContainer } from "./grid.js";

describe("CmGridContainer", () => {
  it("keeps numeric responsive columns as the default grid mode", () => {
    render(
      <CmGridContainer columns={{ base: 1, md: 3 }} data-testid="grid">
        <div />
      </CmGridContainer>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("cm-grid-container");
    expect(grid).not.toHaveClass("cm-grid-container--auto");
    expect(grid.style.getPropertyValue("--grid-columns-base")).toBe("1");
    expect(grid.style.getPropertyValue("--grid-columns-md")).toBe("3");
  });

  it("supports auto-fit with a responsive minimum column width", () => {
    render(
      <CmGridContainer
        autoFit
        minColumnWidth={{ base: "12rem", lg: "18rem" }}
        data-testid="grid"
      >
        <div />
      </CmGridContainer>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("cm-grid-container--auto");
    expect(grid.style.getPropertyValue("--grid-auto-mode")).toBe("auto-fit");
    expect(grid.style.getPropertyValue("--grid-min-column-width-base")).toBe("12rem");
    expect(grid.style.getPropertyValue("--grid-min-column-width-md")).toBe("12rem");
    expect(grid.style.getPropertyValue("--grid-min-column-width-lg")).toBe("18rem");
  });

  it("supports auto-fill and grid presets", () => {
    render(
      <CmGridContainer autoFill preset="metrics" data-testid="grid">
        <div />
      </CmGridContainer>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("cm-grid-container--auto", "cm-grid-container--preset-metrics");
    expect(grid.style.getPropertyValue("--grid-auto-mode")).toBe("auto-fill");
    expect(grid.style.getPropertyValue("--grid-min-column-width-base")).toBe("14rem");
  });

  it("supports explicit asymmetric template columns", () => {
    render(
      <CmGridContainer
        templateColumns={{ base: "1fr", md: "0.55fr 1fr", xl: "1fr 10rem" }}
        data-testid="grid"
      >
        <div />
      </CmGridContainer>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("cm-grid-container--template");
    expect(grid.style.getPropertyValue("--grid-template-columns-base")).toBe("1fr");
    expect(grid.style.getPropertyValue("--grid-template-columns-md")).toBe("0.55fr 1fr");
    expect(grid.style.getPropertyValue("--grid-template-columns-xl")).toBe("1fr 10rem");
  });
});

describe("CmGrid ergonomic API", () => {
  it("renders a grid container with Material-style spacing and size props", () => {
    render(
      <CmGrid container spacing="md" data-testid="grid">
        <CmGrid size={8} data-testid="a">
          A
        </CmGrid>
        <CmGrid size={4} data-testid="b">
          B
        </CmGrid>
      </CmGrid>,
    );

    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("cm-grid", "cm-grid-container");
    expect(grid.style.getPropertyValue("--grid-columns-base")).toBe("12");
    expect(grid.style.getPropertyValue("--grid-row-gap")).toBe("var(--space-md, 1rem)");
    expect(grid.style.getPropertyValue("--grid-column-gap")).toBe("var(--space-md, 1rem)");

    expect(screen.getByTestId("a")).toHaveClass("cm-grid--size-span-base");
    expect(screen.getByTestId("a").style.getPropertyValue("--grid-span-base")).toBe("8");
    expect(screen.getByTestId("b").style.getPropertyValue("--grid-span-base")).toBe("4");
  });

  it("supports responsive size values", () => {
    render(
      <CmGrid size={{ base: 6, md: 8 }} data-testid="item">
        A
      </CmGrid>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveClass("cm-grid--size-span-base", "cm-grid--size-span-md");
    expect(item.style.getPropertyValue("--grid-span-base")).toBe("6");
    expect(item.style.getPropertyValue("--grid-span-sm")).toBe("6");
    expect(item.style.getPropertyValue("--grid-span-md")).toBe("8");
  });

  it("supports auto and grow sizes", () => {
    render(
      <CmGrid container spacing="lg">
        <CmGrid size="auto" data-testid="auto">
          Auto
        </CmGrid>
        <CmGrid size={{ base: 6, md: "grow" }} data-testid="grow">
          Grow
        </CmGrid>
      </CmGrid>,
    );

    expect(screen.getByTestId("auto")).toHaveClass(
      "cm-grid--size-auto-base",
      "cm-grid--size-auto-xl",
    );
    expect(screen.getByTestId("grow")).toHaveClass(
      "cm-grid--size-span-base",
      "cm-grid--size-grow-md",
    );
  });

  it("supports responsive row and column spacing aliases", () => {
    render(
      <CmGrid
        container
        rowSpacing="sm"
        columnSpacing={{ base: "xs", sm: "sm", md: "lg" }}
        data-testid="grid"
      />,
    );

    const grid = screen.getByTestId("grid");
    expect(grid.style.getPropertyValue("--grid-row-gap")).toBe("var(--space-sm, 0.5rem)");
    expect(grid.style.getPropertyValue("--grid-row-gap-md")).toBe("var(--space-sm, 0.5rem)");
    expect(grid.style.getPropertyValue("--grid-column-gap")).toBe("var(--space-xs, 0.25rem)");
    expect(grid.style.getPropertyValue("--grid-column-gap-sm")).toBe("var(--space-sm, 0.5rem)");
    expect(grid.style.getPropertyValue("--grid-column-gap-md")).toBe("var(--space-lg, 1.5rem)");
  });
});
