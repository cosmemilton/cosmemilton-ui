import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CmTabs, CmTabsList, CmTabsTrigger, CmTabsContent } from "../../src/components/ui/tabs.js";
import {
  CmToastProvider,
  useCmToast,
  type CmToastPosition,
} from "../../src/components/ui/toast.js";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "dark" ? "dark" : "light";
const skin = params.get("skin") === "horizonte" ? "horizonte" : "classic";
document.documentElement.dataset.theme =
  skin === "horizonte" ? `cm-horizonte-${theme}` : theme === "dark" ? "cm-dark" : "cm-neutral";
document.documentElement.dataset.cmSkin = skin;

const labels = ["Visão geral", "Documentos", "Responsáveis", "Histórico", "Configurações"];
const positions: CmToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function ToastControls() {
  const { toast } = useCmToast();
  return (
    <div className="responsive-actions">
      <button
        onClick={() =>
          toast(
            "A operação foi concluída. Confira todos os documentos e as informações dos responsáveis antes de continuar.",
            {
              title: "Mensagem longa de confirmação da operação",
              tone: "success",
              duration: 60_000,
            },
          )
        }
      >
        Mensagem longa
      </button>
      <button
        onClick={() =>
          toast(`https://example.test/${"documento".repeat(20)}`, {
            title: "Identificador".repeat(12),
            tone: "info",
            duration: 60_000,
          })
        }
      >
        Texto sem espaços
      </button>
    </div>
  );
}

function Fixture() {
  const [selected, setSelected] = useState(params.get("active") ?? "2");
  const [position, setPosition] = useState<CmToastPosition>("bottom-right");
  const showScrollButtons = params.get("buttons") !== "false";
  return (
    <CmToastProvider position={position}>
      <main className="responsive-page">
        <h1>Abas e mensagens</h1>
        <label>
          Posição do toast{" "}
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value as CmToastPosition)}
          >
            {positions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <ToastControls />
        <label>
          Aba selecionada{" "}
          <select value={selected} onChange={(event) => setSelected(event.target.value)}>
            {labels.map((label, index) => (
              <option key={label} value={String(index)}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {(["default", "modal", "folder"] as const).map((variant) => (
          <section key={variant} data-variant={variant}>
            <h2>{variant}</h2>
            <CmTabs variant={variant} value={selected} onValueChange={setSelected}>
              <CmTabsList showScrollButtons={showScrollButtons}>
                {labels.map((label, index) => (
                  <CmTabsTrigger key={label} value={String(index)}>
                    {label}
                  </CmTabsTrigger>
                ))}
              </CmTabsList>
              {labels.map((label, index) => (
                <CmTabsContent key={label} value={String(index)}>
                  Conteúdo: {label}
                </CmTabsContent>
              ))}
            </CmTabs>
          </section>
        ))}
      </main>
    </CmToastProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
