import {Mail, MapPin, Phone, Send} from 'lucide-react';

import {site} from '../../config/site';
import {useI18n} from '../../i18n/I18nProvider';
import {formatMessage} from '../../i18n/translations';
import {Logo} from './Logo';

export function Footer() {
    //
    const {t} = useI18n();
    const contacts = [
        {key: 'phone', label: site.contact.phone, href: site.contact.phoneHref, Icon: Phone},
        {key: 'email', label: site.contact.email, href: site.contact.emailHref, Icon: Mail},
        ...(site.contact.telegramHref ? [{key: 'telegram', label: t.footer.telegram, href: site.contact.telegramHref, Icon: Send}] : []),
    ];

    return (
        <footer className="site-footer">
            <div className="container site-footer__grid">
                <div className="site-footer__brand">
                    <Logo markSize={24}/>
                    <p>{t.brand.tagline}</p>
                </div>

                <nav className="site-footer__column" aria-label={t.footer.product}>
                    <h2>{t.footer.product}</h2>
                    <ul>
                        {site.navigation.map((item) => <li key={item.href}><a href={item.href}>{t.navigation.items[item.key]}</a></li>)}
                    </ul>
                </nav>

                <div className="site-footer__column">
                    <h2>{t.footer.contact}</h2>
                    <ul>
                        {contacts.map(({key, label, href, Icon}) => (
                            <li key={key}>
                                <a href={href} {...(href.startsWith('https://') ? {target: '_blank', rel: 'noreferrer'} : {})}>
                                    <Icon size={15} aria-hidden="true"/>{label}
                                </a>
                            </li>
                        ))}
                        <li><span><MapPin size={15} aria-hidden="true"/>{t.footer.address}</span></li>
                    </ul>
                    {site.contact.socials.length > 0 ? (
                        <ul className="site-footer__socials">
                            {site.contact.socials.map((social) => <li key={social.key}><a href={social.href} target="_blank" rel="noreferrer">{social.key}</a></li>)}
                        </ul>
                    ) : null}
                </div>
            </div>
            <div className="container site-footer__bottom">
                <span>{formatMessage(t.footer.copyright, {year: new Date().getFullYear()})}</span>
            </div>
        </footer>
    );
}
