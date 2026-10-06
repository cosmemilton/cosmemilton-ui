import { createRoot } from "react-dom/client";
import { CmThemeProvider } from "../../src/components/theme/theme-provider.js";
import { CmButton } from "../../src/components/ui/button.js";
import { CmRow, CmStack } from "../../src/components/ui/layout.js";
import { CmText } from "../../src/components/ui/text.js";
import type { CmTone } from "../../src/components/ui/types.js";

const params = new URLSearchParams(location.search);
const themeName = params.get("theme") ?? "cm-v4-light";
const skin = params.get("skin") === "horizonte" ? "horizonte" : "classic";
const tones: CmTone[] = [
  "default",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
];

createRoot(document.getElementById("root")!).render(
  <CmThemeProvider themeName={themeName} skin={skin} storageKey={false}>
    <CmStack as="main" surface="card" gap="lg" padding="lg">
      <CmText as="h1" size="2xl">
        Botões suaves com contraste
      </CmText>
      {tones.map((tone) => (
        <CmRow key={tone} gap="md" wrap>
          <CmButton tone={tone} variant="soft" data-tone={tone} data-state="rest">
            Suave {tone}
          </CmButton>
          <CmButton tone={tone} variant="soft" active data-tone={tone} data-state="selected">
            Ativo {tone}
          </CmButton>
        </CmRow>
      ))}
    </CmStack>
  </CmThemeProvider>,
);
