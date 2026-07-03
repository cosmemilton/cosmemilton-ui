// Entry dedicado — `cosmemilton-ui/map`.
//
// O CmMap depende do peer OPCIONAL `leaflet`; num entry separado, o bundler só
// resolve o leaflet para quem de fato importa o mapa (a mesma lição do
// @iconify/react no entry /client: dependência no grafo vira dependência
// obrigatória). Requisitos do consumidor:
//   npm install leaflet
//   import "leaflet/dist/leaflet.css";  // no layout raiz
export * from "./components/ui/map.js";
