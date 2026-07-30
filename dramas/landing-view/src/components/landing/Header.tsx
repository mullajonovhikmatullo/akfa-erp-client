import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { getAdminUrl } from "@store/landing-stub";
import { site } from "../../config/site";
import { Logo } from "./Logo";

const storeLoginUrl = getAdminUrl();

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 6);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`landing-header${scrolled ? " landing-header--scrolled" : ""}`}>
      <div className="container-page landing-header__inner">
        <a className="landing-header__logo" href="/" aria-label={site.brand.name}>
          <Logo markSize={28} />
        </a>

        <nav className="landing-nav" aria-label="Asosiy navigatsiya">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="landing-header__actions">
          <a className="button button--ghost button--small" href={storeLoginUrl}>
            {site.cta.login}
          </a>
          <a className="button button--primary button--small" href="#tariflar">
            {site.cta.primary}
          </a>
        </div>

        <button
          className="landing-header__menu"
          type="button"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="landing-mobile-menu">
          <nav className="container-page" aria-label="Mobil navigatsiya">
            {site.nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="landing-mobile-menu__actions">
              <a className="button button--ghost" href={storeLoginUrl} onClick={() => setOpen(false)}>
                {site.cta.login}
              </a>
              <a className="button button--primary" href="#tariflar" onClick={() => setOpen(false)}>
                {site.cta.primary}
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
