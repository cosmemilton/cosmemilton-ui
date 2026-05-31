import { forwardRef, type ReactNode } from "react";
import { CmButton } from "./button.js";
import { cn } from "../../lib/utils.js";

type EmptyProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export const CmEmpty = forwardRef<HTMLDivElement, EmptyProps>(function CmEmpty(
  { title, description, icon, actionLabel, onAction, className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "cm-empty",
        className,
      )}
    >
      {icon ? <div className="cm-empty__icon">{icon}</div> : null}
      <h3 className="cm-empty__title">{title}</h3>
      {description ? (
        <p className="cm-empty__description">{description}</p>
      ) : null}
      {actionLabel ? (
        <CmButton onClick={onAction} variant="solid" tone="primary">
          {actionLabel}
        </CmButton>
      ) : null}
    </div>
  );
});
CmEmpty.displayName = "CmEmpty";
