import type {CSSProperties} from "react";
import {site} from "../../config/site";

type LogoProps = {
    className?: string;
    markSize?: number;
};

const publicAssetBaseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");
const logoAssetUrl = `${publicAssetBaseUrl}brand/mavion-logo.png`;
const logoCrop = {
    height: 199,
    markWidth: 350,
    sourceHeight: 941,
    sourceWidth: 1672,
    top: 354,
    left: 321,
    width: 1033,
};

export function Logo({className = "", markSize = 28}: LogoProps) {
    //
    const size = Math.max(1, markSize);
    const scale = size / logoCrop.height;

    return (
        <span
            className={`brand-logo brand-logo--${markSize}${className ? ` ${className}` : ""}`}
            aria-label={site.brand.name}
            role="img"
            style={{
                "--mavion-logo-height": `${size}px`,
                "--mavion-logo-mark-width": `${logoCrop.markWidth * scale}px`,
                "--mavion-logo-source": `url("${logoAssetUrl}")`,
                "--mavion-logo-source-height": `${logoCrop.sourceHeight * scale}px`,
                "--mavion-logo-source-left": `${-logoCrop.left * scale}px`,
                "--mavion-logo-source-mark-left": `${(logoCrop.left + logoCrop.markWidth) * scale}px`,
                "--mavion-logo-source-top": `${-logoCrop.top * scale}px`,
                "--mavion-logo-source-width": `${logoCrop.sourceWidth * scale}px`,
                "--mavion-logo-width": `${logoCrop.width * scale}px`,
            } as CSSProperties}
        >
            <span className="brand-logo__asset">
                <img alt="" aria-hidden="true" className="brand-logo__source" draggable={false} src={logoAssetUrl}/>
                <span aria-hidden="true" className="brand-logo__mark"/>
            </span>
        </span>
    );
}
