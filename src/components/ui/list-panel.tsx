import type { ReactNode } from "react";
import { CmCard } from "./card.js";
import { CmGridContainer } from "./grid.js";
import { CmStack } from "./layout.js";
import { CmSectionHeader } from "./section-header.js";

export type CmListPanelProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  filterLabel?: string;
  children: ReactNode;
};

export function CmListPanel({
  title,
  description,
  actions,
  filters,
  filterLabel,
  children,
}: CmListPanelProps) {
  return (
    <CmCard
      bodyPadding="md"
      header={<CmSectionHeader title={title} description={description} actions={actions} />}
    >
      <CmStack gap="md">
        {filters && (
          <CmGridContainer
            preset="filters"
            spacing="md"
            role="group"
            aria-label={filterLabel ?? title}
          >
            {filters}
          </CmGridContainer>
        )}
        {children}
      </CmStack>
    </CmCard>
  );
}
CmListPanel.displayName = "CmListPanel";
