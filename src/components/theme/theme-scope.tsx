import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import type { CmDensity } from "../ui/types.js";
/** A static theme boundary. Portals use the document provider's theme. */
export type CmThemeScopeProps = HTMLAttributes<HTMLDivElement> & {
  themeName?: string;
  density?: CmDensity;
  children?: ReactNode;
};
export function CmThemeScope({
  themeName,
  density,
  children,
  className,
  ...props
}: CmThemeScopeProps) {
  return (
    <div
      className={cn("cm-theme-scope", className)}
      data-theme={themeName}
      data-density={density}
      {...props}
    >
      {children}
    </div>
  );
}
CmThemeScope.displayName = "CmThemeScope";
