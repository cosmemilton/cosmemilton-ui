import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { CmMap, type CmMapMarker } from "./map.js";

/* O leaflet é mockado no nível do módulo: o CmMap o carrega via import()
   dinâmico, então o mock também intercepta o carregamento lazy. */
type Listener = (event?: unknown) => void;

const h = vi.hoisted(() => {
  type MarkerInstance = {
    latlng: [number, number];
    options: Record<string, unknown>;
    listeners: Record<string, Listener>;
    popupEl: HTMLElement | null;
    addTo: ReturnType<typeof vi.fn>;
    bindPopup: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    on: (type: string, fn: Listener) => MarkerInstance;
    getLatLng: () => { lat: number; lng: number };
  };

  const state = {
    mapListeners: {} as Record<string, Listener>,
    markers: [] as MarkerInstance[],
    groups: [] as Array<{ remove: ReturnType<typeof vi.fn> }>,
  };

  const mapInstance = {
    setView: vi.fn(),
    fitBounds: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    getZoom: vi.fn(() => 13),
    scrollWheelZoom: { enable: vi.fn(), disable: vi.fn() },
    on: (type: string, fn: Listener) => {
      state.mapListeners[type] = fn;
      return mapInstance;
    },
  };

  const L = {
    map: vi.fn(() => mapInstance),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    divIcon: vi.fn((options: Record<string, unknown>) => options),
    latLngBounds: vi.fn((positions: unknown) => positions),
    layerGroup: vi.fn(() => {
      const group = {
        addTo: vi.fn(() => group),
        remove: vi.fn(),
      };
      state.groups.push(group);
      return group;
    }),
    marker: vi.fn((latlng: [number, number], options: Record<string, unknown>) => {
      const instance: MarkerInstance = {
        latlng,
        options,
        listeners: {},
        popupEl: null,
        addTo: vi.fn(() => instance),
        bindPopup: vi.fn((el: HTMLElement) => {
          instance.popupEl = el;
          return instance;
        }),
        remove: vi.fn(),
        on: (type, fn) => {
          instance.listeners[type] = fn;
          return instance;
        },
        getLatLng: () => ({ lat: latlng[0], lng: latlng[1] }),
      };
      state.markers.push(instance);
      return instance;
    }),
  };

  return { state, mapInstance, L };
});

vi.mock("leaflet", () => ({ default: h.L }));

const markers: CmMapMarker[] = [
  { id: "casa", position: { lat: -23.55, lng: -46.63 }, label: "Casa", tone: "success" },
  { id: "escritorio", position: { lat: -23.56, lng: -46.65 }, label: "Escritório" },
];

async function renderReady(ui: Parameters<typeof render>[0]) {
  const result = render(ui);
  await waitFor(() => expect(h.L.map).toHaveBeenCalled());
  return result;
}

describe("CmMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.state.mapListeners = {};
    h.state.markers.length = 0;
    h.state.groups.length = 0;
  });

  it("shows a loading status and removes it once leaflet is ready", async () => {
    render(<CmMap />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando mapa…");
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });

  it("creates the map with center/zoom and the default OSM tile layer", async () => {
    await renderReady(<CmMap center={{ lat: -23.55, lng: -46.63 }} zoom={15} />);
    expect(h.L.map).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ center: [-23.55, -46.63], zoom: 15, scrollWheelZoom: true }),
    );
    expect(h.L.tileLayer).toHaveBeenCalledWith(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      expect.objectContaining({ maxZoom: 19 }),
    );
  });

  it("renders tonal pins with accessible labels for each marker", async () => {
    await renderReady(<CmMap markers={markers} />);
    await waitFor(() => expect(h.state.markers).toHaveLength(2));
    const [first, second] = h.state.markers;
    expect(first.options.title).toBe("Casa");
    expect((first.options.icon as { html: string }).html).toContain("cm-map__pin--tone-success");
    expect((second.options.icon as { html: string }).html).toContain("cm-map__pin--tone-primary");
  });

  it("fits bounds to markers when there is no explicit center", async () => {
    await renderReady(<CmMap markers={markers} />);
    await waitFor(() => expect(h.mapInstance.fitBounds).toHaveBeenCalled());
  });

  it("does not fit bounds when an explicit center is given", async () => {
    await renderReady(<CmMap center={{ lat: 0, lng: 0 }} markers={markers} />);
    await waitFor(() => expect(h.state.markers).toHaveLength(2));
    expect(h.mapInstance.fitBounds).not.toHaveBeenCalled();
  });

  it("renders React popup content through a portal", async () => {
    await renderReady(
      <CmMap
        markers={[{ ...markers[0], popup: <strong data-testid="popup">Rua A, 123</strong> }]}
      />,
    );
    await waitFor(() => {
      expect(h.state.markers[0]?.popupEl?.textContent).toBe("Rua A, 123");
    });
  });

  it("notifies marker clicks with the original marker", async () => {
    const onMarkerClick = vi.fn();
    await renderReady(<CmMap markers={markers} onMarkerClick={onMarkerClick} />);
    await waitFor(() => expect(h.state.markers).toHaveLength(2));
    h.state.markers[1].listeners.click?.();
    expect(onMarkerClick).toHaveBeenCalledWith(markers[1]);
  });

  it("reports map clicks as onPick coordinates", async () => {
    const onPick = vi.fn();
    await renderReady(<CmMap onPick={onPick} />);
    h.state.mapListeners.click?.({ latlng: { lat: -23.5, lng: -46.6 } });
    expect(onPick).toHaveBeenCalledWith({ lat: -23.5, lng: -46.6 });
  });

  it("renders a draggable pick pin for value and reports drags", async () => {
    const onPick = vi.fn();
    await renderReady(<CmMap value={{ lat: -23.5, lng: -46.6 }} onPick={onPick} />);
    await waitFor(() => expect(h.state.markers).toHaveLength(1));
    const pick = h.state.markers[0];
    expect(pick.options.draggable).toBe(true);
    expect((pick.options.icon as { html: string }).html).toContain("cm-map__pin--pick");
    pick.listeners.dragend?.();
    expect(onPick).toHaveBeenCalledWith({ lat: -23.5, lng: -46.6 });
  });

  it("recenters the map when the controlled center changes", async () => {
    const { rerender } = await renderReady(<CmMap center={{ lat: 1, lng: 2 }} />);
    rerender(<CmMap center={{ lat: 3, lng: 4 }} />);
    await waitFor(() => expect(h.mapInstance.setView).toHaveBeenCalledWith([3, 4], 13));
  });

  it("applies the height as a CSS variable on the root", async () => {
    const { container } = await renderReady(<CmMap height={480} data-testid="map" />);
    const root = container.querySelector<HTMLElement>(".cm-map");
    expect(root?.style.getPropertyValue("--cm-map-height")).toBe("480px");
  });

  it("cleans the map up on unmount", async () => {
    const { unmount } = await renderReady(<CmMap />);
    unmount();
    expect(h.mapInstance.remove).toHaveBeenCalled();
  });
});
