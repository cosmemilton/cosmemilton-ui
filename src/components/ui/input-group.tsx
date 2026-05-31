import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type CmInputGroupProps = HTMLAttributes<HTMLDivElement> & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  children: ReactNode;
};

export const CmInputGroup = forwardRef<HTMLDivElement, CmInputGroupProps>(function CmInputGroup(
  { prefix, suffix, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("cm-input-group", className)} {...rest}>
      {prefix ? <span className="cm-input-group__addon">{prefix}</span> : null}
      <div className="cm-input-group__control">{children}</div>
      {suffix ? <span className="cm-input-group__addon">{suffix}</span> : null}
    </div>
  );
});
CmInputGroup.displayName = "CmInputGroup";
