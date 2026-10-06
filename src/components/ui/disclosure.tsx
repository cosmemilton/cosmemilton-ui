import { forwardRef, type DetailsHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, type CmDensity } from "./types.js";

export type CmDisclosureProps = Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> & {
  title: ReactNode;
  meta?: ReactNode;
  defaultOpen?: boolean;
  density?: CmDensity;
  summaryProps?: HTMLAttributes<HTMLElement>;
};

/** Native disclosure: keyboard accessible, progressively enhanced, and state preserving. */
export const CmDisclosure = forwardRef<HTMLDetailsElement, CmDisclosureProps>(function CmDisclosure(
  {
    children,
    className,
    defaultOpen,
    density = "compact",
    meta,
    open,
    summaryProps,
    title,
    ...rest
  },
  ref,
) {
  return (
    <details
      ref={ref}
      className={cn("cm-disclosure", cmDensityClass(density), className)}
      open={open ?? defaultOpen}
      {...rest}
    >
      <summary {...summaryProps} className={cn("cm-disclosure__summary", summaryProps?.className)}>
        <span className="cm-disclosure__title">{title}</span>
        {meta ? <span className="cm-disclosure__meta">{meta}</span> : null}
      </summary>
      <div className="cm-disclosure__content">{children}</div>
    </details>
  );
});
CmDisclosure.displayName = "CmDisclosure";
