import { site } from "../../config/site";

type LogoProps = {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
};

/**
 * Kvon brand logo.
 * The "K" mark is a premium, geometric monogram — a solid rounded tile
 * with a precision-cut K formed by two angled strokes and an accent notch.
 * The wordmark keeps "K" visually distinct with a slightly heavier weight.
 */
export function Logo({ className = "", markSize = 28, showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label={site.brand.name}>
      <KvonMark size={markSize} />
      {showWordmark && (
        <span className="inline-flex items-baseline gap-1 text-[15px] tracking-tight leading-none">
          <span className="font-extrabold text-foreground">K</span>
          <span className="font-semibold text-foreground/90">von</span>
          <span className="text-[12px] font-semibold text-primary">Admin</span>
        </span>
      )}
    </span>
  );
}

export function KvonMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="kvon-tile" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.88" />
        </linearGradient>
      </defs>
      {/* Rounded tile */}
      <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#kvon-tile)" />
      {/* Subtle top highlight for premium feel */}
      <rect x="0" y="0" width="32" height="16" rx="8" fill="white" fillOpacity="0.08" />
      {/* K monogram — vertical stem + two angled strokes */}
      <path
        d="M10 7.5 V24.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M22.5 7.5 L11.8 16 L22.5 24.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Accent dot — premium notch */}
      <circle cx="24.4" cy="24.4" r="1.35" fill="white" />
    </svg>
  );
}
