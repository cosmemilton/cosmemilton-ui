"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "../../lib/utils";

const CmSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, style, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "cm-switch",
      className,
    )}
    style={
      {
        "--sw-checked": "var(--color-primary)",
        "--sw-unchecked":
          "color-mix(in srgb, var(--color-foreground) 25%, transparent)",
        ...style,
      } as React.CSSProperties
    }
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "cm-switch__thumb",
      )}
    />
  </SwitchPrimitives.Root>
));
CmSwitch.displayName = "CmSwitch";

export { CmSwitch };
