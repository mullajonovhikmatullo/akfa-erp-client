import { Alert } from 'antd';
import type { PlatformLoginAttempts } from '@store/platform-stub';

type LoginAttemptsNoticeProps = {
  attempts: PlatformLoginAttempts | undefined;
  lockSecondsLeft: number;
};

export const formatLockCountdown = (seconds: number) => {
  //
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

export const LoginAttemptsNotice = ({ attempts, lockSecondsLeft }: LoginAttemptsNoticeProps) => {
  //
  if (!attempts) return null;

  if (lockSecondsLeft > 0) {
    return (
      <Alert
        type="error"
        showIcon
        message="Kirish vaqtincha bloklandi"
        description={`${attempts.maxAttempts} ta urinishning barchasi xato ketdi. Qayta urinish ${formatLockCountdown(lockSecondsLeft)} dan keyin ochiladi.`}
      />
    );
  }

  if (attempts.failedAttempts > 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Login yoki parol noto‘g‘ri"
        description={`Xato urinishlar: ${attempts.failedAttempts} / ${attempts.maxAttempts}. Qolgan urinishlar: ${attempts.remainingAttempts}.`}
      />
    );
  }

  return (
    <p className="platform-login__attempts">
      Kirish uchun {attempts.maxAttempts} ta urinish bor. Hammasi xato ketsa, kirish 30 daqiqaga bloklanadi.
    </p>
  );
};
