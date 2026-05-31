import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmPageHeaderProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  density?: CmDensity;
  align?: "start" | "center";
};

export const CmPageHeader = forwardRef<HTMLElement, CmPageHeaderProps>(function CmPageHeader(
  {
    actions,
    align = "start",
    className,
    density,
    description,
    eyebrow,
    icon,
    meta,
    title,
    ...props
  },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cn(
        "cm-page-header",
        `cm-page-header--align-${align}`,
        cmDensityClass(density),
        className,
      )}
      {...props}
    >
      {icon ? <div className="cm-page-header__icon">{icon}</div> : null}
      <div className="cm-page-header__content">
        {eyebrow || meta ? (
          <div className="cm-page-header__overline">
            {eyebrow ? <span className="cm-page-header__eyebrow">{eyebrow}</span> : null}
            {meta ? <div className="cm-page-header__meta">{meta}</div> : null}
          </div>
        ) : null}
        <h1 className="cm-page-header__title">{title}</h1>
        {description ? <p className="cm-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="cm-page-header__actions">{actions}</div> : null}
    </header>
  );
});
CmPageHeader.displayName = "CmPageHeader";
