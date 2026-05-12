import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ItemProps = {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function CmItem({ title, description, meta, className, onClick }: ItemProps) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "cm-item",
        onClick && "cm-item--interactive",
        className,
      )}
    >
      <div className="cm-item__body">
        <span className="cm-item__title">
          {title}
        </span>
        {description ? (
          <span className="cm-item__description">{description}</span>
        ) : null}
      </div>
      {meta ? <span className="cm-item__meta">{meta}</span> : null}
    </Element>
  );
}
