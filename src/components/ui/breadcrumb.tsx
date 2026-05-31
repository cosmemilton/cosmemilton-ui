import { forwardRef, type ComponentType, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type CmBreadcrumbItem = {
  href?: string;
  label: ReactNode;
};

type CmLinkComponentProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export type CmBreadcrumbProps = {
  items: CmBreadcrumbItem[];
  className?: string;
  linkComponent?: ComponentType<CmLinkComponentProps>;
};

export const CmBreadcrumb = forwardRef<HTMLElement, CmBreadcrumbProps>(function CmBreadcrumb(
  { items, className, linkComponent: LinkComponent },
  ref,
) {
  return (
    <nav ref={ref} aria-label="breadcrumb" className={cn("cm-breadcrumb", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const key = typeof item.label === "string" ? item.label : (item.href ?? index);
        const linkClassName = "cm-breadcrumb__link";

        return (
          <span key={key} className="cm-breadcrumb__item">
            {item.href && !isLast ? (
              LinkComponent ? (
                <LinkComponent href={item.href} className={linkClassName}>
                  {item.label}
                </LinkComponent>
              ) : (
                <a href={item.href} className={linkClassName}>
                  {item.label}
                </a>
              )
            ) : (
              <span className={cn(isLast && "cm-breadcrumb__current")}>{item.label}</span>
            )}
            {!isLast ? <span className="cm-breadcrumb__separator">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
});
CmBreadcrumb.displayName = "CmBreadcrumb";
