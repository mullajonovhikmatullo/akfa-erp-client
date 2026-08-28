import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "../../config/site";
import { useI18n } from "../../i18n/I18nProvider";
import { Logo } from "./Logo";

export function Footer() {
  const { t } = useI18n();
  const contactLinks = [
    { label: site.contact.phone, href: site.contact.phoneHref, Icon: Phone },
    { label: site.contact.email, href: site.contact.emailHref, Icon: Mail },
    { label: t.footer.address, href: site.contact.mapHref, Icon: MapPin },
  ];
  const productLinks = [
    { label: t.navigation.items.features, href: '#imkoniyatlar' },
    { label: t.navigation.items.pricing, href: '#tariflar' },
    { label: t.navigation.items.howItWorks, href: '#qanday-ishlaydi' },
    { label: t.navigation.items.faq, href: '#savollar' },
  ];

  return (
    <footer className="landing-footer">
      <div className="container-page">
        <div className="landing-footer__grid">
          <div className="landing-footer__brand">
            <Logo markSize={27} />
            <p>{t.brand.tagline}</p>
          </div>

          <div className="landing-footer__column">
            <h3>{t.footer.contact}</h3>
            <ul>
              {contactLinks.map(({ label, href, Icon }) => (
                <li key={href}>
                  <a href={href} {...(href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    <Icon size={14} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="landing-footer__column">
            <h3>{t.footer.product}</h3>
            <ul>{productLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
          </div>

          <div className="landing-footer__column">
            <h3>{t.footer.company}</h3>
            <ul>
              <li><a href="#kompaniya">{t.footer.about}</a></li>
              <li><a href={site.contact.emailHref}>{t.footer.contact}</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>{t.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
