"use client";

import { useCmTheme } from "./theme-provider";
import { cn } from "../../lib/utils";
import { CmButton } from "../ui/button";

export function CmThemeToggle({ className }: { className?: string }) {
  const { theme, themes, setThemeByName } = useCmTheme();

  return (
    <div className={cn("cm-theme-toggle", className)}>
      <span className="cm-theme-toggle-label">
        Tema atual: {theme.name.replace("cm-", "")}
      </span>
      <div className="cm-theme-toggle-options">
        {Object.values(themes).map((candidate) => (
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
            {candidate.name.replace("cm-", "")}
          </CmButton>
        ))}
      </div>
    </div>
  );
}
