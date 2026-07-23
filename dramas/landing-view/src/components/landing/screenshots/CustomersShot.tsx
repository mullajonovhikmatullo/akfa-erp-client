const categories = [
  { name: "Yangi arizalar", count: 18, tone: "bg-accent-soft text-foreground" },
  { name: "Faol tenantlar", count: 412, tone: "bg-primary-soft text-primary" },
  { name: "To‘lov kutmoqda", count: 36, tone: "bg-warning/15 text-foreground" },
  { name: "Bloklangan", count: 7, tone: "bg-muted text-muted-foreground" },
];

const tenants = [
  { name: "Ziyo Market", owner: "Dilshod E.", plan: "Business", url: "ziyo.kvon.uz", status: "Faol" },
  { name: "Orzu Home", owner: "Nilufar X.", plan: "Start", url: "orzu.kvon.uz", status: "Kutilmoqda" },
  { name: "Ideal Savdo", owner: "Bekzod T.", plan: "Network", url: "ideal.kvon.uz", status: "Tekshiruvda" },
  { name: "Nova Retail", owner: "Zarina Y.", plan: "Business", url: "nova.kvon.uz", status: "Faol" },
  { name: "Atlas Market", owner: "Sardor A.", plan: "Start", url: "atlas.kvon.uz", status: "Bloklangan" },
];

const catTone: Record<string, string> = {
  Faol: "bg-primary-soft text-primary",
  Kutilmoqda: "bg-accent-soft text-foreground",
  Tekshiruvda: "bg-warning/15 text-foreground",
  Bloklangan: "bg-muted text-muted-foreground",
};

export function CustomersShot() {
  return (
    <div className="screenshot-frame text-[12px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="font-semibold text-[13px]">Global tenantlar</div>
        <div className="text-[11px] text-muted-foreground">Jami 473 ta admin</div>
      </div>

      <div className="p-4 bg-surface/40 grid gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((c) => (
            <div key={c.name} className="rounded-lg bg-card border border-border p-2.5">
              <div className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.tone}`}>
                {c.name}
              </div>
              <div className="mt-1.5 text-[16px] font-semibold tabular">{c.count}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr_1fr_0.9fr] px-3 py-2 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <div>Do‘kon</div>
            <div>Egasi</div>
            <div>Tarif</div>
            <div>Admin URL</div>
            <div>Holat</div>
          </div>
          {tenants.map((c) => (
            <div
              key={c.name}
              className="grid grid-cols-[1.4fr_1.2fr_0.8fr_1fr_0.9fr] items-center px-3 py-2.5 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-soft grid place-items-center text-[10px] font-semibold text-primary">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="font-medium text-[12px]">{c.name}</span>
              </div>
              <div className="text-muted-foreground">{c.owner}</div>
              <div className="font-medium">{c.plan}</div>
              <div className="text-muted-foreground tabular">{c.url}</div>
              <div>
                <span className={`text-[10.5px] font-medium px-1.5 py-0.5 rounded ${catTone[c.status]}`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
