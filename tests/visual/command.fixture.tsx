import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CmCommand } from "../../src/components/ui/command.js";
import { CmTopbar } from "../../src/components/ui/topbar.js";
import { CmBox } from "../../src/components/ui/box.js";
import { CmText } from "../../src/components/ui/text.js";
import { CmThemeProvider } from "../../src/components/theme/theme-provider.js";

function Fixture() {
  const [selected, setSelected] = useState("");
  return (
    <CmThemeProvider storageKey={false}>
      <CmBox minHeight={900}>
        <CmTopbar
          tone="glass"
          height={56}
          mobileLayout="inline"
          start={<CmText>Biblioteca</CmText>}
          center={
            <CmBox width="100%" maxWidth={640}>
              <CmCommand
                title="Buscar na documentação"
                description="Componentes, recursos e guias em um só lugar."
                placeholder="Pesquisar comandos"
                triggerAppearance="input"
                triggerPlaceholder="Buscar na documentação…"
                size="sm"
                keyboardShortcut="k"
                items={Array.from({ length: 80 }, (_, index) => ({
                  id: String(index),
                  label: index === 0 ? "Ícones" : `Componente ${index + 1}`,
                  onSelect: () => setSelected(String(index)),
                }))}
              />
            </CmBox>
          }
        />
        <CmText role="status">
          {selected ? `Selecionado: ${selected}` : "Nenhum comando selecionado"}
        </CmText>
      </CmBox>
    </CmThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
