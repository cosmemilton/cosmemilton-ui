import Link from "next/link";
import { cn } from "../../lib/utils";

export type CmBreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbProps = {
  items: CmBreadcrumbItem[];
  className?: string;
};

export function CmBreadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={cn("cm-breadcrumb", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="cm-breadcrumb__item">
            {item.href && !isLast ? (
              <Link href={item.href} className="cm-breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "cm-breadcrumb__current")}>{item.label}</span>
            )}
            {!isLast ? <span className="cm-breadcrumb__separator">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
