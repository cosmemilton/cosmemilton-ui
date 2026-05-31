import { describe, expect, it } from "vitest";
import { cn, formatCNPJ, formatCPF, formatDate, formatNCM, formatPhone } from "./utils.js";

describe("utils", () => {
  it("joins class names and skips falsy entries", () => {
    expect(cn("cm-card", false, undefined, null, "cm-card--active")).toBe(
      "cm-card cm-card--active",
    );
  });

  it("formats NCM codes with eight digits", () => {
    expect(formatNCM("01012100")).toBe("0101.21.00");
    expect(formatNCM("0101.21.00")).toBe("0101.21.00");
  });

  it("formats dates with pt-BR locale and UTC timezone", () => {
    expect(formatDate("2026-05-31")).toBe("31/05/2026");
  });

  it("formats CPF values with eleven digits", () => {
    expect(formatCPF("12345678909")).toBe("123.456.789-09");
    expect(formatCPF("123.456.789-09")).toBe("123.456.789-09");
  });

  it("formats numeric and alphanumeric CNPJ values", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatCNPJ("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
    expect(formatCNPJ("12.abc.345/01de-35")).toBe("12.ABC.345/01DE-35");
  });

  it("keeps invalid CNPJ-like values unchanged", () => {
    expect(formatCNPJ("12ABC34501DEZZ")).toBe("12ABC34501DEZZ");
    expect(formatCNPJ("ABC")).toBe("ABC");
  });

  it("formats Brazilian phone numbers", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890");
    expect(formatPhone("5511987654321")).toBe("+55 (11) 98765-4321");
    expect(formatPhone("08001234567")).toBe("0800 123 4567");
  });
});
