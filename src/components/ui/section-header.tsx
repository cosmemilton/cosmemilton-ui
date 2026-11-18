import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { CmIconBadge } from "./icon-badge.js";
import { CmRow } from "./layout.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmSectionHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  actions?: ReactNode;
  density?: CmDensity;
  bordered?: boolean;
  padded?: boolean;
};

export const CmSectionHeader = forwardRef<HTMLElement, CmSectionHeaderProps>(
  function CmSectionHeader(
    {
      actions,
      bordered = false,
      className,
      density,
      description,
      headingLevel = 2,
      icon,
      padded = false,
      title,
      ...props
    },
    ref,
  ) {
    const Heading = `h${headingLevel}` as const;
    const content = (
      <div className="cm-section-header__content">
        <Heading className="cm-section-header__title">{title}</Heading>
        {description ? <p className="cm-section-header__description">{description}</p> : null}
      </div>
    );

    return (
      <header
        ref={ref}
        className={cn(
          "cm-section-header",
          bordered && "cm-section-header--bordered",
          padded && "cm-section-header--padded",
          cmDensityClass(density),
          className,
        )}
        {...props}
      >
        {icon ? (
          <CmRow gap="sm" minWidth={0}>
            <CmIconBadge icon={icon} tone="primary" aria-hidden="true" />
            {content}
          </CmRow>
        ) : (
          content
        )}
        {actions ? <div className="cm-section-header__actions">{actions}</div> : null}
      </header>
    );
  },
);
CmSectionHeader.displayName = "CmSectionHeader";
