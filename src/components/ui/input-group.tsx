import { forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type InputGroupProps = {
  prefix?: ReactNode;
  suffix?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const CmInputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  function CmInputGroup({ prefix, suffix, children, className }, ref) {
  return (
    <div ref={ref} className={cn("cm-input-group", className)}>
      {prefix ? (
        <span className="cm-input-group__addon">
          {prefix}
        </span>
      ) : null}
      <div className="cm-input-group__control">
        {children}
      </div>
      {suffix ? (
        <span className="cm-input-group__addon">
          {suffix}
        </span>
      ) : null}
    </div>
  );
});
CmInputGroup.displayName = "CmInputGroup";
