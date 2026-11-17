import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChartNoAxesCombined,
  FileText,
  Headphones,
  LayoutGrid,
  Moon,
  ShoppingBag,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import { CmThemeProvider, useCmTheme } from "../../src/components/theme/theme-provider.js";
import { CmAppShell } from "../../src/components/ui/app-shell.js";
import { CmBadge } from "../../src/components/ui/badge.js";
import { CmButtonGroup } from "../../src/components/ui/button-group.js";
import { CmButton } from "../../src/components/ui/button.js";
import { CmCard } from "../../src/components/ui/card.js";
import { CmDialog } from "../../src/components/ui/dialog.js";
import { CmLineChart } from "../../src/components/ui/line-chart.js";
import { CmMegaMenuSearch } from "../../src/components/ui/mega-menu-search.js";
import { CmMetricCard } from "../../src/components/ui/metric-card.js";
import { CmPageHeader } from "../../src/components/ui/page-header.js";
import { CmProgress } from "../../src/components/ui/progress.js";
import { CmSidebar } from "../../src/components/ui/sidebar.js";
import { CmTable } from "../../src/components/ui/table.js";
import { CmText } from "../../src/components/ui/text.js";
import { CmTopbar } from "../../src/components/ui/topbar.js";
import { CmUserMenu } from "../../src/components/ui/user-menu.js";

const navigation = [
  { id: "visao-geral", label: "Visão geral", icon: LayoutGrid },
  { id: "desempenho", label: "Desempenho", icon: ChartNoAxesCombined },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
];

const searchGroups = [
  {
    id: "secoes",
    label: "Seções do dashboard",
    items: navigation.map(({ id, label, icon: Icon }) => ({
      id,
      label,
      href: `#${id}`,
      icon: <Icon size={16} aria-hidden="true" />,
    })),
  },
];

const user = {
  title: "Camila Ribeiro",
  subtitle: "Operações",
  email: "camila@aurora.example",
};

const revenue = [
  { label: "02", value: 3980 },
  { label: "06", value: 6250 },
  { label: "10", value: 5430 },
  { label: "14", value: 9700 },
  { label: "18", value: 8160 },
  { label: "22", value: 11540 },
  { label: "26", value: 10650 },
  { label: "30", value: 14120 },
];

const orders = [
  { id: "AO-1182", name: "Isabela Martins", value: 349, status: "Pago", tone: "success" },
  { id: "AO-1181", name: "Rafael Lima", value: 189, status: "Processando", tone: "info" },
  { id: "AO-1180", name: "Beatriz Moura", value: 579, status: "Pendente", tone: "warning" },
  { id: "AO-1179", name: "Henrique Torres", value: 229, status: "Pago", tone: "success" },
] as const;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

