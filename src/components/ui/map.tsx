"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils.js";
import { cmSizeValue, type CmTone } from "./types.js";

/* Tipos do Leaflet só em posições internas (nunca em declarações exportadas),
   para o d.ts publicado não depender de @types/leaflet — o peer é opcional. */
type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;

export type CmMapPosition = {
  lat: number;
  lng: number;
};

export type CmMapMarker = {
  id: string | number;
  position: CmMapPosition;
  /** Nome acessível do pin (title/alt) e texto do tooltip nativo. */
  label?: string;
  /** Conteúdo React do popup aberto ao clicar no pin. */
  popup?: ReactNode;
  /** Tom do pin, mapeado para os tokens de cor do tema. Padrão `primary`. Ignorado quando `color` é definido. */
  tone?: CmTone;
  /**
   * Cor livre do pin (qualquer valor CSS de cor: hex, rgb(), var(...), nome).
   * Sobrepõe `tone` — use para reaproveitar cores cadastradas em entidades de domínio.
   */
  color?: string;
};

export type CmMapProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Centro inicial. Sem `center`, o mapa enquadra os `markers` (ou mostra o Brasil). */
  center?: CmMapPosition;
  /** Zoom inicial. Padrão `13` (ou `4` no enquadramento-país sem center/markers). */
  zoom?: number;
  markers?: CmMapMarker[];
  /** Reenquadra o mapa nos markers quando eles mudam. Padrão: `true` quando não há `center`. */
  fitMarkers?: boolean;
  /** Coordenada selecionada (modo picker) — exibida como pin destacado e arrastável. */
  value?: CmMapPosition | null;
  /** Clique no mapa (ou arraste do pin de seleção). Habilita o modo picker. */
  onPick?: (position: CmMapPosition) => void;
  onMarkerClick?: (marker: CmMapMarker) => void;
  /** Altura do mapa (px ou CSS). Padrão `320`. */
  height?: number | string;
  /** URL dos tiles. Padrão: OpenStreetMap. */
  tileUrl?: string;
  /** Atribuição exibida sobre o mapa. Padrão: créditos do OpenStreetMap. */
  tileAttribution?: string;
  /** Zoom máximo dos tiles. Padrão `19`. */
  maxZoom?: number;
  /** Zoom com a roda do mouse. Padrão `true`. */
  scrollWheelZoom?: boolean;
  /**
   * Escurece os tiles automaticamente quando o tema resolve para dark
   * (via `color-scheme` dos tokens). Desligue ao usar um `tileUrl` já escuro.
   * Padrão `true`.
   */
  darkTiles?: boolean;
  /** Instância crua do Leaflet (`L.Map`) após a criação — escape hatch. Faça cast para `L.Map`. */
  onReady?: (map: unknown) => void;
};

const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
/** Enquadramento neutro quando não há center nem markers. */
const BRAZIL_CENTER: CmMapPosition = { lat: -14.235, lng: -51.9253 };

/* Default estável: um `[]` inline como default de prop teria identidade nova a
   cada render e faria o efeito de markers rodar (e re-renderizar) em loop. */
const NO_MARKERS: CmMapMarker[] = [];

let leafletPromise: Promise<LeafletModule> | null = null;

function loadLeaflet() {
  leafletPromise ??= import("leaflet").then(
    (mod) => ((mod as { default?: LeafletModule }).default ?? mod) as LeafletModule,
  );
  return leafletPromise;
}

