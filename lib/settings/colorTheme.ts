import type { ColorThemeId } from 'types/settings';

import config from 'configs/app';
import type { ColorMode } from 'toolkit/chakra/color-mode';

export interface ColorTheme {
  id: ColorThemeId;
  label: string;
  colorMode: ColorMode;
  hex: string;
  sampleBg: string;
}

const getNestedValue = (obj: Record<string, unknown>, property: string) => {
  const keys = property.split('.');
  let current = obj;
  for (const key of keys) {
    const value = current[key];
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      current = value as Record<string, unknown>;
    } else {
      return value;
    }
  }
};

export function getThemeHexWithOverrides(colorThemeId: ColorThemeId) {
  const defaultHex = COLOR_THEMES.find((theme) => theme.id === colorThemeId)?.hex;

  if (!defaultHex) {
    return;
  }

  const overrides = config.UI.colorTheme.overrides;
  if (colorThemeId === 'light') {
    const value = getNestedValue(overrides, 'bg.primary._light.value');
    return typeof value === 'string' ? value : defaultHex;
  }

  if (colorThemeId === 'dark') {
    const value = getNestedValue(overrides, 'bg.primary._dark.value');
    return typeof value === 'string' ? value : defaultHex;
  }

  return defaultHex;
}

export function getDefaultColorTheme(colorMode: ColorMode) {
  const colorTheme = COLOR_THEMES.filter((theme) => theme.colorMode === colorMode).slice(-1)[0];

  return colorTheme.id;
}

export const COLOR_THEMES: Array<ColorTheme> = [
  {
    id: 'light',
    label: 'Light',
    colorMode: 'light',
    hex: '#FFFFFF',
    // Image Slura en mode Light (overlay très clair)
    sampleBg:
      'linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url(/icons/Slura.png)',
  },
  {
    id: 'dim',
    label: 'Dim',
    colorMode: 'dark',
    hex: '#232B37',
    // Image Slura en mode Dark (overlay moyen)
    sampleBg:
      'linear-gradient(rgba(35,43,55,0.75), rgba(35,43,55,0.75)), url(/icons/Slura.png)',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    colorMode: 'dark',
    hex: '#1B2E48',
    // Image Slura en mode Midnight (overlay plus sombre)
    sampleBg:
      'linear-gradient(rgba(27,46,72,0.82), rgba(27,46,72,0.82)), url(/icons/Slura.png)',
  },
  {
    id: 'dark',
    label: 'Dark',
    colorMode: 'dark',
    hex: '#101112',
    // Image Slura en mode Dark pur (overlay le plus sombre)
    sampleBg:
      'linear-gradient(rgba(16,17,18,0.85), rgba(16,17,18,0.85)), url(/icons/Slura.png)',
  },
];