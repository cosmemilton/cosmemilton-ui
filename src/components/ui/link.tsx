import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils.js";

type LinkVariant = "default" | "card" | "quiet" | "button";
type LinkTone = "default" | "primary" | "muted";

type CmLinkBaseProps = Omit<ComponentPropsWithoutRef<"a">, "children" | "href"> & {
  children: ReactNode;
  href: string;
  linkComponent?: ElementType<ComponentPropsWithoutRef<"a"> & { href: string }>;
  variant?: LinkVariant;
  tone?: LinkTone;
  active?: boolean;
};

export type CmLinkProps = CmLinkBaseProps;

export function CmLink({
  active = false,
  children,
  className,
  href,
  linkComponent,
  tone = "default",
  variant = "default",
  ...props
}: CmLinkProps) {
  const Component = linkComponent ?? "a";

  return (
    <Component
      className={cn(
        "cm-link",
        `cm-link--${variant}`,
        `cm-link--tone-${tone}`,
        active && "cm-link--active",
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Component>
  );
}
CmLink.displayName = "CmLink";
