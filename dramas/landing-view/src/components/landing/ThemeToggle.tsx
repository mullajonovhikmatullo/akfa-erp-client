import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mavion-landing-theme';

function currentTheme(): Theme {
    //
    if (typeof document === 'undefined') return 'light';
    const explicit = document.documentElement.dataset.theme;
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
    //
    const {t} = useI18n();
    const [theme, setTheme] = useState<Theme>(currentTheme);

    useEffect(() => {
        //
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    function toggle() {
        //
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            return;
        }
    }

    const label = theme === 'dark' ? t.theme.toLight : t.theme.toDark;
    return (
        <button className="icon-button" type="button" onClick={toggle} aria-label={label} title={label}>
            {theme === 'dark' ? <Sun size={18} aria-hidden="true"/> : <Moon size={18} aria-hidden="true"/>}
        </button>
    );
}
