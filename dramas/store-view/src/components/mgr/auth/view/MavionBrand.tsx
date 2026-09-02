type MavionBrandProps = {
  inverted?: boolean;
  compact?: boolean;
};

export function MavionBrand({ inverted = false, compact = false }: MavionBrandProps) {
  return (
    <div className={`mavion-brand${inverted ? ' mavion-brand--inverted' : ''}${compact ? ' mavion-brand--compact' : ''}`}>
      <svg className="mavion-brand__mark" viewBox="0 0 52 38" aria-hidden="true">
        <defs>
          <linearGradient id="mavion-mark-gradient" x1="3" y1="4" x2="49" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#28A9F4" />
            <stop offset=".48" stopColor="#0476D0" />
            <stop offset="1" stopColor="#03558F" />
          </linearGradient>
        </defs>
        <path
          fill="url(#mavion-mark-gradient)"
          d="M3.2 31.8 14.7 7.2A6.2 6.2 0 0 1 20.3 3.6h8.4l-8.2 17.6 7.9-13.8a7.4 7.4 0 0 1 6.4-3.8h13.9L36.3 31.8a4.5 4.5 0 0 1-4.1 2.7h-6.9a4.5 4.5 0 0 1-4.1-6.3l2-4.5-4.6 8.1a5.4 5.4 0 0 1-4.7 2.7H5.1a2.1 2.1 0 0 1-1.9-2.7Z"
        />
      </svg>
      <span className="mavion-brand__name">Mavion</span>
    </div>
  );
}
