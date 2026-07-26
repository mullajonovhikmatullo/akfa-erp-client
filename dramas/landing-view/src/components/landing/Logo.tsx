import { site } from "../../config/site";

type LogoProps = {
  className?: string;
  markSize?: number;
  showWordmark?: boolean;
};

export function Logo({ className = "", markSize = 28, showWordmark = true }: LogoProps) {
  return (
    <span className={`brand-logo ${className}`} aria-label={site.brand.name}>
      <StoreManagerMark size={markSize} />
      {showWordmark ? (
        <span className="brand-logo__wordmark">
          <strong>Store</strong>
          <span>Manager</span>
        </span>
      ) : null}
    </span>
  );
}

export function StoreManagerMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="brand-logo__mark"
    >
      <defs>
        <linearGradient id="store-manager-tile" x1="3" y1="2" x2="29" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C78F2" />
          <stop offset="1" stopColor="#2855D9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#store-manager-tile)" />
      <rect x="8" y="8" width="16" height="16" rx="3" stroke="white" strokeWidth="1.8" />
      <path d="M13 9.5V22.5M19 9.5V22.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export const KvonMark = StoreManagerMark;
