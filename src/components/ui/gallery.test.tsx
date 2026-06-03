import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CmGallery, CmLightbox, type CmGalleryItem } from "./gallery.js";

const items: CmGalleryItem[] = [
  { id: "a", src: "/a.jpg", alt: "Foto A", caption: "Legenda A" },
  { id: "b", src: "/b.jpg", alt: "Foto B" },
  { id: "c", src: "/c.jpg", alt: "Foto C" },
];

afterEach(cleanup);

describe("CmGallery", () => {
  it("renders one thumbnail trigger per item", () => {
    render(<CmGallery items={items} />);
    expect(screen.getByRole("button", { name: "Foto A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Foto B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Foto C" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no items", () => {
    render(<CmGallery items={[]} emptyMessage="Sem fotos" />);
    expect(screen.getByText("Sem fotos")).toBeInTheDocument();
  });

  it("opens the lightbox on the clicked item and reports it", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(<CmGallery items={items} onItemClick={onItemClick} />);

    await user.click(screen.getByRole("button", { name: "Foto B" }));

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }), 1);
    const dialog = screen.getByRole("dialog", { name: "Galeria de imagens" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/b.jpg");
  });

  it("does not open a lightbox when disabled", async () => {
    const user = userEvent.setup();
    render(<CmGallery items={items} enableLightbox={false} />);

    await user.click(screen.getByRole("button", { name: "Foto A" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("CmLightbox", () => {
  function renderLightbox(props: Partial<Parameters<typeof CmLightbox>[0]> = {}) {
    return render(
      <CmLightbox items={items} open onClose={props.onClose ?? vi.fn()} {...props} />,
    );
  }

  it("renders nothing while closed", () => {
    render(<CmLightbox items={items} open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the active image, caption and counter", () => {
    renderLightbox({ defaultIndex: 0 });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", "/a.jpg");
    expect(within(dialog).getByText("Legenda A")).toBeInTheDocument();
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument();
  });

  it("advances to the next image and reports the index", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    renderLightbox({ defaultIndex: 0, onIndexChange });

    await user.click(screen.getByRole("button", { name: "Próxima imagem" }));

    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("loops past the last image back to the first when loop is on", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    renderLightbox({ defaultIndex: 2, onIndexChange, loop: true });

    await user.click(screen.getByRole("button", { name: "Próxima imagem" }));

    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it("navigates with the arrow keys", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    renderLightbox({ defaultIndex: 1, onIndexChange });

    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(2);

    await user.keyboard("{ArrowLeft}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderLightbox({ onClose });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("jumps to a thumbnail when clicked", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    renderLightbox({ defaultIndex: 0, onIndexChange });

    await user.click(screen.getByRole("tab", { name: "Foto C" }));

    expect(onIndexChange).toHaveBeenCalledWith(2);
  });
});
