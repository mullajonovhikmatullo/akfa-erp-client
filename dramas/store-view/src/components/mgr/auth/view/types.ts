import type { LoginResponse } from '@store/store-stub';

export type TFunc = (key: string) => string;

export type LoginLanguage = 'uz-cy' | 'uz-la' | 'ru' | 'en';

export interface LoginFormProps {
  t: TFunc;
  sessionExpired: boolean;
  externalError?: string | null;
  onAuthenticated: (response: LoginResponse) => void;
}

export interface LoginPanelProps extends LoginFormProps {
  language: LoginLanguage;
  onLanguageChange: (language: LoginLanguage) => void;
}
