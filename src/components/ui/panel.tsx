import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
import { CmCard, type CmCardProps } from "./card.js";
import { CmSectionHeader, type CmSectionHeaderProps } from "./section-header.js";

export type CmPanelProps = Omit<CmCardProps, "title" | "header"> &
  Pick<CmSectionHeaderProps, "description" | "icon" | "actions" | "headingLevel"> & {
    title: string;
  };

export const CmPanel = forwardRef<HTMLDivElement, CmPanelProps>(function CmPanel(
  {
    title,
    description,
    icon,
    actions,
    headingLevel,
    className,
    role = "region",
    "aria-label": label,
    "aria-labelledby": labelledBy,
    ...props
  },
  ref,
) {
  return (
    <CmCard
      {...props}
      ref={ref}
      className={cn("cm-panel", className)}
      role={role}
      aria-label={label ?? (labelledBy ? undefined : title)}
      aria-labelledby={labelledBy}
      header={
        <CmSectionHeader
          title={title}
          description={description}
          icon={icon}
          actions={actions}
          headingLevel={headingLevel}
        />
      }
    />
  );
});
CmPanel.displayName = "CmPanel";