function createPinIcon(L: LeafletModule, tone: CmTone = "primary", pick = false) {
  return L.divIcon({
    className: "cm-map__pin-anchor",
    html: `<span class="cm-map__pin cm-map__pin--tone-${tone}${pick ? " cm-map__pin--pick" : ""}"></span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 32],
    popupAnchor: [0, -30],
  });
}

type CmMapStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export const CmMap = forwardRef<HTMLDivElement, CmMapProps>(function CmMap(
  {
    center,
    zoom,
    markers = NO_MARKERS,
    fitMarkers,
    value = null,
    onPick,
    onMarkerClick,
    height = 320,
    tileUrl = DEFAULT_TILE_URL,
    tileAttribution = DEFAULT_ATTRIBUTION,
    maxZoom = 19,
    scrollWheelZoom = true,
    darkTiles = true,
    onReady,
    className,
    style,
    ...rest
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [popupContainers, setPopupContainers] = useState<Record<string, HTMLElement>>({});
  const [isDark, setIsDark] = useState(false);

  const shouldFitMarkers = fitMarkers ?? (center === undefined && markers.length > 0);
  const initialCenter = center ?? markers[0]?.position ?? BRAZIL_CENTER;
  const initialZoom = zoom ?? (center === undefined && markers.length === 0 ? 4 : 13);

  /* Callbacks em refs: os efeitos de mapa/markers não devem recriar camadas
     quando só a identidade do handler muda entre renders. */
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  /* Criação do mapa. O Leaflet acessa `window` no escopo do módulo, então o
     import é dinâmico e só roda no cliente — o entry /map continua SSR-safe. */
  useEffect(() => {
    let disposed = false;

    loadLeaflet()
      .then((L) => {
        if (disposed || !containerRef.current) return;
        leafletRef.current = L;
        const map = L.map(containerRef.current, {
          center: [initialCenter.lat, initialCenter.lng],
          zoom: initialZoom,
          scrollWheelZoom,
        });
        L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom }).addTo(map);
        map.on("click", (event) => {
          const { lat, lng } = event.latlng;
          onPickRef.current?.({ lat, lng });
        });
        mapRef.current = map;

        const pane = containerRef.current.querySelector(".leaflet-pane");
        if (pane && getComputedStyle(pane).position !== "absolute") {
          console.warn(
            'CmMap: o CSS do Leaflet não foi carregado. Importe "leaflet/dist/leaflet.css" no layout raiz.',
          );
        }

        setStatus("ready");
        onReadyRef.current?.(map);
      })
      .catch((error) => {
        if (disposed) return;
        console.error(
          'CmMap: não foi possível carregar o peer opcional "leaflet". ' +
            'Instale com `npm install leaflet` e importe "leaflet/dist/leaflet.css" no layout raiz.',
          error,
        );
        setStatus("error");
      });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setStatus("loading");
    };
    // Opções iniciais: mudanças pós-mount são aplicadas pelos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Mantém o mapa correto dentro de layouts que redimensionam (drawer, splits). */
  useEffect(() => {
    if (status !== "ready" || typeof ResizeObserver === "undefined") return;
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [status]);

  /* center/zoom controlados após a criação. */
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map || !center) return;
    map.setView([center.lat, center.lng], zoom ?? map.getZoom());
  }, [status, center?.lat, center?.lng, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    if (scrollWheelZoom) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [status, scrollWheelZoom]);

  /* Markers: recriados como um layer group a cada mudança da lista. Os popups
     recebem um container vazio; o ReactNode entra via portal (abaixo). */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (status !== "ready" || !L || !map) return;

    const layer = L.layerGroup().addTo(map);
    const containers: Record<string, HTMLElement> = {};

    for (const marker of markers) {
      const instance = L.marker([marker.position.lat, marker.position.lng], {
        icon: createPinIcon(L, marker.tone),
        title: marker.label,
        alt: marker.label ?? `Marcador ${marker.id}`,
      }).addTo(layer);
      /* Setado via CSSOM (não concatenado no html do divIcon) para aceitar cor
         livre do consumidor sem abrir um vetor de injeção de HTML/atributo. */
      if (marker.color) {
        instance
          .getElement()
          ?.querySelector<HTMLElement>(".cm-map__pin")
          ?.style.setProperty("--cm-map-pin-color", marker.color);
      }
      if (marker.popup !== undefined) {
        const container = document.createElement("div");
        container.className = "cm-map__popup";
        instance.bindPopup(container);
        containers[String(marker.id)] = container;
      }
      instance.on("click", () => onMarkerClickRef.current?.(marker));
    }

    if (shouldFitMarkers && markers.length > 0) {
      map.fitBounds(
        L.latLngBounds(markers.map((marker) => [marker.position.lat, marker.position.lng])),
        { padding: [24, 24], maxZoom: 16 },
      );
    }

    setPopupContainers((previous) => {
      const previousKeys = Object.keys(previous);
      const nextKeys = Object.keys(containers);
      const unchanged =
        previousKeys.length === nextKeys.length &&
        nextKeys.every((key) => previous[key] === containers[key]);
      return unchanged ? previous : containers;
    });
    return () => {
      layer.remove();
    };
  }, [status, markers, shouldFitMarkers]);

  /* Pin de seleção (modo picker): destacado, arrastável quando há onPick. */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (status !== "ready" || !L || !map || !value) return;

    const pick = L.marker([value.lat, value.lng], {
      icon: createPinIcon(L, "primary", true),
      draggable: Boolean(onPickRef.current),
      title: "Local selecionado",
      alt: "Local selecionado",
      zIndexOffset: 1000,
    }).addTo(map);
    pick.on("dragend", () => {
      const position = pick.getLatLng();
      onPickRef.current?.({ lat: position.lat, lng: position.lng });
    });

    return () => {
      pick.remove();
    };
  }, [status, value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Tema: segue o `color-scheme` resolvido dos tokens (funciona com temas
     white-label) e reage à troca de tema via atributos do <html>. */
  useEffect(() => {
    if (!darkTiles) {
      setIsDark(false);
      return;
    }
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const schemes = (getComputedStyle(root).colorScheme ?? "").split(/\s+/);
      const dark = schemes.includes("dark") && (!schemes.includes("light") || media.matches);
      setIsDark(dark);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, [darkTiles]);

  const rootStyle: CmMapStyle = {
    "--cm-map-height": cmSizeValue(height),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cn("cm-map", isDark && "cm-map--dark", className)}
      style={rootStyle}
      {...rest}
    >
      <div ref={containerRef} className="cm-map__canvas" />
      {status !== "ready" ? (
        <div className="cm-map__status" role="status">
          {status === "loading"
            ? "Carregando mapa…"
            : 'Mapa indisponível — instale a dependência opcional "leaflet".'}
        </div>
      ) : null}
      {markers.map((marker) => {
        const container = popupContainers[String(marker.id)];
        if (marker.popup === undefined || !container) return null;
        return createPortal(marker.popup, container, String(marker.id));
      })}
    </div>
  );
});
CmMap.displayName = "CmMap";
