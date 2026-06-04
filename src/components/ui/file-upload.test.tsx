import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmFileUpload, formatFileSize } from "./file-upload.js";

afterEach(cleanup);

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("CmFileUpload", () => {
  it("renders the dropzone label and hint", () => {
    render(<CmFileUpload label="Solte aqui" hint="PNG até 1 MB" />);
    expect(screen.getByText("Solte aqui")).toBeInTheDocument();
    expect(screen.getByText("PNG até 1 MB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solte aqui" })).toBeInTheDocument();
  });

  it("accepts a file, reports it via onUpload and lists it", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const { container } = render(<CmFileUpload onUpload={onUpload} />);

    const file = new File(["hello"], "doc.txt", { type: "text/plain" });
    await user.upload(fileInput(container), file);

    expect(onUpload).toHaveBeenCalledWith([file]);
    expect(screen.getByText("doc.txt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover doc.txt" })).toBeInTheDocument();
  });

  it("rejects files larger than maxSize and does not add them", async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    const onUpload = vi.fn();
    const { container } = render(
      <CmFileUpload maxSize={3} onReject={onReject} onUpload={onUpload} />,
    );

    const file = new File(["too-big-content"], "big.txt", { type: "text/plain" });
    await user.upload(fileInput(container), file);

    expect(onUpload).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "size" }]);
    expect(screen.queryByText("big.txt")).not.toBeInTheDocument();
  });

  it("rejects dropped files whose type is outside accept", () => {
    // The native <input accept> filters before our handler, so the type guard is
    // exercised via drag-and-drop where the browser does not enforce `accept`.
    const onReject = vi.fn();
    render(<CmFileUpload accept="image/*" onReject={onReject} />);

    const file = new File(["x"], "note.txt", { type: "text/plain" });
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file] } });

    expect(onReject).toHaveBeenCalledWith([{ file, reason: "type" }]);
  });

  it("removes a listed file", async () => {
    const user = userEvent.setup();
    const { container } = render(<CmFileUpload />);

    const file = new File(["x"], "a.txt", { type: "text/plain" });
    await user.upload(fileInput(container), file);
    expect(screen.getByText("a.txt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover a.txt" }));
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
  });

  it("formats human-readable sizes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});
