"use client";

import { Check, ChevronDown, Palette } from "lucide-react";
import { useCmTheme } from "./theme-provider.js";
import type { ThemeConfig } from "../../lib/theme/index.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "../ui/button.js";
import { CmDropdownMenu } from "../ui/dropdown-menu.js";

export type CmThemeTogglePresentation = "default" | "compact";

export type CmThemeToggleProps = {
  className?: string;
  presentation?: CmThemeTogglePresentation;
  align?: "start" | "center" | "end";
  getThemeLabel?: (theme: ThemeConfig) => string;
};

const defaultGetThemeLabel = (theme: ThemeConfig) => theme.name.replace(/^cm-/, "");

export function CmThemeToggle({
  align = "end",
  className,
  getThemeLabel = defaultGetThemeLabel,
  presentation = "default",
}: CmThemeToggleProps) {
  const { theme, themes, setThemeByName } = useCmTheme();
  const themeOptions = Object.values(themes);

  if (presentation === "compact") {
    return (
      <CmDropdownMenu
        align={align}
        trigger={({ open, toggle, ref }) => (
          <CmButton
            ref={ref}
            type="button"
            variant="surface"
            tone="primary"
            size="sm"
            shape="pill"
            icon={<Palette size={16} />}
            trailingIcon={<ChevronDown size={16} />}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={toggle}
            className={cn("cm-theme-toggle-compact", className)}
          >
            {getThemeLabel(theme)}
          </CmButton>
        )}
        items={themeOptions.map((candidate) => ({
          id: candidate.name,
          label: getThemeLabel(candidate),
          icon: candidate.name === theme.name ? <Check size={16} /> : undefined,
          shortcut: candidate.name === theme.name ? "Atual" : undefined,
          onSelect: () => setThemeByName(candidate.name),
        }))}
      />
    );
  }

  return (
    <div className={cn("cm-theme-toggle", className)}>
      <span className="cm-theme-toggle-label">
        Tema atual: {getThemeLabel(theme)}
      </span>
      <div className="cm-theme-toggle-options">
        {themeOptions.map((candidate) => (
          <CmButton
            key={candidate.name}
            type="button"
            variant="ghost"
            tone="primary"
            size="sm"
            shape="pill"
            aria-current={candidate.name === theme.name ? "true" : undefined}
            onClick={() => setThemeByName(candidate.name)}
            className={cn(
              "cm-theme-toggle-option",
              candidate.name === theme.name && "cm-theme-toggle-option-active",
            )}
          >
            {getThemeLabel(candidate)}
          </CmButton>
        ))}
      </div>
    </div>
  );
}
