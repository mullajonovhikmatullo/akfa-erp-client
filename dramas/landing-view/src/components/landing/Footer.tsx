import {site} from "../../config/site";
import {useI18n} from "../../i18n/I18nProvider";
import {Logo} from "./Logo";

export function Footer() {
    //
    const {t} = useI18n();
    const contactLinks = [
        {label: site.contact.phone, href: site.contact.phoneHref, icon: 'phone'},
        {label: site.contact.email, href: site.contact.emailHref, icon: 'mail'},
        {label: t.footer.address, href: site.contact.mapHref, icon: 'location-pin'},
    ];
    const productLinks = [
        {label: t.navigation.items.features, href: '#imkoniyatlar'},
        {label: t.navigation.items.pricing, href: '#tariflar'},
        {label: t.navigation.items.howItWorks, href: '#qanday-ishlaydi'},
        {label: t.navigation.items.faq, href: '#savollar'},
    ];

    return (
        <footer className="landing-footer">
            <div className="container-page">
                <div className="landing-footer__grid">
                    <div className="landing-footer__brand">
                        <Logo markSize={27}/>
                        <p>{t.brand.tagline}</p>
                    </div>

                    <div className="landing-footer__column">
                        <h3>{t.footer.contact}</h3>
                        <ul>
                            {contactLinks.map(({label, href, icon}) => (
                                <li key={href}>
                                    <a href={href} {...(href.startsWith('https://') ? {
                                        target: '_blank',
                                        rel: 'noreferrer'
                                    } : {})}>
                                        <i className={`icons-${icon} icon-size-14`}/>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="landing-footer__column">
                        <h3>{t.footer.product}</h3>
                        <ul>{productLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a>
                        </li>)}</ul>
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
