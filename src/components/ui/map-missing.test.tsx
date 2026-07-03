import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { CmMap } from "./map.js";

/* Arquivo separado do map.test.tsx de propósito: o CmMap memoiza a promise do
   import("leaflet") no escopo do módulo, então o cenário "peer ausente" precisa
   de uma instância própria do módulo (isolamento por arquivo do vitest). */
vi.mock("leaflet", () => {
  throw new Error("Cannot find module 'leaflet'");
});

describe("CmMap sem o peer opcional leaflet", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra o fallback e orienta a instalação em vez de quebrar", async () => {
    render(<CmMap />);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        'Mapa indisponível — instale a dependência opcional "leaflet".',
      ),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("npm install leaflet"),
      expect.any(Error),
    );
  });
});
