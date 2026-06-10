import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  todayStr,
  calcStreak,
  validateEmail,
  simpleHash,
  isBengaliText,
  getRiskLevel,
} from '../lib/helpers';

// ─────────────────────────────────────────────────────────────────────────────
describe('todayStr()', () => {

  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches today\'s date from the JS Date object', () => {
    const expected = new Date().toISOString().slice(0, 10);
    expect(todayStr()).toBe(expected);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('calcStreak()', () => {

  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const lastWeek  = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  it('returns current streak unchanged when lastReadDate is today', () => {
    expect(calcStreak([], 5, today)).toBe(5);
  });

  it('increments streak by 1 when lastReadDate was yesterday', () => {
    expect(calcStreak([], 4, yesterday)).toBe(5);
  });

  it('resets streak to 1 when the gap is more than one day', () => {
    expect(calcStreak([], 10, lastWeek)).toBe(1);
  });

  it('resets streak to 1 when there is no previous read date', () => {
    expect(calcStreak([], 0, '')).toBe(1);
  });

  it('handles a streak of 0 correctly (first-ever session)', () => {
    expect(calcStreak([], 0, yesterday)).toBe(1);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('validateEmail()', () => {

  it('accepts a standard email address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with subdomains', () => {
    expect(validateEmail('student@uni.edu.bd')).toBe(true);
  });

  it('rejects an email missing the @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects an email missing the domain part', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects an email with spaces', () => {
    expect(validateEmail('user name@example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('simpleHash()', () => {

  it('returns a non-empty string for a non-empty input', () => {
    expect(simpleHash('password123').length).toBeGreaterThan(0);
  });

  it('is deterministic — same input always gives same output', () => {
    expect(simpleHash('hello')).toBe(simpleHash('hello'));
  });

  it('produces different hashes for different inputs', () => {
    expect(simpleHash('abc')).not.toBe(simpleHash('xyz'));
  });

  it('handles an empty string without throwing', () => {
    expect(() => simpleHash('')).not.toThrow();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('isBengaliText()', () => {

  it('returns true for a string containing Bengali characters', () => {
    expect(isBengaliText('আমি বাংলায় গান গাই')).toBe(true);
  });

  it('returns true for mixed Bengali and English text', () => {
    expect(isBengaliText('Hello বাংলা')).toBe(true);
  });

  it('returns false for a purely English string', () => {
    expect(isBengaliText('Hello World')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isBengaliText('')).toBe(false);
  });

  it('returns false for numbers and punctuation only', () => {
    expect(isBengaliText('12345 !@#')).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
describe('getRiskLevel()', () => {

  it('returns HIGH for probability >= 0.60', () => {
    expect(getRiskLevel(0.60)).toBe('HIGH');
    expect(getRiskLevel(0.85)).toBe('HIGH');
    expect(getRiskLevel(1.00)).toBe('HIGH');
  });

  it('returns MEDIUM for probability between 0.35 and 0.59 (inclusive)', () => {
    expect(getRiskLevel(0.35)).toBe('MEDIUM');
    expect(getRiskLevel(0.50)).toBe('MEDIUM');
    expect(getRiskLevel(0.59)).toBe('MEDIUM');
  });

  it('returns LOW for probability below 0.35', () => {
    expect(getRiskLevel(0.34)).toBe('LOW');
    expect(getRiskLevel(0.10)).toBe('LOW');
    expect(getRiskLevel(0.00)).toBe('LOW');
  });

  it('handles exact boundary value 0.35 as MEDIUM', () => {
    expect(getRiskLevel(0.35)).toBe('MEDIUM');
  });

  it('handles exact boundary value 0.60 as HIGH', () => {
    expect(getRiskLevel(0.60)).toBe('HIGH');
  });

});
