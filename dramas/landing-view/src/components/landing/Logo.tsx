import {useId} from "react";
import {site} from "../../config/site";

type LogoProps = {
    className?: string;
    markSize?: number;
    showWordmark?: boolean;
};

export function Logo({className = "", markSize = 28, showWordmark = true}: LogoProps) {
    //
    return (
        <span
            className={`brand-logo brand-logo--${markSize} ${className}`}
            aria-label={site.brand.name}
        >
      <StoreManagerMark size={markSize}/>
            {showWordmark ? <span className="brand-logo__wordmark">Mavion</span> : null}
    </span>
    );
}

export function StoreManagerMark({size = 28}: { size?: number }) {
    //
    const gradientId = `mavion-landing-mark-${useId().replaceAll(":", "")}`;

    return (
        <svg
            width={Math.round(size * 1.37)}
            height={size}
            viewBox="0 0 52 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="brand-logo__mark"
        >
            <defs>
                <linearGradient id={gradientId} x1="3" y1="4" x2="49" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#28A9F4"/>
                    <stop offset=".48" stopColor="#0476D0"/>
                    <stop offset="1" stopColor="#03558F"/>
                </linearGradient>
            </defs>
            <path
                fill={`url(#${gradientId})`}
                d="M3.2 31.8 14.7 7.2A6.2 6.2 0 0 1 20.3 3.6h8.4l-8.2 17.6 7.9-13.8a7.4 7.4 0 0 1 6.4-3.8h13.9L36.3 31.8a4.5 4.5 0 0 1-4.1 2.7h-6.9a4.5 4.5 0 0 1-4.1-6.3l2-4.5-4.6 8.1a5.4 5.4 0 0 1-4.7 2.7H5.1a2.1 2.1 0 0 1-1.9-2.7Z"
            />
        </svg>
    );
}

export const KvonMark = StoreManagerMark;
