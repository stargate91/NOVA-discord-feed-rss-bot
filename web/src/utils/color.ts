export const PRESET_COLORS = [
  '#FF0000', // YouTube
  '#9146FF', // Twitch
  '#53fc18', // Kick
  '#ee802f', // RSS
  '#f3ba2f', // Crypto
  '#ffffff', // GitHub
  '#66c0f4', // Steam
  '#313131', // Epic Games
  '#9a42f4', // GOG
  '#01b4e4', // TMDB
  '#7b2cbf', // Nova
] as const;

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

/**
 * Converts a hex color string to HSV object.
 */
export function hexToHsv(hex: string): HsvColor {
  let r = 0;
  let g = 0;
  let b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

/**
 * Converts an HSV object to hex color string.
 */
export function hsvToHex(h: number, s: number, v: number): string {
  let hue = h / 360;
  const sat = s / 100;
  const val = v / 100;
  let r = 0;
  let g = 0;
  let b = 0;
  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = val * (1 - sat);
  const q = val * (1 - f * sat);
  const t = val * (1 - (1 - f) * sat);
  switch (i % 6) {
    case 0:
      r = val;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = val;
      b = p;
      break;
    case 2:
      r = p;
      g = val;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = val;
      break;
    case 4:
      r = t;
      g = p;
      b = val;
      break;
    case 5:
      r = val;
      g = p;
      b = q;
      break;
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
