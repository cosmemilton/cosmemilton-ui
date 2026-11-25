import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CmSavedViews } from "./saved-views.js";

const defaults = { status: "", columns: ["customer"], sort: "default" };
const credit = { status: "review", columns: ["customer", "credit"], sort: "credit-desc" };
const current = { ...credit, status: "approved" };
const views = [{ id: "credit", label: "Crédito em revisão", snapshot: credit }];

describe("CmSavedViews", () => {
  it("applies the whole saved view and requests app defaults when cleared", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const { rerender } = render(
      <CmSavedViews
        views={views}
        activeViewId={null}
        currentSnapshot={defaults}
        onApply={onApply}
      />,
    );
    const selector = screen.getByRole("combobox", { name: "Visões salvas" });
    expect(selector).toHaveValue("");

    await user.selectOptions(selector, "credit");
    expect(onApply).toHaveBeenCalledWith(views[0]);
    rerender(
      <CmSavedViews
        views={views}
        activeViewId="credit"
        currentSnapshot={credit}
        onApply={onApply}
      />,
    );
    expect(selector).toHaveValue("credit");
    await user.selectOptions(selector, "");
    expect(onApply).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("creates a named view via Enter without submitting a surrounding form", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CmSavedViews
          views={views}
          activeViewId="credit"
          currentSnapshot={current}
          dirty
          onApply={vi.fn()}
          onCreate={onCreate}
        />
      </form>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Alterações não salvas");
    await user.click(screen.getByRole("button", { name: "Salvar visão" }));
    const name = screen.getByRole("textbox", { name: "Nome da visão" });
    expect(name).toHaveFocus();
    await user.type(name, "  Aprovados  {Enter}");
    expect(onCreate).toHaveBeenCalledWith({ label: "Aprovados", snapshot: current });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar visão" })).toHaveFocus());
  });

  it("does not permit a duplicate name and keeps the editor open when saving fails", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockRejectedValueOnce(new Error("server detail"));
    render(
      <CmSavedViews
        views={views}
        activeViewId={null}
        currentSnapshot={current}
        onApply={vi.fn()}
        onCreate={onCreate}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar visão" }));
    const name = screen.getByRole("textbox", { name: "Nome da visão" });
    const save = screen.getByRole("button", { name: "Salvar", exact: true });
    await user.type(name, "  CRÉDITO EM REVISÃO  {Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Já existe uma visão com esse nome.");
    expect(save).toBeDisabled();
    expect(onCreate).not.toHaveBeenCalled();

    await user.clear(name);
    await user.type(name, "Outra visão");
    await user.click(save);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível concluir");
    expect(name).toHaveValue("Outra visão");
    await user.click(save);
    expect(onCreate).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("manages an active view with keyboard navigation and asks before deleting", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    render(
      <CmSavedViews
        views={views}
        activeViewId="credit"
        currentSnapshot={current}
        onApply={vi.fn()}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );
    const manage = screen.getByRole("button", { name: "Gerenciar visão" });
    manage.focus();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("textbox", { name: "Nome da visão" })).toHaveValue(views[0].label);
    await user.click(screen.getByRole("button", { name: "Atualizar", exact: true }));
    expect(onUpdate).toHaveBeenCalledWith("credit", { label: views[0].label, snapshot: current });

    await user.click(manage);
    await user.click(screen.getByRole("menuitem", { name: "Excluir visão" }));
    const deletePanel = screen.getByRole("group", { name: /Excluir a visão.*Crédito em revisão/ });
    expect(deletePanel).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Excluir", exact: true }));
    expect(onDelete).toHaveBeenCalledWith("credit");
  });

  it("prevents a second mutation while an asynchronous save is pending", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const onCreate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <CmSavedViews
        views={[]}
        activeViewId={null}
        currentSnapshot={defaults}
        onApply={vi.fn()}
        onCreate={onCreate}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Salvar visão" }));
    await user.type(screen.getByRole("textbox", { name: "Nome da visão" }), "Nova visão");
    const save = screen.getByRole("button", { name: "Salvar", exact: true });
    await user.dblClick(save);
    expect(onCreate).toHaveBeenCalledOnce();
    expect(save).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
  });
});
