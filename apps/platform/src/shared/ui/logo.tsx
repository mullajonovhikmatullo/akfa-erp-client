import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

// Same artwork and crop as the landing Logo: the wordmark is cut out of the PNG and the mark is
// an SVG mask painted in the brand blue. The PNG has a black backdrop; blending drops it on any surface.
const assetBase = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const crop = { height: 199, markWidth: 350, sourceHeight: 941, sourceWidth: 1672, top: 354, left: 321, width: 1033 };
const brandBlue = '#0476d0';

export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  //
  const scale = size / crop.height;
  const maskUrl = `url("${assetBase}brand/mavion-mark.svg")`;
  const mask: CSSProperties = {
    width: crop.markWidth * scale,
    height: size,
    background: brandBlue,
    maskImage: maskUrl,
    WebkitMaskImage: maskUrl,
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  };

  return (
    <span role="img" aria-label="Mavion" className={cn('relative block shrink-0 overflow-hidden', className)} style={{ width: crop.width * scale, height: size }}>
      <img
        src={`${assetBase}brand/mavion-logo.png`}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute max-w-none invert mix-blend-multiply dark:invert-0 dark:mix-blend-screen"
        style={{
          top: -crop.top * scale,
          left: -crop.left * scale,
          width: crop.sourceWidth * scale,
          height: crop.sourceHeight * scale,
          clipPath: `inset(0 0 0 ${(crop.left + crop.markWidth) * scale}px)`,
        }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute top-0 left-0" style={mask} />
    </span>
  );
}
