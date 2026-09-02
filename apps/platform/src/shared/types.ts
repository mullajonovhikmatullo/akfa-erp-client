export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export type AppIconName = string;

export interface NavigationItem {
  id: string;
  label: string;
  icon: AppIconName;
  path?: string;
  children?: NavigationItem[];
}
