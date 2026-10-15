import type { PlatformLoginAttempts } from '@store/platform-stub';
import { cn } from '../../../shared/lib/cn';

export const formatCountdown = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function AttemptDots({ attempts, locked }: { attempts: PlatformLoginAttempts; locked: boolean }) {
  //
  const label = locked
    ? `${attempts.maxAttempts} ta urinishning barchasi xato ketdi`
    : attempts.failedAttempts > 0
      ? `${attempts.failedAttempts} ta xato · ${attempts.remainingAttempts} ta urinish qoldi`
      : `${attempts.maxAttempts} ta urinish, keyin 30 daqiqaga blok`;

  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: attempts.maxAttempts }, (_, index) => (
          <span
            key={index}
            className={cn(
              'size-1.5 rounded-full transition-colors duration-300',
              index < attempts.failedAttempts ? 'bg-danger' : 'bg-border-strong',
            )}
          />
        ))}
      </div>
    </div>
  );
}
