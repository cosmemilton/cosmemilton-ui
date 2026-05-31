import type { ReactNode } from "react";

/** Inicial maiúscula de um label textual; cai no `fallback` se não for string. */
export function getInitial(label: ReactNode, fallback = "M") {
  return typeof label === "string" && label.trim()
    ? label.trim().charAt(0).toUpperCase()
    : fallback;
}

/** Pathname atual do browser, ou string vazia em ambiente sem `window` (SSR). */
export function getBrowserPathname() {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

/** Remove query/hash e barras finais para comparação estável de rotas. */
export function normalizePathname(pathname: string | undefined) {
  if (!pathname) return "";
  return pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}
