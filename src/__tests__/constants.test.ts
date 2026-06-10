import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS, THEMES, FONTS, OVERLAY_COLORS } from '../constants';

// ─────────────────────────────────────────────────────────────────────────────
describe('DEFAULT_SETTINGS', () => {

  it('contains all required ReadingSettings keys', () => {
    const required = [
      'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing',
      'paragraphWidth', 'fontFamily', 'theme', 'overlayColor',
      'lineFocus', 'readingRuler', 'segmentedView', 'ttsSpeed', 'voice',
    ];
    required.forEach(key => {
      expect(DEFAULT_SETTINGS).toHaveProperty(key);
    });
  });

  it('sets fontSize within the accessible range (12–48 px)', () => {
    expect(DEFAULT_SETTINGS.fontSize).toBeGreaterThanOrEqual(12);
    expect(DEFAULT_SETTINGS.fontSize).toBeLessThanOrEqual(48);
  });

  it('sets lineHeight to a readable value (>= 1.5)', () => {
    expect(DEFAULT_SETTINGS.lineHeight).toBeGreaterThanOrEqual(1.5);
  });

  it('defaults to the light theme', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('light');
  });

  it('defaults to no color overlay (null)', () => {
    expect(DEFAULT_SETTINGS.overlayColor).toBeNull();
  });

  it('defaults segmentedView, lineFocus, and readingRuler to false', () => {
    expect(DEFAULT_SETTINGS.segmentedView).toBe(false);
    expect(DEFAULT_SETTINGS.lineFocus).toBe(false);
    expect(DEFAULT_SETTINGS.readingRuler).toBe(false);
  });

  it('includes OpenDyslexic as the default font family', () => {
    expect(DEFAULT_SETTINGS.fontFamily).toContain('OpenDyslexic');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('THEMES', () => {

  const expectedThemes = ['light', 'dark', 'sepia', 'high-contrast', 'blue-light'];

  it('contains exactly the five supported themes', () => {
    expectedThemes.forEach(name => {
      expect(THEMES).toHaveProperty(name);
    });
  });

  it('each theme entry has bg, text, and card properties', () => {
    Object.values(THEMES).forEach(theme => {
      expect(theme).toHaveProperty('bg');
      expect(theme).toHaveProperty('text');
      expect(theme).toHaveProperty('card');
    });
  });

  it('no theme property is an empty string', () => {
    Object.values(THEMES).forEach(theme => {
      expect(theme.bg.length).toBeGreaterThan(0);
      expect(theme.text.length).toBeGreaterThan(0);
      expect(theme.card.length).toBeGreaterThan(0);
    });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('FONTS', () => {

  it('contains at least one font entry', () => {
    expect(FONTS.length).toBeGreaterThan(0);
  });

  it('each font entry has name and value fields', () => {
    FONTS.forEach(font => {
      expect(font).toHaveProperty('name');
      expect(font).toHaveProperty('value');
      expect(font.name.length).toBeGreaterThan(0);
      expect(font.value.length).toBeGreaterThan(0);
    });
  });

  it('includes OpenDyslexic (the primary accessibility font)', () => {
    const names = FONTS.map(f => f.name);
    expect(names).toContain('OpenDyslexic');
  });

  it('includes Noto Bengali for Bengali-script support', () => {
    const values = FONTS.map(f => f.value);
    const hasBengali = values.some(v => v.includes('Noto'));
    expect(hasBengali).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('OVERLAY_COLORS', () => {

  it('contains at least one entry', () => {
    expect(OVERLAY_COLORS.length).toBeGreaterThan(0);
  });

  it('each entry has name and value fields', () => {
    OVERLAY_COLORS.forEach(color => {
      expect(color).toHaveProperty('name');
      expect(color).toHaveProperty('value');
    });
  });

  it('first entry is "None" with a null value (default = no overlay)', () => {
    expect(OVERLAY_COLORS[0].name).toBe('None');
    expect(OVERLAY_COLORS[0].value).toBeNull();
  });

  it('all non-None entries have RGBA values for transparent overlays', () => {
    OVERLAY_COLORS.filter(c => c.value !== null).forEach(color => {
      expect(color.value).toMatch(/^rgba\(/);
    });
  });

});
