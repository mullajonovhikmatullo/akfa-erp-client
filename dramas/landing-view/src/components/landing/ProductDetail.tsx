import { ChevronDown, Search } from "lucide-react";
import { site } from "../../config/site";

const statusTone: Record<string, string> = {
  Faol: "bg-primary-soft text-primary",
  Kutilmoqda: "bg-accent-soft text-foreground",
  Tekshiruvda: "bg-warning/15 text-foreground",
  Bloklangan: "bg-danger/10 text-danger",
};

export function ProductDetail() {
  const d = site.productDetail;
  return (
    <section className="py-20 sm:py-28 border-t border-border">
      <div className="container-page">
        <div className="max-w-2xl mb-10">
          <div className="eyebrow">Global admin</div>
          <h2 className="section-heading mt-3">{d.heading}</h2>
        </div>

        <div className="screenshot-frame text-[12.5px]">
          <div className="flex flex-wrap items-center gap-2 justify-between border-b border-border px-4 py-3 bg-card">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[14px]">Admin arizalari</span>
              <span className="text-muted-foreground text-[11.5px]">1 248 ta tenant</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px]">
              <button className="btn-secondary py-1 px-2.5 text-[11.5px]">CSV eksport</button>
              <button className="btn-primary py-1 px-2.5 text-[11.5px]">+ Tenant yaratish</button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 bg-surface/60">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11.5px] text-muted-foreground min-w-[220px] flex-1 max-w-xs">
              <Search className="h-3.5 w-3.5" />
              <span>Do‘kon yoki admin URL bo‘yicha qidirish…</span>
            </div>
            <FilterPill label="Tarif" value="Barchasi" />
            <FilterPill label="Manba" value="Barchasi" />
            <FilterPill label="Holat" value="Barchasi" />
            <FilterPill label="Sana" value="Oxirgi 7 kun" />
          </div>

          {/* Table */}
          <div className="bg-surface/30 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.9fr_1fr] px-4 py-2 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <div>ID</div>
                <div>Do‘kon</div>
                <div>Admin URL</div>
                <div>Tarif</div>
                <div>Manba</div>
                <div>Holat</div>
              </div>
              {d.records.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[0.7fr_1fr_1fr_1fr_0.9fr_1fr] items-center px-4 py-3 border-b border-border last:border-0 bg-card"
                >
                  <div className="tabular font-medium">{s.id}</div>
                  <div>{s.owner}</div>
                  <div className="tabular font-medium">{s.adminUrl}</div>
                  <div className="text-foreground/80">{s.plan}</div>
                  <div className="text-foreground/80">{s.source}</div>
                  <div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${statusTone[s.status]}`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card text-[11.5px]">
            <div className="text-muted-foreground">1–5 / 1 248 tenantdan</div>
            <div className="flex items-center gap-1">
              {["1", "2", "3", "…", "250"].map((p, i) => (
                <button
                  key={i}
                  className={`h-7 w-7 rounded-md text-[11.5px] ${
                    p === "1"
                      ? "bg-foreground text-background font-semibold"
                      : "border border-border"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11.5px]">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}
