import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "../../config/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors ${
        scrolled
          ? "bg-background/85 border-b border-border"
          : "bg-background/60 border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-14 items-center justify-between gap-6">
        <a href="#" aria-label={site.brand.name}>
          <Logo markSize={28} />
        </a>

        <nav className="hidden md:flex items-center gap-7" aria-label="Asosiy navigatsiya">
          {site.nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[13.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a href="#" className="text-[13.5px] font-medium text-foreground/80 hover:text-foreground px-3 py-2">
            {site.cta.login}
          </a>
          <a href="#tariflar" className="btn-primary text-[13.5px] px-3.5 py-2">
            {site.cta.primary}
          </a>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-page py-4 flex flex-col gap-1">
            {site.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-[15px] text-foreground/90"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <a href="#" className="btn-secondary w-full">
                {site.cta.login}
              </a>
              <a href="#tariflar" className="btn-primary w-full">
                {site.cta.primary}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
