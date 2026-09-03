import {forwardRef, useLayoutEffect, useRef} from 'react';

type UzbekPhoneInputProps = {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    error?: boolean;
    autoComplete?: string;
    ariaLabel?: string;
};

function getNationalDigits(value: string) {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('998')) return digits.slice(3, 12);
    if (digits.startsWith('0')) return digits.slice(1, 10);
    return digits.slice(0, 9);
}

function formatNationalNumber(value: string) {
    const digits = getNationalDigits(value);
    return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
        .filter(Boolean)
        .join(' ');
}

function UzbekistanFlagIcon() {
    return (
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <rect width="20" height="14" fill="#fff"/>
            <rect width="20" height="4.4" fill="#1eb5e9"/>
            <rect y="4.4" width="20" height="0.55" fill="#ce1126"/>
            <rect y="9.05" width="20" height="0.55" fill="#ce1126"/>
            <rect y="9.6" width="20" height="4.4" fill="#1f9d55"/>
            <circle cx="3.25" cy="2.2" r="1.35" fill="#fff"/>
            <circle cx="3.7" cy="2.2" r="1.12" fill="#1eb5e9"/>
            <g fill="#fff">
                <circle cx="6" cy="1.25" r="0.22"/>
                <circle cx="7.1" cy="1.25" r="0.22"/>
                <circle cx="8.2" cy="1.25" r="0.22"/>
                <circle cx="6.55" cy="2.2" r="0.22"/>
                <circle cx="7.65" cy="2.2" r="0.22"/>
                <circle cx="8.75" cy="2.2" r="0.22"/>
                <circle cx="6" cy="3.15" r="0.22"/>
                <circle cx="7.1" cy="3.15" r="0.22"/>
                <circle cx="8.2" cy="3.15" r="0.22"/>
            </g>
        </svg>
    );
}

export const UzbekPhoneInput = forwardRef<HTMLInputElement, UzbekPhoneInputProps>(function UzbekPhoneInput(
    {value, onChange, onBlur, name, error = false, autoComplete = 'tel', ariaLabel},
    ref,
) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const caretDigitIndex = useRef<number | null>(null);

    useLayoutEffect(() => {
        const digitIndex = caretDigitIndex.current;
        if (digitIndex === null || !inputRef.current) return;

        const formattedValue = formatNationalNumber(value);
        let seenDigits = 0;
        let caretPosition = formattedValue.length;
        if (digitIndex === 0) caretPosition = 0;
        else {
            for (let index = 0; index < formattedValue.length; index += 1) {
                if (/\d/.test(formattedValue.charAt(index))) seenDigits += 1;
                if (seenDigits === digitIndex) {
                    caretPosition = index + 1;
                    break;
                }
            }
        }

        inputRef.current.setSelectionRange(caretPosition, caretPosition);
        caretDigitIndex.current = null;
    }, [value]);

    const setInputRef = (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    };

    const handleChange = (inputValue: string, caretPosition: number) => {
        caretDigitIndex.current = inputValue.slice(0, caretPosition).replace(/\D/g, '').length;
        const nationalDigits = getNationalDigits(inputValue);
        onChange(nationalDigits ? `+998${nationalDigits}` : '');
    };

    return (
        <div className="uz-phone-input" data-invalid={error || undefined}>
            <div className="uz-phone-input__prefix" aria-hidden="true">
                <span className="uz-phone-input__flag"><UzbekistanFlagIcon/></span>
                <span>+998</span>
            </div>
            <input
                ref={setInputRef}
                name={name}
                value={formatNationalNumber(value)}
                onChange={(event) => handleChange(event.target.value, event.target.selectionStart ?? event.target.value.length)}
                onBlur={onBlur}
                type="tel"
                inputMode="numeric"
                autoComplete={autoComplete}
                placeholder="90 123 45 67"
                maxLength={17}
                aria-invalid={error}
                aria-label={ariaLabel}
            />
        </div>
    );
});
