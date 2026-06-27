import { useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Package } from "lucide-react";
import { addIcon } from "@iconify/react";

import { CmButton, CmCombobox, CmInput, CmSelect, CmSwitch } from "../../src/client.js";
import { CmIcon } from "../../src/server.js";

addIcon("visual:sparkles", {
  width: 24,
  height: 24,
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9Zm7 12-.9 2.1L16 18l2.1.9L19 21l.9-2.1L22 18l-2.1-.9ZM5 3l.9 2.1L8 6l-2.1.9L5 9l-.9-2.1L2 6l2.1-.9Z"/>',
});

const fruitOptions = [
  { value: "orange", label: "Laranja" },
  { value: "apple", label: "Maçã" },
];

const fruitItems = [
  { value: "orange", label: "Laranja", description: "Fruta cítrica" },
  { value: "apple", label: "Maçã", description: "Fruta vermelha" },
];

type ControlRowProps = {
  children: ReactNode;
  columns: number;
  description: string;
  id: string;
};

function ControlRow({ children, columns, description, id }: ControlRowProps) {
  return (
    <section className="visual-control-row" data-control-row={id} data-control-count={columns}>
      <div className="visual-control-row__description">{description}</div>
      <div className="visual-control-row__controls">{children}</div>
    </section>
  );
}

function ControlCell({ children }: { children: ReactNode }) {
  return <div className="visual-control-cell">{children}</div>;
}

function SelectExample({
  error,
  helperText,
  success,
  startIcon,
  endIcon,
}: {
  error?: string;
  helperText?: string;
  success?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}) {
  const [value, setValue] = useState("orange");

  return (
    <CmSelect
      label="CmSelect"
      value={value}
      onChange={setValue}
      options={fruitOptions}
      error={error}
      helperText={helperText}
      success={success}
      startIcon={startIcon}
      endIcon={endIcon}
    />
  );
}

function ComboboxExample({
  error,
  helperText,
  success,
}: {
  error?: string;
  helperText?: string;
  success?: boolean;
}) {
  return (
    <CmCombobox
      label="CmCombobox"
      items={fruitItems}
      initialValue="orange"
      error={error}
      helperText={helperText}
      success={success}
    />
  );
}

function AdornmentIcon() {
  return <CmIcon name="visual:sparkles" />;
}

function IconAction({ position }: { position: "início" | "fim" }) {
  return (
    <CmButton
      size="xs"
      aria-label={`Executar ação no ${position}`}
      title={`Executar ação no ${position}`}
    >
      <AdornmentIcon />
    </CmButton>
  );
}

