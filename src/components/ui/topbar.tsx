import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { cmDensityClass, cmSizeValue, type CmDensity } from "./types.js";

type CmTopbarTone = "surface" | "brand" | "transparent";
type CmTopbarLayout = "balanced" | "start";
type CmTopbarMobileLayout = "stack" | "inline";
type CmTopbarSectionAlign = "start" | "center" | "end" | "stretch";

type CmTopbarStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

export type CmTopbarProps = HTMLAttributes<HTMLElement> & {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  title?: ReactNode;
  density?: CmDensity;
  tone?: CmTopbarTone;
  layout?: CmTopbarLayout;
  mobileLayout?: CmTopbarMobileLayout;
  startAlign?: CmTopbarSectionAlign;
  centerAlign?: CmTopbarSectionAlign;
  endAlign?: CmTopbarSectionAlign;
  sticky?: boolean;
  bordered?: boolean;
  height?: string | number;
};

export const CmTopbar = forwardRef<HTMLElement, CmTopbarProps>(function CmTopbar(
  {
    bordered = true,
    center,
    children,
    className,
    centerAlign,
    density,
    end,
    endAlign,
    height,
    layout = "balanced",
    mobileLayout = "stack",
    start,
    startAlign,
    sticky = false,
    style,
    title,
    tone = "surface",
    ...props
  },
  ref,
) {
  const topbarStyle: CmTopbarStyle = {
    ...(height ? { "--cm-topbar-height": cmSizeValue(height) } : {}),
    ...style,
  };

  return (
    <header
      ref={ref}
      className={cn(
        "cm-topbar",
        `cm-topbar--tone-${tone}`,
        `cm-topbar--layout-${layout}`,
        `cm-topbar--mobile-${mobileLayout}`,
        sticky && "cm-topbar--sticky",
        bordered && "cm-topbar--bordered",
        cmDensityClass(density),
        className,
      )}
      style={topbarStyle}
      {...props}
    >
      <div
        className={cn(
          "cm-topbar__section cm-topbar__section--start",
          startAlign && `cm-topbar__section--align-${startAlign}`,
        )}
      >
        {start}
        {title ? <div className="cm-topbar__title">{title}</div> : null}
      </div>
      {center ? (
        <div
          className={cn(
            "cm-topbar__section cm-topbar__section--center",
            centerAlign && `cm-topbar__section--align-${centerAlign}`,
          )}
        >
          {center}
        </div>
      ) : null}
      {(end || children) ? (
        <div
          className={cn(
            "cm-topbar__section cm-topbar__section--end",
            endAlign && `cm-topbar__section--align-${endAlign}`,
          )}
        >
          {end}
          {children}
        </div>
      ) : null}
    </header>
  );
});
CmTopbar.displayName = "CmTopbar";
