import { describe, it, expect } from 'vitest';

/**
 * Converts a 6-digit hex color to sRGB relative luminance
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculates WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Theme Color Contrast & WCAG 2.1 AA/AAA Compliance', () => {
  describe('Light Theme Surface Contrasts', () => {
    const lightSurfaceBg = '#f8fafc'; // --bg-primary

    it('should satisfy WCAG AAA (>= 7:1) for primary text on light background', () => {
      const textPrimary = '#0f172a'; // --text-primary
      const ratio = getContrastRatio(textPrimary, lightSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AAA (>= 7:1) for secondary text on light background', () => {
      const textSecondary = '#334155'; // --text-secondary
      const ratio = getContrastRatio(textSecondary, lightSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AA (>= 4.5:1) for muted text on light background', () => {
      const textMuted = '#64748b'; // --text-muted
      const ratio = getContrastRatio(textMuted, lightSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should satisfy WCAG AA (>= 4.5:1) for brand accent and status text colors on light background', () => {
      const accentPrimary = '#0369a1';
      const statusSuccess = '#047857';
      const statusWarning = '#b45309';
      const statusDanger = '#b91c1c';

      expect(getContrastRatio(accentPrimary, lightSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusSuccess, lightSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusWarning, lightSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusDanger, lightSurfaceBg)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Theme Surface Contrasts', () => {
    const darkSurfaceBg = '#020617'; // --bg-primary

    it('should satisfy WCAG AAA (>= 7:1) for primary text on dark background', () => {
      const textPrimary = '#f8fafc'; // --text-primary
      const ratio = getContrastRatio(textPrimary, darkSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AAA (>= 7:1) for secondary text on dark background', () => {
      const textSecondary = '#cbd5e1'; // --text-secondary
      const ratio = getContrastRatio(textSecondary, darkSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    it('should satisfy WCAG AA (>= 4.5:1) for muted text on dark background', () => {
      const textMuted = '#94a3b8'; // --text-muted
      const ratio = getContrastRatio(textMuted, darkSurfaceBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should satisfy WCAG AA (>= 4.5:1) for light accent and status colors on dark background', () => {
      const accentPrimary = '#38bdf8';
      const statusSuccess = '#34d399';
      const statusWarning = '#fbbf24';
      const statusDanger = '#f87171';

      expect(getContrastRatio(accentPrimary, darkSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusSuccess, darkSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusWarning, darkSurfaceBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(statusDanger, darkSurfaceBg)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
