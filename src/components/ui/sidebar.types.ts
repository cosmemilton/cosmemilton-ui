import type { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { CmDensity } from "./types.js";

export type CmSidebarItem = {
  id: string;
  label: string;
  href?: string;
  to?: string;
  icon?: ReactNode;
  active?: boolean;
  isActive?: (context: CmSidebarActiveContext) => boolean;
  disabled?: boolean;
  badge?: ReactNode;
  onSelect?: (item: CmSidebarItem) => void;
};

export type CmSidebarLinkBaseProps = Omit<ComponentPropsWithoutRef<"a">, "href">;

export type CmSidebarHrefLinkComponentProps = CmSidebarLinkBaseProps & {
  href: string;
  to?: string;
};

export type CmSidebarToLinkComponentProps = CmSidebarLinkBaseProps & {
  href?: string;
  to: string;
};

export type CmSidebarLinkComponentProps =
  | CmSidebarHrefLinkComponentProps
  | CmSidebarToLinkComponentProps;

export type CmSidebarLinkComponent =
  | ElementType<CmSidebarHrefLinkComponentProps>
  | ElementType<CmSidebarToLinkComponentProps>;

export type CmSidebarGroup = {
  id: string;
  label: string;
  icon?: ReactNode;
  items: CmSidebarItem[];
  active?: boolean;
  defaultOpen?: boolean;
  direct?: boolean;
};

export type CmSidebarActiveContext = {
  item: CmSidebarItem;
  group: CmSidebarGroup;
  pathname: string;
};

export type CmSidebarBrand = {
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  fallbackTitle?: string;
  iconLabel?: string;
};

export type CmSidebarRail = "connectors" | "edge" | "chip";

export type CmSidebarProps = {
  groups: CmSidebarGroup[];
  brand?: CmSidebarBrand;
  /** Conteúdo logo após as opções de menu, dentro da área rolável (ex.: switcher de projetos). */
  belowGroups?: ReactNode;
  /** Desenha uma linha divisória (alinhada aos itens) entre o menu e `belowGroups`. Padrão `false`. */
  belowGroupsDivider?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  navLabel?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  openGroupId?: string | null;
  defaultOpenGroupId?: string | null;
  onOpenGroupChange?: (groupId: string | null) => void;
  activePathname?: string;
  linkComponent?: CmSidebarLinkComponent;
  isActive?: (context: CmSidebarActiveContext) => boolean;
  autoCollapse?: boolean;
  autoCollapseBelow?: number;
  tone?: "surface" | "brand" | "neutral";
  /**
   * Estilo do trilho vertical dos subitens.
   * - `"connectors"` (padrão): segmentos entre um ícone/marcador e o outro; a linha nunca cruza o glifo.
   * - `"edge"`: linha contínua encostada à esquerda do painel, antes dos ícones; o trecho do item ativo acende.
   * - `"chip"`: linha contínua ao centro; cada ícone ganha uma pastilha opaca que passa por cima dela.
   */
  rail?: CmSidebarRail;
  density?: CmDensity;
  width?: string | number;
  collapsedWidth?: string | number;
  contentPadding?: string | number;
  minHeight?: string | number;
  groupItemsMaxHeight?: string | number;
  lastGroupItemsMaxHeight?: string | number;
  standalone?: boolean;
  style?: CSSProperties;
};
