import {
  isPlatformOwner,
  PlatformFlowApi,
  PLATFORM_TOKEN_KEY as STUB_PLATFORM_TOKEN_KEY,
  PLATFORM_USER_KEY as STUB_PLATFORM_USER_KEY,
} from '@store/platform-stub';
import type { PlatformLoginResponse, PlatformUser } from '@store/platform-stub';

export const PLATFORM_TOKEN_KEY = STUB_PLATFORM_TOKEN_KEY;
export const PLATFORM_USER_KEY = STUB_PLATFORM_USER_KEY;
export { isPlatformOwner };

export class PlatformAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformAuthError';
  }
}

export const readPlatformToken = () => localStorage.getItem(PLATFORM_TOKEN_KEY);

export const readPlatformUser = (): PlatformUser | null => {
  const rawUser = localStorage.getItem(PLATFORM_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as PlatformUser;
  } catch {
    return null;
  }
};

export const savePlatformSession = ({ accessToken, user }: PlatformLoginResponse) => {
  localStorage.setItem(PLATFORM_TOKEN_KEY, accessToken);
  localStorage.setItem(PLATFORM_USER_KEY, JSON.stringify(user));
};

export const clearPlatformSession = () => {
  localStorage.removeItem(PLATFORM_TOKEN_KEY);
  localStorage.removeItem(PLATFORM_USER_KEY);
};

export const loginPlatformOwner = async (username: string, password: string): Promise<PlatformLoginResponse> => {
  const result = await PlatformFlowApi.login({ username, password });

  if (!isPlatformOwner(result.user)) {
    throw new PlatformAuthError('Bu panel faqat platform admin uchun');
  }

  return result;
};