function ControlsFixture() {
  return (
    <article className="visual-card" data-testid="controls-fixture">
      <header className="visual-card__header">
        <h1>Altura dos controles de formulário</h1>
        <p>CmInput, CmSelect e CmCombobox devem permanecer alinhados em todas as variações.</p>
      </header>

      <ControlRow id="plain" columns={3} description="Sem adornos">
        <ControlCell>
          <CmInput label="CmInput" value="000001" readOnly />
        </ControlCell>
        <ControlCell>
          <SelectExample />
        </ControlCell>
        <ControlCell>
          <ComboboxExample />
        </ControlCell>
      </ControlRow>

      <ControlRow id="start" columns={5} description="Adorno no início">
        <ControlCell>
          <CmInput label="CmInput padrão" value="Pesquisar" readOnly />
        </ControlCell>
        <ControlCell>
          <CmInput
            className="visual-input--start-icon"
            label="CmInput + CmIcon"
            value="Pesquisar"
            readOnly
            startIcon={<AdornmentIcon />}
          />
        </ControlCell>
        <ControlCell>
          <CmInput
            className="visual-input--start-button"
            label="CmInput + CmButton"
            value="Pesquisar"
            readOnly
            startButton={<IconAction position="início" />}
          />
        </ControlCell>
        <ControlCell>
          <SelectExample startIcon={<AdornmentIcon />} />
        </ControlCell>
        <ControlCell>
          <ComboboxExample />
        </ControlCell>
      </ControlRow>

      <ControlRow id="end" columns={5} description="Adorno no fim">
        <ControlCell>
          <CmInput label="CmInput padrão" value="7898994269489" readOnly />
        </ControlCell>
        <ControlCell>
          <CmInput
            className="visual-input--end-icon"
            label="CmInput + CmIcon"
            value="7898994269489"
            readOnly
            endIcon={<AdornmentIcon />}
          />
        </ControlCell>
        <ControlCell>
          <CmInput
            className="visual-input--end-button"
            label="CmInput + CmButton"
            value="7898994269489"
            readOnly
            endButton={<IconAction position="fim" />}
          />
        </ControlCell>
        <ControlCell>
          <SelectExample endIcon={<AdornmentIcon />} />
        </ControlCell>
        <ControlCell>
          <ComboboxExample />
        </ControlCell>
      </ControlRow>

      <ControlRow id="helper" columns={4} description="Helper neutro">
        <ControlCell>
          <CmInput label="CmInput padrão" value="000001" readOnly />
        </ControlCell>
        <ControlCell>
          <CmInput label="CmInput" value="000001" readOnly helperText="Texto auxiliar do campo" />
        </ControlCell>
        <ControlCell>
          <SelectExample helperText="Texto auxiliar do campo" />
        </ControlCell>
        <ControlCell>
          <ComboboxExample helperText="Texto auxiliar do campo" />
        </ControlCell>
      </ControlRow>

      <ControlRow id="success" columns={4} description="Helper de sucesso">
        <ControlCell>
          <CmInput label="CmInput padrão" value="000001" readOnly />
        </ControlCell>
        <ControlCell>
          <CmInput
            label="CmInput"
            value="000001"
            readOnly
            success
            helperText="Valor validado com sucesso"
          />
        </ControlCell>
        <ControlCell>
          <SelectExample success helperText="Valor validado com sucesso" />
        </ControlCell>
        <ControlCell>
          <ComboboxExample success helperText="Valor validado com sucesso" />
        </ControlCell>
      </ControlRow>

      <ControlRow id="error" columns={4} description="Helper de erro">
        <ControlCell>
          <CmInput label="CmInput padrão" value="000001" readOnly />
        </ControlCell>
        <ControlCell>
          <CmInput label="CmInput" value="000001" readOnly error="Valor inválido" />
        </ControlCell>
        <ControlCell>
          <SelectExample error="Valor inválido" />
        </ControlCell>
        <ControlCell>
          <ComboboxExample error="Valor inválido" />
        </ControlCell>
      </ControlRow>
    </article>
  );
}

function SwitchLine({ checked, inverted }: { checked: boolean; inverted?: boolean }) {
  const state = checked ? "ligado" : "desligado";

  return (
    <div className="visual-switch-line">
      <span className="visual-switch-label">
        <Package size={17} aria-hidden="true" />
        Estoque
      </span>
      <CmSwitch
        checked={checked}
        aria-label={`Estoque ${state}${inverted ? " em superfície invertida" : ""}`}
        data-testid={`switch-${inverted ? "inverted" : "normal"}-${checked ? "on" : "off"}`}
      />
    </div>
  );
}

function SwitchFixture() {
  return (
    <article className="visual-card" data-testid="switch-fixture">
      <header className="visual-card__header">
        <h1>Switch em superfície normal e invertida</h1>
        <p>Trilho e thumb precisam continuar distinguíveis nos dois estados.</p>
      </header>

      <div className="visual-switch-grid">
        <section className="visual-switch-panel" data-testid="normal-panel">
          <h2>Superfície normal</h2>
          <SwitchLine checked={false} />
          <SwitchLine checked />
        </section>

        <section
          className="visual-switch-panel visual-switch-panel--inverted cm-sidebar cm-sidebar--tone-brand"
          data-testid="inverted-panel"
        >
          <h2>Superfície invertida</h2>
          <SwitchLine checked={false} inverted />
          <SwitchLine checked inverted />
        </section>
      </div>
    </article>
  );
}

function App() {
  return (
    <main className="visual-page">
      <ControlsFixture />
      <SwitchFixture />
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Visual fixture root not found");
createRoot(root).render(<App />);
