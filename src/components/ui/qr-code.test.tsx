import { act, createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { Resvg } from "@resvg/resvg-js";
import jsQR from "jsqr";
import { describe, expect, it } from "vitest";
import { CmQrCode } from "./qr-code.js";

const completeUrl =
  "https://exemplo.test/Loja_2/clientes?nome=Jo\u00e3o%20Silva&retorno=%2Flocal%2Fdocs%2F&token=a%2Fb%3D#se\u00e7\u00e3o-\u03b1";

// Rasterization and decoding are independent of the component's QR encoder.
function rasterize(svg: SVGSVGElement, width = 640) {
  const renderer = new Resvg(new XMLSerializer().serializeToString(svg), {
    fitTo: { mode: "width", value: width },
  });
  const image = renderer.render();
  return {
    pixels: new Uint8ClampedArray(image.pixels),
    width: image.width,
    height: image.height,
  };
}

function decode(svg: SVGSVGElement) {
  const image = rasterize(svg);
  const decoded = jsQR(image.pixels, image.width, image.height);
  expect(decoded, "The rendered SVG must be independently readable").not.toBeNull();
  return decoded!;
}

function qrImage(name = "QR Code") {
  const image = screen.getByRole("img", { name });
  expect(image).toBeInstanceOf(SVGSVGElement);
  return image as unknown as SVGSVGElement;
}

describe("CmQrCode", () => {
  it("encodes the complete URL with escaped query, fragment and Unicode", () => {
    render(<CmQrCode value={completeUrl} />);

    const svg = qrImage();
    const decoded = decode(svg);
    expect(decoded.data).toBe(completeUrl);
    expect(decoded.binaryData).toEqual(Array.from(new TextEncoder().encode(completeUrl)));
    expect(svg).toHaveAttribute("width", "192");
    expect(svg).toHaveAttribute("height", "192");
  });

  it("updates the encoded content on rerender without normalizing Unicode or spaces", () => {
    const { rerender } = render(<CmQrCode value={completeUrl} />);
    const svg = qrImage();
    expect(decode(svg).data).toBe(completeUrl);

    const nextValue = " https://exemplo.test/Sa\u0303o?nome=\u6771\u4eac&parte=%2f#\u00e1rea ";
    rerender(<CmQrCode value={nextValue} />);

    expect(qrImage()).toBe(svg);
    const decoded = decode(svg);
    expect(decoded.data).toBe(nextValue);
    expect(decoded.binaryData).toEqual(Array.from(new TextEncoder().encode(nextValue)));
    expect(decoded.data).not.toBe(nextValue.normalize("NFC").trim());
  });

  it.each(["L", "M", "Q", "H"] as const)(
    "produces a readable QR at error correction level %s and an explicit size",
    (level) => {
      render(<CmQrCode value={completeUrl} level={level} size={280} />);

      const svg = qrImage();
      expect(svg).toHaveAttribute("width", "280");
      expect(svg).toHaveAttribute("height", "280");
      expect(decode(svg).data).toBe(completeUrl);
    },
  );

  it("keeps black modules, a white background and exactly four quiet-zone modules", () => {
    render(<CmQrCode value={completeUrl} style={{ color: "red" }} />);

    const svg = qrImage();
    const viewBox = svg.getAttribute("viewBox")!.split(/\s+/).map(Number);
    const modules = viewBox[2];
    expect(viewBox[0]).toBe(0);
    expect(viewBox[1]).toBe(0);
    expect(viewBox[3]).toBe(modules);
    const scale = 8;
    const image = rasterize(svg, modules * scale);
    let left = image.width;
    let right = -1;
    let top = image.height;
    let bottom = -1;
    const colors = new Set<string>();
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const [red, green, blue, alpha] = image.pixels.subarray(index, index + 4);
        colors.add(`${red},${green},${blue},${alpha}`);
        if (red === 0 && green === 0 && blue === 0) {
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
    }
    expect(colors).toEqual(new Set(["0,0,0,255", "255,255,255,255"]));
    expect(left).toBe(4 * scale);
    expect(top).toBe(4 * scale);
    expect(image.width - right - 1).toBe(4 * scale);
    expect(image.height - bottom - 1).toBe(4 * scale);
  });

  it("uses the title as its accessible name and accepts native aria overrides", () => {
    const { rerender } = render(<CmQrCode value={completeUrl} title="Acesso ao Integrador" />);

    expect(qrImage("Acesso ao Integrador").querySelector("title")).toHaveTextContent(
      "Acesso ao Integrador",
    );
    rerender(
      <>
        <p id="qr-description">Abra a mesma loja em outro dispositivo.</p>
        <CmQrCode
          value={completeUrl}
          title={"Endere\u00e7o da loja"}
          aria-label="Abrir a loja 2"
          aria-describedby="qr-description"
        />
      </>,
    );

    const svg = qrImage("Abrir a loja 2");
    expect(svg).toHaveAccessibleDescription("Abra a mesma loja em outro dispositivo.");
    expect(svg.querySelector("title")).toHaveTextContent("Endere\u00e7o da loja");
    expect(decode(svg).data).toBe(completeUrl);
  });

  it("forwards the SVG ref, native attributes, class and style without losing the QR", () => {
    const ref = createRef<SVGSVGElement>();
    render(
      <CmQrCode
        ref={ref}
        value={completeUrl}
        id="store-access"
        data-testid="store-qr"
        className="store-qr"
        style={{ margin: "12px" }}
      />,
    );

    const svg = qrImage();
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute("id", "store-access");
    expect(svg).toHaveAttribute("data-testid", "store-qr");
    expect(svg).toHaveClass("cm-qr-code", "store-qr");
    expect(svg).toHaveStyle({ margin: "12px" });
    expect(decode(svg).data).toBe(completeUrl);
  });

  it("renders a readable SVG on the server and hydrates the same accessible node", async () => {
    const view = <CmQrCode value={completeUrl} title="Acesso remoto" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(view);
    document.body.append(container);
    const svg = container.querySelector("svg")!;
    expect(decode(svg).data).toBe(completeUrl);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, view, {
          onRecoverableError: (error) => recoverableErrors.push(error),
        });
      });

      expect(container.querySelector("svg")).toBe(svg);
      expect(svg).toHaveAccessibleName("Acesso remoto");
      expect(recoverableErrors).toEqual([]);
      expect(decode(svg).data).toBe(completeUrl);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
