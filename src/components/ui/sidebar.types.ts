import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
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

export type CmSidebarProps = {
  groups: CmSidebarGroup[];
  brand?: CmSidebarBrand;
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
