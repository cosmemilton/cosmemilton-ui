import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils.js";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  optional?: boolean;
};

export const CmLabel = forwardRef<HTMLLabelElement, LabelProps>(({ className, optional, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("cm-label", className)}
    {...props}
  >
    <span className="cm-label__text">{children}</span>
    {optional ? <span className="cm-label__optional">(opcional)</span> : null}
  </label>
));

CmLabel.displayName = "CmLabel";
