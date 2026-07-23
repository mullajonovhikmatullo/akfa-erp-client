import { MoreHorizontal, Store } from "lucide-react";

const branches = [
  { name: "Chilonzor", manager: "A. Karimov", staff: 12, role: "Filial admin", status: "Faol" },
  { name: "Yunusobod", manager: "N. Rasulova", staff: 9, role: "Kassirlar", status: "Faol" },
  { name: "Sergeli", manager: "B. Ergashev", staff: 7, role: "Operator", status: "Tekshiruvda" },
  { name: "Olmazor", manager: "S. Yusupova", staff: 6, role: "Filial admin", status: "Faol" },
  { name: "Mirzo Ulug‘bek", manager: "R. Toshmatov", staff: 5, role: "Kirish yopiq", status: "Vaqtincha yopiq" },
];

const statusStyles: Record<string, string> = {
  Faol: "bg-primary-soft text-primary",
  Tekshiruvda: "bg-accent-soft text-foreground",
  "Vaqtincha yopiq": "bg-muted text-muted-foreground",
};

export function BranchesShot() {
  return (
    <div className="screenshot-frame text-[12px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <Store className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-[13px]">Filial va rollar</span>
          <span className="text-muted-foreground">/ 5 filial</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button className="text-[11px] px-2 py-1 rounded-md border border-border">Rol filtri</button>
          <button className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground font-medium">
            + Xodim qo‘shish
          </button>
        </div>
      </div>
      <div className="bg-surface/40">
        <div className="grid grid-cols-[1.4fr_1.2fr_0.7fr_1fr_1fr_0.3fr] px-4 py-2 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Filial</div>
          <div>Admin</div>
          <div>Xodim</div>
          <div>Rol</div>
          <div>Holat</div>
          <div />
        </div>
        {branches.map((b) => (
          <div
            key={b.name}
            className="grid grid-cols-[1.4fr_1.2fr_0.7fr_1fr_1fr_0.3fr] items-center px-4 py-3 border-b border-border last:border-0 bg-card"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary-soft grid place-items-center text-[10px] font-semibold text-primary">
                {b.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-[12.5px]">{b.name}</span>
            </div>
            <div className="text-foreground/75">{b.manager}</div>
            <div className="tabular">{b.staff}</div>
            <div className="font-medium">{b.role}</div>
            <div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${statusStyles[b.status]}`}>
                {b.status}
              </span>
            </div>
            <div className="text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
