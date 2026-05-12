import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type CmMenubarItem = {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

export type CmMenubarProps = {
  items: CmMenubarItem[];
  className?: string;
  trailing?: ReactNode;
  "aria-label"?: string;
};

export function CmMenubar({
  items,
  trailing,
  className,
  "aria-label": ariaLabel = "Ações de navegação",
}: CmMenubarProps) {
  return (
    <div
      className={cn(
        "cm-menubar",
        className,
      )}
    >
      <nav className="cm-menubar__nav" aria-label={ariaLabel}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.active ? "page" : undefined}
            disabled={item.disabled}
            onClick={item.onClick}
            className={cn(
              "cm-menubar__item",
              item.active && "cm-menubar__item--active",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {trailing ? <div className="cm-menubar__trailing">{trailing}</div> : null}
    </div>
  );
}
