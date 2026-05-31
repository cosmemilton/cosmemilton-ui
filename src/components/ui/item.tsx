import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type CmItemProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
};

export const CmItem = forwardRef<HTMLElement, CmItemProps>(function CmItem(
  { title, description, meta, className, onClick, ...rest },
  ref,
) {
  const Element: ElementType = onClick ? "button" : "div";
  const elementProps: Record<string, unknown> = {
    ref,
    type: onClick ? "button" : undefined,
    onClick,
    className: cn("cm-item", onClick && "cm-item--interactive", className),
    ...rest,
  };
  return (
    <Element {...elementProps}>
      <div className="cm-item__body">
        <span className="cm-item__title">{title}</span>
        {description ? <span className="cm-item__description">{description}</span> : null}
      </div>
      {meta ? <span className="cm-item__meta">{meta}</span> : null}
    </Element>
  );
});
CmItem.displayName = "CmItem";
