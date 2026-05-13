import { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

type InputGroupProps = {
  prefix?: ReactNode;
  suffix?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CmInputGroup({ prefix, suffix, children, className }: InputGroupProps) {
  return (
    <div className={cn("cm-input-group", className)}>
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
}
