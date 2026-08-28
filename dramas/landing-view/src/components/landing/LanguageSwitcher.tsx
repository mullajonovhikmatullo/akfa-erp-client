import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n/I18nProvider';
import { formatMessage, languageOptions } from '../../i18n/translations';

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const currentLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0]!;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className={`language-switcher${mobile ? ' language-switcher--mobile' : ''}`} ref={rootRef}>
      <button
        className="language-switcher__trigger"
        type="button"
        aria-label={formatMessage(t.language.current, { language: currentLanguage.nativeLabel })}
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="language-switcher__flag" aria-hidden="true">{currentLanguage.flag}</span>
        <span>{currentLanguage.shortLabel}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <div className="language-switcher__menu" id={menuId} role="menu" aria-label={t.language.select}>
          {languageOptions.map((option) => {
            const selected = option.code === language;
            return (
              <button
                className={selected ? 'is-selected' : undefined}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                key={option.code}
                onClick={() => {
                  setLanguage(option.code);
                  setOpen(false);
                }}
              >
                <span className="language-switcher__flag" aria-hidden="true">{option.flag}</span>
                <span>{option.nativeLabel}</span>
                {selected ? <Check size={14} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
