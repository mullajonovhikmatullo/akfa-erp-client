import { Check } from "lucide-react";
import { site } from "../../config/site";
import { DashboardMock } from "./DashboardMock";
import { BranchesShot } from "./screenshots/BranchesShot";
import { TransferShot } from "./screenshots/TransferShot";
import { CustomersShot } from "./screenshots/CustomersShot";

const screens = {
  dashboard: DashboardMock,
  branches: BranchesShot,
  transfer: TransferShot,
  customers: CustomersShot,
};

export function Features() {
  return (
    <section id="imkoniyatlar" className="py-20 sm:py-28 border-t border-border">
      <div className="container-page">
        <div className="max-w-2xl mb-14">
          <div className="eyebrow">Imkoniyatlar</div>
          <h2 className="section-heading mt-3">
            Do‘kon boshqaruvi uchun ishlab chiqilgan tizim
          </h2>
        </div>

        <div className="flex flex-col gap-20 sm:gap-28">
          {site.features.map((f, i) => {
            const Screen = screens[f.screenshot];
            const imageRight = f.imagePosition === "right";
            return (
              <div
                key={f.id}
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] gap-10 lg:gap-14 items-center"
              >
                <div className={imageRight ? "lg:order-1" : "lg:order-2"}>
                  <div className="eyebrow">{f.eyebrow}</div>
                  <h3 className="section-heading mt-3 text-[26px] sm:text-[32px]">
                    {f.heading}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[14.5px]">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center gap-3 text-[13px] text-muted-foreground">
                    <span className="tabular font-semibold text-foreground">0{i + 1}</span>
                    <span className="h-px w-10 bg-border" />
                    <span>{`0${site.features.length}`}</span>
                  </div>
                </div>

                <div className={imageRight ? "lg:order-2" : "lg:order-1"}>
                  <div className="transition-transform duration-500 hover:-translate-y-1">
                    <Screen />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
