import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { CmButton } from "./button.js";
import { cn } from "../../lib/utils.js";

export type CmEmptyProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export const CmEmpty = forwardRef<HTMLDivElement, CmEmptyProps>(function CmEmpty(
  { title, description, icon, actionLabel, onAction, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn("cm-empty", className)} {...rest}>
      {icon ? <div className="cm-empty__icon">{icon}</div> : null}
      <h3 className="cm-empty__title">{title}</h3>
      {description ? <p className="cm-empty__description">{description}</p> : null}
      {actionLabel ? (
        <CmButton onClick={onAction} variant="solid" tone="primary">
          {actionLabel}
        </CmButton>
      ) : null}
    </div>
  );
});
CmEmpty.displayName = "CmEmpty";
