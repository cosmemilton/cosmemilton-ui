import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Boxes, ChartNoAxesCombined, Code, LayoutGrid, Users } from "lucide-react";
import { CmMegaMenu, type CmMegaMenuGroup } from "../../src/components/ui/mega-menu.js";
import { CmMegaMenuSearch } from "../../src/components/ui/mega-menu-search.js";
import { CmThemeProvider } from "../../src/components/theme/theme-provider.js";
import { CmButton } from "../../src/components/ui/button.js";
import { CmBox } from "../../src/components/ui/box.js";
import { CmStack } from "../../src/components/ui/layout.js";
import { CmText } from "../../src/components/ui/text.js";
import { CmTopbar } from "../../src/components/ui/topbar.js";

function Fixture() {
  const params = new URLSearchParams(location.search);
  const [selected, setSelected] = useState("Nenhum item selecionado");
  const groups: CmMegaMenuGroup[] = [
    {
      id: "components",
      label: "Componentes",
      icon: <Boxes />,
      items: [
        {
          id: "card",
          label: "Card",
          description: "Superfícies para compor sua interface",
          icon: <LayoutGrid />,
          onSelect: () => setSelected("Card"),
        },
        {
          id: "icons",
          label: "Ícones",
          description: "Símbolos para ações e navegação",
          icon: <Code />,
          keywords: ["simbolos"],
          onSelect: () => setSelected("Ícones"),
        },
        {
          id: "disabled",
          label: "Em breve",
          disabled: true,
          onSelect: () => setSelected("DESABILITADO"),
        },
      ],
    },
    {
      id: "resources",
      label: "Recursos",
      icon: <BookOpen />,
      items: [
        {
          id: "install",
          label: "Instalação",
          description: "Comece com os imports da biblioteca",
          icon: <Code />,
          onSelect: () => setSelected("Instalação"),
        },
        { id: "native", label: "Link nativo", href: "#native-destination" },
      ],
    },
    {
      id: "guides",
      label: "Guias",
      icon: <Users />,
      items: [
        {
          id: "compose",
          label: "Composição",
          description: "Transforme pequenas peças em grandes ideias",
          onSelect: () => setSelected("Composição"),
        },
        {
          id: "data",
          label: "Visualização",
          icon: <ChartNoAxesCombined />,
          onSelect: () => setSelected("Visualização"),
        },
      ],
    },
    {
      id: "more",
      label: "Mais componentes",
      items: Array.from({ length: 48 }, (_, index) => ({
        id: `item-${index}`,
        label: `Componente ${index + 1}`,
        description: "Explore todas as possibilidades",
        onSelect: () => setSelected(`Componente ${index + 1}`),
      })),
    },
  ];
  return (
    <CmThemeProvider
      themeName={new URLSearchParams(location.search).get("theme") ?? "cm-v4-light"}
      storageKey={false}
    >
      <CmBox minHeight={900}>
        <CmTopbar
          tone="glass"
          height={52}
          mobileLayout="inline"
          centerAlign="stretch"
          center={
            <CmMegaMenuSearch
              aria-label="Buscar na biblioteca"
              groups={groups}
              keyboardShortcut="k"
              panelWidth={960}
              maxResults={80}
              size="sm"
            />
          }
          end={
            <CmButton size="sm" variant="outline">
              Depois da busca
            </CmButton>
          }
        />
        <CmStack as="main" gap="lg" padding="md">
          <CmText as="h1" size="xl">
            MegaMenu
          </CmText>
          {params.has("edge") ? <CmBox height={Math.max(0, innerHeight - 190)} /> : null}
          <CmMegaMenu
            aria-label="Navegação de produtos"
            items={[
              { id: "library", label: "Biblioteca", icon: <Boxes />, groups },
              {
                id: "account",
                label: "Conta",
                icon: <Users />,
                groups: [
                  {
                    id: "account-actions",
                    label: "Sua conta",
                    items: [
                      { id: "profile", label: "Perfil", onSelect: () => setSelected("Perfil") },
                    ],
                  },
                ],
              },
              { id: "direct", label: "Ação direta", onSelect: () => setSelected("Direta") },
              { id: "blocked", label: "Indisponível", disabled: true },
            ]}
            panelHeader={
              params.has("hidden-slot") ? (
                <CmBox visibleFrom="lg">
                  <CmButton>Oculto no mobile</CmButton>
                </CmBox>
              ) : undefined
            }
            panelFooter={
              <CmButton size="sm" onClick={() => setSelected("Rodapé")}>
                Ação do rodapé
              </CmButton>
            }
          />
          <CmButton variant="outline">Depois do menu</CmButton>
          <CmText role="status" data-testid="selection">
            {selected}
          </CmText>
          <CmText id="native-destination">Destino do link</CmText>
        </CmStack>
      </CmBox>
    </CmThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
