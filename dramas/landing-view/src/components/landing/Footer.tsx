import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "../../config/site";
import { Logo } from "./Logo";

const contactIcons = [Phone, Mail, MapPin];

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container-page">
        <div className="landing-footer__grid">
          <div className="landing-footer__brand">
            <Logo markSize={27} />
            <p>{site.brand.tagline}</p>
          </div>

          {site.footer.columns.map((column, columnIndex) => (
            <div className="landing-footer__column" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link, linkIndex) => {
                  const Icon = columnIndex === 0 ? contactIcons[linkIndex] : null;
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.href.startsWith("https://") ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        {Icon ? <Icon size={14} /> : null}
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-footer__bottom">
          <span>{site.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
