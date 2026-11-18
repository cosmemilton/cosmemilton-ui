import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CmNativeSelect } from "./native-select.js";

afterEach(cleanup);

describe("CmNativeSelect", () => {
  it("labels the native control, forwards focus and submits the selected value", async () => {
    const ref = createRef<HTMLSelectElement>();
    const { container } = render(
      <form>
        <CmNativeSelect
          label="Conta"
          name="account"
          defaultValue=""
          required
          ref={ref}
          options={[
            { value: "", label: "Escolha", disabled: true },
            { value: "1", label: "Conta corrente" },
          ]}
        />
      </form>,
    );
    const select = screen.getByRole("combobox", { name: /Conta/ });
    expect(select).toBeInvalid();
    ref.current?.focus();
    expect(select).toHaveFocus();
    await userEvent.selectOptions(select, "1");
    expect(select).toBeValid();
    expect(new FormData(container.querySelector("form")!).get("account")).toBe("1");
  });
});
