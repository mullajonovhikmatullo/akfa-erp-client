import { ArrowRight, Check, Clock, Package, Truck } from "lucide-react";

const steps = [
  { label: "Ariza", time: "09:14", done: true, icon: Package },
  { label: "Tenant", time: "09:42", done: true, icon: Check },
  { label: "Tarif", time: "10:20", done: true, icon: Truck },
  { label: "Login", time: "—", done: false, icon: Clock },
];

export function TransferShot() {
  return (
    <div className="screenshot-frame text-[12px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px]">Admin ochish</span>
          <span className="text-muted-foreground tabular">ADM-1048</span>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-accent-soft text-foreground">
          Platform admin tasdiqlamoqda
        </span>
      </div>

      <div className="p-4 bg-surface/40">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Field label="Do‘kon" value="Ziyo Market" />
          <Field label="Admin URL" value="ziyo.kvon.uz" />
          <Field label="Tarif" value="Business" />
          <Field label="Mas’ul" value="Platform admin" />
        </div>

        <div className="mt-5 rounded-lg bg-card border border-border p-4">
          <div className="text-[11.5px] font-semibold mb-4">Admin faollashtirish bosqichlari</div>
          <div className="relative flex items-start justify-between gap-2">
            <div className="absolute left-4 right-4 top-3 h-px bg-border" />
            <div
              className="absolute left-4 top-3 h-px bg-primary"
              style={{ width: "58%" }}
            />
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`h-6 w-6 rounded-full grid place-items-center border ${
                      s.done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="text-[10.5px] font-medium">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground tabular">{s.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-card border border-border p-3 flex items-center justify-between text-[11.5px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            Tenant ID: ziyo-market · Egasi: Dilshod E.
          </div>
          <div className="flex items-center gap-1 text-primary font-medium">
            Platform adminda ko‘rish <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-[12.5px] font-medium mt-0.5">{value}</div>
    </div>
  );
}
