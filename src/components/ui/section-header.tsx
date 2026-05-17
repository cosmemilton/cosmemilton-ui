import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmSectionHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  density?: CmDensity;
  bordered?: boolean;
  padded?: boolean;
};

export function CmSectionHeader({
  actions,
  bordered = false,
  className,
  density,
  description,
  padded = false,
  title,
  ...props
}: CmSectionHeaderProps) {
  return (
    <header
      className={cn(
        "cm-section-header",
        bordered && "cm-section-header--bordered",
        padded && "cm-section-header--padded",
        cmDensityClass(density),
        className,
      )}
      {...props}
    >
      <div className="cm-section-header__content">
        <h2 className="cm-section-header__title">{title}</h2>
        {description ? (
          <p className="cm-section-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="cm-section-header__actions">{actions}</div> : null}
    </header>
  );
}
