import { useState } from "react";
import { createRoot } from "react-dom/client";
import { UsersRound } from "lucide-react";
import { CmThemeProvider } from "../../src/components/theme/theme-provider.js";
import {
  CmButton,
  CmChangeHistory,
  CmNativeInput,
  CmSavedViews,
  CmTable,
  type CmChangeHistoryEvent,
  type CmSavedView,
} from "../../src/client.js";

type View = { status: "all" | "review"; showLimit: boolean; sort: "name" | "limit" };
const defaultView: View = { status: "all", showLimit: false, sort: "name" };
const reviewView: View = { status: "review", showLimit: true, sort: "limit" };
const customers = [
  { name: "Aurora Comercial", review: true, limit: 800 },
  { name: "Atlas Distribuição", review: true, limit: 650 },
  { name: "Norte Serviços", review: false, limit: 1200 },
];
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const events: CmChangeHistoryEvent[] = [
  {
    id: "limit",
    title: "Limite de crédito alterado",
    actor: "Ana Souza",
    dateTime: "2026-11-24T13:42:00Z",
    dateLabel: "24 nov · 10:42",
    changes: [{ field: "Limite de crédito", before: "R$ 500,00", after: "R$ 800,00" }],
  },
  {
    id: "review",
    title: "Crédito enviado para revisão",
    actor: "Rafael Lima",
    dateTime: "2026-11-23T19:10:00Z",
    dateLabel: "23 nov · 16:10",
  },
  {
    id: "created",
    title: "Cadastro criado",
    actor: "Marina Costa",
    dateTime: "2026-11-20T12:15:00Z",
    dateLabel: "20 nov · 09:15",
  },
];

function CustomerWorkspace() {
  const [views, setViews] = useState<CmSavedView<View>[]>([
    { id: "credit", label: "Crédito em revisão", snapshot: reviewView },
  ]);
  const [view, setView] = useState<View>(reviewView);
  const [active, setActive] = useState<string | null>("credit");
  const [selected, setSelected] = useState("Aurora Comercial");
  const [history, setHistory] = useState(events);
  const [currentLimit, setCurrentLimit] = useState(800);
  const activeSnapshot = views.find((item) => item.id === active)?.snapshot ?? defaultView;
  const rows = customers
    .filter((row) => view.status === "all" || row.review)
    .map((row) => (row.name === "Aurora Comercial" ? { ...row, limit: currentLimit } : row))
    .sort((a, b) => (view.sort === "limit" ? b.limit - a.limit : a.name.localeCompare(b.name)));
  const customer = customers.find((row) => row.name === selected) ?? customers[0];

  return (
    <main className="workspace-demo">
      <header className="workspace-demo__top">
        <UsersRound aria-hidden="true" size={19} />
        <strong>Aurora Ops</strong>
        <span aria-hidden="true">/</span>
        <span>Clientes</span>
      </header>
      <div className="workspace-demo__layout">
        <section className="workspace-demo__card" aria-labelledby="customers-title">
          <h1 id="customers-title">Clientes</h1>
          <CmSavedViews
            views={views}
            activeViewId={active}
            currentSnapshot={view}
            dirty={
              view.status !== activeSnapshot.status ||
              view.showLimit !== activeSnapshot.showLimit ||
              view.sort !== activeSnapshot.sort
            }
            onApply={(next) => {
              setActive(next?.id ?? null);
              setView(next?.snapshot ?? defaultView);
            }}
            onCreate={(next) => {
              const id = crypto.randomUUID();
              setViews((value) => [...value, { ...next, id }]);
              setActive(id);
            }}
            onUpdate={(id, next) =>
              setViews((value) => value.map((item) => (item.id === id ? { ...next, id } : item)))
            }
            onDelete={(id) => {
              setViews((value) => value.filter((item) => item.id !== id));
              setActive(null);
              setView(defaultView);
            }}
          />
          <div className="workspace-demo__filters">
            <label>
              <input
                type="checkbox"
                checked={view.status === "review"}
                onChange={(e) => setView({ ...view, status: e.target.checked ? "review" : "all" })}
              />{" "}
              Em revisão
            </label>
            <label>
              <input
                type="checkbox"
                checked={view.showLimit}
                onChange={(e) => setView({ ...view, showLimit: e.target.checked })}
              />{" "}
              Mostrar limite
            </label>
            <CmButton
              variant="outline"
              size="sm"
              aria-pressed={view.sort === "limit"}
              onClick={() => setView({ ...view, sort: view.sort === "limit" ? "name" : "limit" })}
            >
              Maior limite
            </CmButton>
          </div>
          <CmTable label="Lista de clientes">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Status</th>
                {view.showLimit && <th scope="col">Limite</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} data-selected={row.name === selected}>
                  <td>
                    <button
                      className="workspace-demo__link"
                      type="button"
                      aria-pressed={row.name === selected}
                      onClick={() => setSelected(row.name)}
                    >
                      {row.name}
                    </button>
                  </td>
                  <td>{row.review ? "Em revisão" : "Aprovado"}</td>
                  {view.showLimit && (
                    <td className="workspace-demo__amount">{brl.format(row.limit)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </CmTable>
        </section>
        <section className="workspace-demo__card" aria-labelledby="editor-title">
          <h2 id="editor-title">Editar cliente</h2>
          <p className="workspace-demo__subtitle">{customer.name}</p>
          <div className="workspace-demo__editor">
            <form
              aria-label="Cadastro do cliente"
              key={customer.name}
              onSubmit={(e) => {
                e.preventDefault();
                if (customer.name !== "Aurora Comercial") return;
                const limit = Number(new FormData(e.currentTarget).get("limit"));
                if (limit === currentLimit || !Number.isFinite(limit)) return;
                setHistory((existing) => [
                  {
                    id: crypto.randomUUID(),
                    title: "Limite de crédito alterado",
                    actor: "Você",
                    dateTime: new Date().toISOString(),
                    dateLabel: "Agora",
                    changes: [
                      {
                        field: "Limite de crédito",
                        before: brl.format(currentLimit),
                        after: brl.format(limit),
                      },
                    ],
                  },
                  ...existing,
                ]);
                setCurrentLimit(limit);
              }}
            >
              <CmNativeInput label="Razão social" value={customer.name} readOnly />
              <CmNativeInput
                label="Status de crédito"
                value={customer.review ? "Em revisão" : "Aprovado"}
                readOnly
              />
              <CmNativeInput
                label="Limite de crédito (R$)"
                name="limit"
                type="number"
                min={0}
                step={0.01}
                required
                readOnly={customer.name !== "Aurora Comercial"}
                defaultValue={customer.name === "Aurora Comercial" ? currentLimit : customer.limit}
              />
              <CmButton type="submit" disabled={customer.name !== "Aurora Comercial"}>
                Salvar alterações
              </CmButton>
            </form>
            <aside className="workspace-demo__history" aria-label="Auditoria do cadastro">
              <CmChangeHistory events={customer.name === "Aurora Comercial" ? history : []} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

const theme =
  new URLSearchParams(location.search).get("theme") === "dark" ? "cm-v4-dark" : "cm-v4-light";
createRoot(document.getElementById("root")!).render(
  <CmThemeProvider defaultThemeName={theme} storageKey={false} skin="aurora-ops">
    <CustomerWorkspace />
  </CmThemeProvider>,
);
