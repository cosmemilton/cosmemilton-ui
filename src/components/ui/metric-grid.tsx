import type { HTMLAttributes } from "react";
import { CmGridContainer } from "./grid.js";
import type { CmResponsiveNumber } from "./types.js";

export type CmMetricGridProps = HTMLAttributes<HTMLElement> & {
  label: string;
  columns?: CmResponsiveNumber;
};

/** Responsive group for related indicators, named for assistive technology. */
export function CmMetricGrid({
  label,
  columns = { base: 1, sm: 2, xl: 4 },
  children,
  ...props
}: CmMetricGridProps) {
  return (
    <CmGridContainer as="section" aria-label={label} columns={columns} spacing="md" {...props}>
      {children}
    </CmGridContainer>
  );
}
CmMetricGrid.displayName = "CmMetricGrid";