function AuroraOpsFixture() {
  const { theme, setThemeByName, skin } = useCmTheme();
  const [active, setActive] = useState(navigation[0].id);
  const [dialog, setDialog] = useState<"profile" | "report" | null>(null);
  const [days, setDays] = useState<14 | 30>(30);
  const [search, setSearch] = useState("");
  const dark = theme.name === "cm-v4-dark";
  const profileOpen = dialog === "profile";

  return (
    <CmAppShell
      data-testid="aurora-ops-fixture"
      data-fixture-skin={skin}
      sidebarWidth={232}
      collapsedSidebarWidth={64}
      skipLinkLabel="Ir para o conteúdo"
      sidebar={({ closeMobileSidebar }) => (
        <CmSidebar
          autoCollapse={false}
          brand={{ title: "Aurora Ops", icon: <Sparkles size={18} aria-hidden="true" /> }}
          navLabel="Seções do dashboard"
          groups={navigation.map(({ id, label, icon: Icon }) => ({
            id,
            label,
            direct: true,
            items: [
              {
                id,
                label,
                href: `#${id}`,
                icon: <Icon size={17} aria-hidden="true" />,
                active: active === id,
                onSelect: () => {
                  setActive(id);
                  closeMobileSidebar();
                },
              },
            ],
          }))}
        />
      )}
      topbar={({ mobileMenuButton }) => (
        <CmTopbar
          layout="start"
          mobileLayout="stack"
          start={mobileMenuButton}
          title="Operações"
          centerAlign="start"
          center={
            <CmMegaMenuSearch
              aria-label="Buscar no dashboard"
              placeholder="Buscar no dashboard…"
              groups={searchGroups}
              query={search}
              onQueryChange={setSearch}
              onSelect={({ id }) => {
                setActive(id);
                setSearch("");
              }}
              keyboardShortcut="k"
              size="sm"
              columns={1}
              panelWidth={400}
              align="start"
            />
          }
          end={
            <CmUserMenu
              presentation="slim"
              showSubtitle={false}
              menuHeader="always"
              user={user}
              items={[
                {
                  id: "profile",
                  label: "Minha conta",
                  icon: <UserRound size={16} aria-hidden="true" />,
                  onSelect: () => setDialog("profile"),
                },
                {
                  id: "theme",
                  label: dark ? "Usar tema claro" : "Usar tema escuro",
                  icon: dark ? <Sun size={16} /> : <Moon size={16} />,
                  onSelect: () => setThemeByName(dark ? "cm-v4-light" : "cm-v4-dark"),
                },
              ]}
            />
          }
        />
      )}
    >
      <div className="aurora-ops-fixture">
        <CmPageHeader
          id="visao-geral"
          title="Visão geral"
          description="Indicadores da operação em junho de 2026."
          actions={
            <CmButton
              tone="primary"
              icon={<FileText size={16} />}
              onClick={() => setDialog("report")}
            >
              Relatório mensal
            </CmButton>
          }
        />

        <section className="aurora-ops-fixture__metrics" aria-label="Indicadores principais">
          <CmMetricCard
            title="Receita total"
            value={currency.format(184620)}
            icon={<Wallet size={18} aria-hidden="true" />}
            tone="primary"
            trend={{ value: 12.8, formattedValue: "12,8%", label: "vs. maio" }}
          />
          <CmMetricCard
            title="Usuários ativos"
            value="24.892"
            icon={<UsersRound size={18} aria-hidden="true" />}
            tone="info"
            trend={{ value: 8.2, formattedValue: "8,2%", label: "vs. maio" }}
          />
          <CmMetricCard
            title="Pedidos"
            value="1.482"
            icon={<ShoppingBag size={18} aria-hidden="true" />}
            tone="success"
            trend={{ value: 5.4, formattedValue: "5,4%", label: "vs. maio" }}
          />
          <CmMetricCard
            title="Chamados em aberto"
            value="24"
            icon={<Headphones size={18} aria-hidden="true" />}
            tone="warning"
            trend={{ value: -2.6, formattedValue: "2,6%", label: "vs. maio" }}
          />
        </section>

        <section id="desempenho" className="aurora-ops-fixture__reports" aria-label="Desempenho">
          <CmCard padding="lg">
            <CmLineChart
              title={
                <CmText as="h2" size="lg" weight="bold" family="heading">
                  Receita em junho
                </CmText>
              }
              description="Valores em reais"
              actions={
                <CmButtonGroup aria-label="Período de receita" gap="xs">
                  {([30, 14] as const).map((period) => (
                    <CmButton
                      key={period}
                      tone={days === period ? "primary" : "default"}
                      variant={days === period ? "soft" : "ghost"}
                      size="xs"
                      aria-pressed={days === period}
                      onClick={() => setDays(period)}
                    >
                      {period} dias
                    </CmButton>
                  ))}
                </CmButtonGroup>
              }
              data={days === 30 ? revenue : revenue.slice(-4)}
              height={220}
              valueFormat={(value) => compact.format(value)}
              tooltipFormat={(point) => `${point.label} de junho · ${currency.format(point.value)}`}
              accessibleTableLabel={`Receita dos últimos ${days} dias de junho`}
            />
          </CmCard>

          <CmCard padding="lg" tone="primary" variant="soft">
            <div className="aurora-ops-fixture__goal">
              <CmText as="h2" size="lg" weight="bold" family="heading">
                Meta mensal
              </CmText>
              <CmText as="p" size="3xl" weight="extrabold" family="heading" tracking="tight">
                {currency.format(184620)}
              </CmText>
              <CmText tone="muted">de {currency.format(200000)} planejados</CmText>
              <CmProgress label="Receita acumulada" value={184620} max={200000} showValue />
            </div>
          </CmCard>
        </section>

        <section id="pedidos" aria-labelledby="pedidos-titulo">
          <CmCard
            header={
              <CmText as="h2" size="lg" weight="bold" family="heading" id="pedidos-titulo">
                Pedidos recentes
              </CmText>
            }
            bodyPadding="none"
          >
            <CmTable label="Detalhes dos pedidos recentes" tableMinWidth={540}>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(({ id, name, value, status, tone }) => (
                  <tr key={id}>
                    <th scope="row">#{id}</th>
                    <td>{name}</td>
                    <td>{currency.format(value)}</td>
                    <td>
                      <CmBadge tone={tone}>{status}</CmBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </CmTable>
          </CmCard>
        </section>
      </div>

      <CmDialog
        title={profileOpen ? "Minha conta" : "Relatório mensal"}
        description={profileOpen ? user.title : "Resumo de junho de 2026"}
        open={dialog !== null}
        onClose={() => setDialog(null)}
        size="sm"
      >
        {profileOpen ? (
          <CmText>{user.email}</CmText>
        ) : (
          <CmText>
            A operação registrou 1.482 pedidos e {currency.format(184620)} de receita no período.
          </CmText>
        )}
      </CmDialog>
    </CmAppShell>
  );
}

const params = new URLSearchParams(window.location.search);
const requestedTheme = params.get("theme");
const theme = requestedTheme === "dark" || requestedTheme === "aurora" ? requestedTheme : "light";
const skin = params.get("skin") === "classic" ? "classic" : "aurora-ops";

createRoot(document.getElementById("root")!).render(
  <CmThemeProvider defaultThemeName={`cm-v4-${theme}`} skin={skin} storageKey={false}>
    <AuroraOpsFixture />
  </CmThemeProvider>,
);
