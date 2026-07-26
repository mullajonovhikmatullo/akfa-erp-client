import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react";
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
                    <li key={link}>
                      <a href={columnIndex === 0 && linkIndex === 1 ? `mailto:${link}` : "#"}>
                        {Icon ? <Icon size={14} /> : null}
                        {link}
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
          <div className="landing-footer__socials">
            <a href="#" aria-label="Facebook"><Facebook size={15} /></a>
            <a href="#" aria-label="Telegram"><Send size={15} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={15} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={15} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
