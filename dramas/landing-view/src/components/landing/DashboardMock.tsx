import {
  LayoutDashboard,
  Store,
  ArrowLeftRight,
  Users,
  Package,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  Circle,
} from "lucide-react";
import { site } from "../../config/site";

export function DashboardMock() {
  const d = site.dashboard;
  const max = Math.max(...d.chart.map((c) => c.value));

  return (
    <div className="screenshot-frame text-[12px] leading-tight">
      <div className="grid grid-cols-[180px_1fr] min-h-[520px]">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col gap-1 border-r border-border bg-surface/60 p-3">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-bold">
              K
            </span>
            <span className="font-semibold text-[13px]">Kvon Admin</span>
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Menyu
          </div>
          <SidebarItem icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" active />
          <SidebarItem icon={<BarChart3 className="h-3.5 w-3.5" />} label="Sotuvlar" />
          <SidebarItem icon={<Store className="h-3.5 w-3.5" />} label="Filiallar" badge="4" />
          <SidebarItem icon={<ArrowLeftRight className="h-3.5 w-3.5" />} label="Tarif" badge="aktiv" />
          <SidebarItem icon={<Package className="h-3.5 w-3.5" />} label="Mahsulotlar" />
          <SidebarItem icon={<Users className="h-3.5 w-3.5" />} label="Xodimlar" />
          <SidebarItem icon={<BarChart3 className="h-3.5 w-3.5" />} label="Hisobotlar" />
          <div className="mt-auto pt-3 border-t border-border">
            <SidebarItem icon={<Settings className="h-3.5 w-3.5" />} label="Sozlamalar" />
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <span>Sotuv, filial yoki xodim qidiring…</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-surface">
                <Circle className="h-2 w-2 fill-success text-success" />
                <span className="text-[11px]">{d.period}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-accent-soft grid place-items-center text-[10px] font-semibold">
                  ZM
                </div>
                <span className="text-[11px] font-medium hidden sm:inline">{d.company}</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4 bg-surface/40">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] text-muted-foreground">{d.company}</div>
                <div className="text-[15px] font-semibold">Tenant dashboard</div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-success">
                <Circle className="h-2 w-2 fill-success text-success" />
                {d.status}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {d.metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-card border border-border p-3">
                  <div className="text-[10.5px] text-muted-foreground">{m.label}</div>
                  <div className="mt-1 flex items-baseline gap-1 tabular">
                    <span className="text-[15px] font-semibold text-foreground">{m.value}</span>
                    <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-success">
                    <TrendingUp className="h-3 w-3" />
                    {m.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-2.5">
              {/* Chart */}
              <div className="rounded-lg bg-card border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">Haftalik savdo</div>
                  <div className="text-[10px] text-muted-foreground">mln so‘m</div>
                </div>
                <div className="mt-3 flex items-end gap-2 h-32">
                  {d.chart.map((c, i) => {
                    const h = (c.value / max) * 100;
                    const peak = c.value === max;
                    return (
                      <div key={c.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex items-end h-full">
                          <div
                            className={`w-full rounded-[3px] ${peak ? "bg-primary" : "bg-primary/25"}`}
                            style={{ height: `${h}%`, animation: `fade-up 0.6s ${0.05 * i}s both` }}
                          />
                        </div>
                        <div className="text-[9.5px] text-muted-foreground tabular">{c.value}</div>
                        <div className="text-[10px] font-medium">{c.day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branches */}
              <div className="rounded-lg bg-card border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold">Filiallar reytingi</div>
                  <div className="text-[10px] text-muted-foreground">Bugun</div>
                </div>
                <div className="mt-2 flex flex-col divide-y divide-border">
                  {d.branches.map((b, i) => (
                    <div key={b.name} className="flex items-center gap-2 py-1.5">
                      <div className="w-4 text-[10px] font-semibold text-muted-foreground tabular">
                        {i + 1}
                      </div>
                      <div className="flex-1 text-[11.5px] font-medium">{b.name}</div>
                      <div className="text-[11px] tabular font-semibold">{b.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-lg bg-card border border-border p-3">
              <div className="text-[12px] font-semibold mb-2">So‘nggi harakatlar</div>
              <ul className="flex flex-col gap-1.5">
                {d.activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11.5px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-foreground/85">{a}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground tabular">
                      {["2 min", "14 min", "38 min", "1 s"][i]} oldin
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px] ${
        active
          ? "bg-primary-soft text-primary font-semibold"
          : "text-foreground/75 hover:bg-surface"
      }`}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-sm bg-accent-soft text-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}
