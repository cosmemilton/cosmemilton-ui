import React from "react";

// O runtime JSX automático distribuído pelo React é versionado junto com o
// pacote. O bundle global precisa funcionar com o React fornecido pela página,
// então convertemos JSX para a API pública e estável React.createElement.
export const Fragment = React.Fragment;

export function jsx(type, props, key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}

export const jsxs = jsx;
export const jsxDEV = jsx;
