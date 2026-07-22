import type { ComponentType } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type AppIconComponent = ComponentType<{
  size?: number;
  weight?: IconWeight;
  className?: string;
  color?: string;
}>;

export interface NavigationItem {
  id: string;
  label: string;
  icon: AppIconComponent;
  path?: string;
  children?: NavigationItem[];
}
