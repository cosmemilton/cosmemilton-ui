import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CmThemeProvider } from "../../src/components/theme/theme-provider.js";
import { CmButton } from "../../src/components/ui/button.js";
import { CmDialog } from "../../src/components/ui/dialog.js";
import { CmDrawer } from "../../src/components/ui/drawer.js";
import { CmSidebar } from "../../src/components/ui/sidebar.js";
import { CmAppShell } from "../../src/components/ui/app-shell.js";

function FocusFixture() {
  const [open, setOpen] = useState(false);
  const params = new URLSearchParams(location.search);
  const menu = (
    <CmSidebar
      standalone
      autoCollapse={params.get("compact") === "auto"}
      defaultCollapsed={params.get("compact") === "manual"}
      groups={[
        {
          id: "start",
          label: "Operações",
          defaultOpen: true,
          items: [
            { id: "home", label: "Visão geral", active: true },
            { id: "list", label: "Lista" },
          ],
        },
        {
          id: "other",
          label: "Outros",
          items: [
            { id: "hidden", label: "Opção recolhida" },
            { id: "select", label: "Selecionar e fechar", onSelect: () => setOpen(false) },
          ],
        },
      ]}
    />
  );
  const content = params.has("autofocus") ? <>
    <input aria-label="Campo com autofocus" autoFocus />
    <CmButton>Última ação</CmButton>
  </> : menu;
  return (
    <CmThemeProvider
      skin="horizonte"
      defaultThemeName={params.get("theme") ?? "cm-horizonte-light"}
    >
      {params.get("compact") ? (
        <CmAppShell sidebar={menu} sidebarWidth={224}>
          <h1>Conteúdo</h1>
        </CmAppShell>
      ) : (
        <>
          <CmButton onClick={() => setOpen(true)}>Abrir menu</CmButton>
          <CmButton>Fora do menu</CmButton>
          {params.get("type") === "drawer" ? (
            <CmDrawer title="Menu de teste" open={open} onClose={() => setOpen(false)}>
              {content}
            </CmDrawer>
          ) : (
            <CmDialog portal title="Menu de teste" open={open} onClose={() => setOpen(false)}>
              {content}
            </CmDialog>
          )}
        </>
      )}
    </CmThemeProvider>
  );
}
createRoot(document.getElementById("root")!).render(<FocusFixture />);
