import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { site } from "../../config/site";
import { Logo } from "./Logo";

const salesDays = ["14 iy", "16 iy", "18 iy", "20 iy", "22 iy", "24 iy", "26 iy"];

export function DashboardMock() {
  const dashboard = site.dashboard;

  return (
    <div className="dashboard-window">
      <div className="dashboard-window__chrome">
        <div className="dashboard-window__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Logo markSize={18} />
        <div className="dashboard-window__chrome-meta">
          <span className="dashboard-window__period">{dashboard.period}</span>
          <Bell size={13} />
          <span>O‘zbekcha</span>
          <ChevronDown size={11} />
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <DashboardNavGroup title="Asosiy">
            <DashboardNavItem icon={<LayoutDashboard />} label="Asosiy" active />
          </DashboardNavGroup>
          <DashboardNavGroup title="Savdo">
            <DashboardNavItem icon={<ShoppingCart />} label="Sotuvlar" />
            <DashboardNavItem icon={<ClipboardList />} label="Mijozlar" />
          </DashboardNavGroup>
          <DashboardNavGroup title="Ombor">
            <DashboardNavItem icon={<Boxes />} label="Kategoriyalar" />
            <DashboardNavItem icon={<Package />} label="Mahsulotlar" />
            <DashboardNavItem icon={<Truck />} label="Transferlar" />
          </DashboardNavGroup>
          <DashboardNavGroup title="Moliya">
            <DashboardNavItem icon={<CreditCard />} label="Xarajatlar" />
            <DashboardNavItem icon={<FileBarChart />} label="Hisobotlar" />
          </DashboardNavGroup>
          <DashboardNavGroup title="Tahlil">
            <DashboardNavItem icon={<BarChart3 />} label="Analitika" />
          </DashboardNavGroup>
          <DashboardNavGroup title="Boshqaruv">
            <DashboardNavItem icon={<Building2 />} label="Filiallar" />
            <DashboardNavItem icon={<Users />} label="Administratorlar" />
          </DashboardNavGroup>
          <div className="dashboard-sidebar__settings">
            <DashboardNavItem icon={<Settings />} label="Sozlamalar" />
          </div>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-main__topbar">
            <div>
              <span>Store Manager</span>
              <strong>Asosiy</strong>
            </div>
            <div className="dashboard-main__branch">
              <Store size={13} />
              {dashboard.company}
              <ChevronDown size={11} />
              <CircleUserRound size={18} />
              <strong>Admin</strong>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-heading">
              <div>
                <h3>Boshqaruv paneli</h3>
                <p>Xush kelibsiz, Admin</p>
              </div>
              <div className="dashboard-heading__actions">
                <button type="button">
                  <Plus size={11} />
                  Yangi sotuv
                </button>
                <button type="button">
                  <Printer size={11} />
                  Hisobotga chiqarish
                </button>
                <button type="button">
                  <RefreshCw size={11} />
                  Yangilash
                </button>
                <button className="is-primary" type="button">
                  <BarChart3 size={11} />
                  Tahlilni ochish
                </button>
              </div>
            </div>

            <div className="dashboard-trial">
              <div>
                <strong>Tekshiruv davri</strong>
                <span>14 Jul 2026 – 26 Jul 2026</span>
              </div>
              <div>
                <CalendarDays size={12} />
                <span>14.07.2026</span>
                <i />
                <span>26.07.2026</span>
              </div>
            </div>

            <div className="dashboard-metrics">
              {dashboard.metrics.map((metric) => (
                <div className={`dashboard-metric dashboard-metric--${metric.tone}`} key={metric.label}>
                  <div>
                    <span>{metric.label}</span>
                    <MetricIcon tone={metric.tone} />
                  </div>
                  <strong>
                    {metric.value} <small>{metric.unit}</small>
                  </strong>
                  <p>{metric.tone === "red" ? "To‘lanmagan etkazib" : "O‘tgan oyga nisbatan"}</p>
                </div>
              ))}
            </div>

            <div className="dashboard-analytics">
              <div className="dashboard-chart-card">
                <div className="dashboard-card-title">
                  <strong>Savdo dinamikasi</strong>
                  <span>14 Jul 2026 – 26 Jul 2026</span>
                </div>
                <div className="dashboard-line-chart">
                  <span className="dashboard-line-chart__axis">60.0 M</span>
                  <span className="dashboard-line-chart__axis">45.0 M</span>
                  <span className="dashboard-line-chart__axis">30.0 M</span>
                  <span className="dashboard-line-chart__axis">15.0 M</span>
                  <svg viewBox="0 0 420 172" role="img" aria-label="Savdo dinamikasi grafigi">
                    <g className="chart-grid">
                      <path d="M20 22H410M20 60H410M20 98H410M20 136H410" />
                      <path d="M75 14V145M130 14V145M185 14V145M240 14V145M295 14V145M350 14V145" />
                    </g>
                    <path className="chart-line chart-line--blue" d="M20 140 C55 137 65 124 84 124 S118 137 140 130 S177 118 198 112 S229 26 249 26 S275 139 303 131 S335 116 355 112 S389 121 410 105" />
                    <path className="chart-line chart-line--orange" d="M20 141 C57 139 70 118 91 113 S125 137 150 133 S184 121 207 123 S238 104 260 112 S292 134 315 128 S348 107 370 117 S392 129 410 121" />
                    <path className="chart-line chart-line--red" d="M20 143 C61 142 75 134 96 135 S130 142 151 139 S189 128 212 131 S245 119 267 126 S302 139 324 136 S360 125 382 130 S400 137 410 133" />
                  </svg>
                  <div className="dashboard-line-chart__labels">
                    {salesDays.map((day) => <span key={day}>{day}</span>)}
                  </div>
                </div>
              </div>

              <div className="dashboard-share-card">
                <div className="dashboard-card-title">
                  <strong>Tushum ulushi</strong>
                  <span>14 Jul 2026</span>
                </div>
                <div className="dashboard-share-card__body">
                  <div className="dashboard-donut">
                    <div>
                      <span>Jami</span>
                      <strong>92.8 M</strong>
                    </div>
                  </div>
                  <ul>
                    {dashboard.branches.map((branch, index) => (
                      <li key={branch.name}>
                        <span style={{ backgroundColor: branch.color }} />
                        <div>
                          <strong>{branch.name}</strong>
                          <small>{branch.value}</small>
                        </div>
                        <b>{[72, 17, 8, 3][index]}%</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="dashboard-summary-row">
              <div><span>O‘rtacha chek</span><strong>2.5 M so‘m</strong></div>
              <div><span>Joriy oy daromadi</span><strong className="is-success">0.0 M so‘m</strong></div>
              <div><span>Qarzdorlar soni</span><strong className="is-danger">29</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardNavGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dashboard-nav-group">
      <span>{title}</span>
      {children}
    </div>
  );
}

function DashboardNavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`dashboard-nav-item${active ? " is-active" : ""}`}>
      {icon}
      <strong>{label}</strong>
    </div>
  );
}

function MetricIcon({ tone }: { tone: string }) {
  if (tone === "blue") return <ShoppingCart size={13} />;
  if (tone === "green") return <CreditCard size={13} />;
  if (tone === "red") return <Package size={13} />;
  return <ClipboardList size={13} />;
}
