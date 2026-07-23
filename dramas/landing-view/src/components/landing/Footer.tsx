import { Logo } from "./Logo";
import { Phone, Mail, MapPin } from "lucide-react";
import { site } from "../../config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-10">
          <div>
            <Logo markSize={28} />
            <p className="mt-3 text-[14px] text-muted-foreground max-w-xs leading-relaxed">
              {site.brand.tagline}
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> {site.contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {site.contact.email}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {site.contact.address}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {site.footer.columns.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {col.title}
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13.5px] text-foreground/80 hover:text-foreground">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12.5px] text-muted-foreground">
          <div>{site.footer.copyright}</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Tizim ishlamoqda
          </div>
        </div>
      </div>
    </footer>
  );
}
