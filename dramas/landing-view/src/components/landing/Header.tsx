import {useEffect, useState} from 'react';
import {Menu, X} from 'lucide-react';

import {getAdminUrl} from '@store/landing-stub';
import {site} from '../../config/site';
import {useI18n} from '../../i18n/I18nProvider';
import {LanguageSwitcher} from './LanguageSwitcher';
import {Logo} from './Logo';
import {ThemeToggle} from './ThemeToggle';

const storeLoginUrl = getAdminUrl();

export function Header() {
    //
    const {t} = useI18n();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        //
        const handleScroll = () => setScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        //
        if (!open) return undefined;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [open]);

    return (
        <header className={`site-header${scrolled || open ? ' site-header--scrolled' : ''}`}>
            <div className="container site-header__inner">
                <a className="site-header__logo" href="#top" aria-label={site.brand.name}>
                    <Logo markSize={24}/>
                </a>

                <nav className="site-nav" aria-label={t.navigation.label}>
                    {site.navigation.map((item) => (
                        <a key={item.href} href={item.href}>{t.navigation.items[item.key]}</a>
                    ))}
                </nav>

                <div className="site-header__actions">
                    <LanguageSwitcher/>
                    <ThemeToggle/>
                    <a className="btn btn--ghost btn--sm" href={storeLoginUrl}>{t.cta.login}</a>
                    <a className="btn btn--primary btn--sm" href="#tariflar">{t.cta.primary}</a>
                </div>

                <div className="site-header__mobile-actions">
                    <ThemeToggle/>
                    <button
                        className="icon-button"
                        type="button"
                        aria-label={open ? t.navigation.closeMenu : t.navigation.openMenu}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((current) => !current)}
                    >
                        {open ? <X size={20} aria-hidden="true"/> : <Menu size={20} aria-hidden="true"/>}
                    </button>
                </div>
            </div>

            {open ? (
                <div className="mobile-menu" id="mobile-menu">
                    <nav className="container" aria-label={t.navigation.mobileLabel}>
                        {site.navigation.map((item) => (
                            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                {t.navigation.items[item.key]}
                            </a>
                        ))}
                        <LanguageSwitcher mobile/>
                        <div className="mobile-menu__actions">
                            <a className="btn btn--ghost" href={storeLoginUrl}>{t.cta.login}</a>
                            <a className="btn btn--primary" href="#tariflar" onClick={() => setOpen(false)}>{t.cta.primary}</a>
                        </div>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}
