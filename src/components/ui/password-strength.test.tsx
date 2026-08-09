import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmPasswordStrength, cmEstimatePasswordStrength } from "./password-strength.js";

describe("cmEstimatePasswordStrength", () => {
  it("gives zero to an empty password and says what is missing", () => {
    const result = cmEstimatePasswordStrength("");
    expect(result.score).toBe(0);
    expect(result.hints[0]).toMatch(/8 caracteres/);
  });

  it("never goes above 1 below the minimum length, however fancy", () => {
    // Curta com quatro classes de caractere: o teto duro é o que impede o
    // medidor de dizer "boa" para uma senha de 6 dígitos com símbolo.
    expect(cmEstimatePasswordStrength("aA1!x").score).toBeLessThanOrEqual(1);
  });

  it("caps the obvious ones, symbols and all", () => {
    // É exatamente o que se digita quando o formulário pede maiúscula, número e
    // símbolo — e é a primeira linha de qualquer lista de ataque.
    expect(cmEstimatePasswordStrength("Senha@2026").score).toBeLessThanOrEqual(1);
    expect(cmEstimatePasswordStrength("123456789012").score).toBeLessThanOrEqual(1);
  });

  it("discounts runs and sequences", () => {
    const plain = cmEstimatePasswordStrength("Sombrinha!Frevo#2026");
    const sequential = cmEstimatePasswordStrength("Sombrinha!abcd#2026");
    expect(sequential.score).toBeLessThan(plain.score);
    expect(sequential.hints).toContain("evite sequências como 1234 ou abcd");
    expect(cmEstimatePasswordStrength("Sombrinhaaaa!Frevo#26").hints).toContain(
      "evite repetir o mesmo caractere",
    );
  });

  it("reaches the top with a long password of four classes", () => {
    const result = cmEstimatePasswordStrength("Sombrinha!Frevo#2026");
    expect(result.score).toBe(4);
    expect(result.label).toBe("forte");
  });

  it("accepts custom labels", () => {
    expect(cmEstimatePasswordStrength("", { labels: ["nada"] }).label).toBe("nada");
  });
});

describe("CmPasswordStrength", () => {
  it("exposes a named meter with the level", () => {
    render(<CmPasswordStrength value="Sombrinha!Frevo#2026" />);
    const meter = screen.getByRole("meter", { name: "Força da senha" });
    expect(meter).toHaveAttribute("aria-valuenow", "4");
    expect(meter).toHaveAttribute("aria-valuemax", "4");
    expect(screen.getByText(/^forte/)).toBeInTheDocument();
  });

  it("says the level in words, never only in color", () => {
    const { container } = render(<CmPasswordStrength value="abc" />);
    expect(container.querySelector(".cm-password-strength__label")).toHaveTextContent(
      /muito fraca|fraca/,
    );
  });

  it("accepts a level calculated elsewhere", () => {
    render(<CmPasswordStrength score={2} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("razoável")).toBeInTheDocument();
  });

  it("lights up one segment per level", () => {
    const { container } = render(<CmPasswordStrength score={3} />);
    expect(container.querySelectorAll(".cm-password-strength__segment--on")).toHaveLength(3);
  });

  it("shows the hints only when asked", () => {
    const { container, rerender } = render(<CmPasswordStrength value="abc" />);
    expect(container.querySelector(".cm-password-strength__hints")).toBeNull();

    rerender(<CmPasswordStrength value="abc" showHints />);
    expect(container.querySelector(".cm-password-strength__hints")).not.toBeNull();
  });
});
