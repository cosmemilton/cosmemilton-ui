"use client";

import { Check, ChevronDown, Palette } from "lucide-react";
import { useCmTheme } from "./theme-provider.js";
import type { ThemeConfig } from "../../lib/theme/index.js";
import { cn } from "../../lib/utils.js";
import { CmButton } from "../ui/button.js";
import { CmDropdownMenu } from "../ui/dropdown-menu.js";

export type CmThemeTogglePresentation = "default" | "compact";
export type CmThemeToggleLabelVisibility = "always" | "desktop" | "hidden";
export type CmThemeToggleThemeOption =
  | string
  | {
      name: string;
      label?: string;
    };

export type CmThemeToggleProps = {
  className?: string;
  presentation?: CmThemeTogglePresentation;
  labelVisibility?: CmThemeToggleLabelVisibility;
  align?: "start" | "center" | "end";
  getThemeLabel?: (theme: ThemeConfig) => string;
  themes?: CmThemeToggleThemeOption[];
};

const defaultGetThemeLabel = (theme: ThemeConfig) => theme.name.replace(/^cm-/, "");

function resolveThemeOptions(
  registry: Record<string, ThemeConfig>,
  allowedThemes: CmThemeToggleThemeOption[] | undefined,
  getThemeLabel: (theme: ThemeConfig) => string,
) {
  if (!allowedThemes?.length) {
    return Object.values(registry).map((theme) => ({
      theme,
      label: getThemeLabel(theme),
    }));
  }

  return allowedThemes
    .map((option) => {
      const name = typeof option === "string" ? option : option.name;
      const theme = registry[name];
      if (!theme) return null;

      return {
        theme,
        label: typeof option === "string" ? getThemeLabel(theme) : option.label ?? getThemeLabel(theme),
      };
    })
    .filter((option): option is { theme: ThemeConfig; label: string } => Boolean(option));
}

export function CmThemeToggle({
  align = "end",
  className,
  getThemeLabel = defaultGetThemeLabel,
  labelVisibility = "always",
  presentation = "default",
  themes: allowedThemes,
}: CmThemeToggleProps) {
  const { theme, themes, setThemeByName } = useCmTheme();
  const themeOptions = resolveThemeOptions(themes, allowedThemes, getThemeLabel);
  const currentThemeLabel = getThemeLabel(theme);

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
            aria-label={`Selecionar tema: ${currentThemeLabel}`}
            onClick={toggle}
            className={cn(
              "cm-theme-toggle-compact",
              `cm-theme-toggle-compact--label-${labelVisibility}`,
              className,
            )}
          >
            <span className="cm-theme-toggle-compact__label">
              {currentThemeLabel}
            </span>
          </CmButton>
        )}
        items={themeOptions.map((candidate) => ({
          id: candidate.theme.name,
          label: candidate.label,
          icon: candidate.theme.name === theme.name ? <Check size={16} /> : undefined,
          shortcut: candidate.theme.name === theme.name ? "Atual" : undefined,
          onSelect: () => setThemeByName(candidate.theme.name),
        }))}
      />
    );
  }

  return (
    <div className={cn("cm-theme-toggle", className)}>
      <span className="cm-theme-toggle-label">
        Tema atual: {currentThemeLabel}
      </span>
      <div className="cm-theme-toggle-options">
        {themeOptions.map((candidate) => (
          <CmButton
            key={candidate.theme.name}
            type="button"
            variant="ghost"
            tone="primary"
            size="sm"
            shape="pill"
            aria-current={candidate.theme.name === theme.name ? "true" : undefined}
            onClick={() => setThemeByName(candidate.theme.name)}
            className={cn(
              "cm-theme-toggle-option",
              candidate.theme.name === theme.name && "cm-theme-toggle-option-active",
            )}
          >
            {candidate.label}
          </CmButton>
        ))}
      </div>
    </div>
  );
}

export function CmThemeMenu(props: Omit<CmThemeToggleProps, "presentation">) {
  return <CmThemeToggle presentation="compact" {...props} />;
}
