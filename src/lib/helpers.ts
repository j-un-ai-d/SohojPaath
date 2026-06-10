/**
 * helpers.ts
 * Pure logic functions extracted from App.tsx and LoginPage.tsx.
 * Kept separate so they can be unit-tested without importing React components.
 */

import type { ReadingSession } from '../types';

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string (used for streak tracking). */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Streak calculation ────────────────────────────────────────────────────────

/**
 * Calculates the current reading streak.
 *
 * Rules:
 *  - If lastReadDate is today  → streak unchanged (already counted)
 *  - If lastReadDate was yesterday → streak + 1
 *  - Anything older            → streak resets to 1
 */
export function calcStreak(
  _sessions: ReadingSession[],
  currentStreak: number,
  lastReadDate: string
): number {
  const today     = todayStr();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (lastReadDate === today)      return currentStreak;
  if (lastReadDate === yesterday)  return currentStreak + 1;
  return 1;
}

// ── Email validation ──────────────────────────────────────────────────────────

/** Returns true when the string looks like a valid email address. */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Password hashing ──────────────────────────────────────────────────────────

/**
 * Simple deterministic hash used for local-only credential storage.
 * NOT cryptographically secure — only suitable for a localStorage demo.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;   // force 32-bit integer
  }
  return hash.toString(36);
}

// ── Language detection ────────────────────────────────────────────────────────

/**
 * Detects whether a text string contains Bengali characters.
 * Bengali Unicode block: U+0980–U+09FF
 */
export function isBengaliText(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

// ── Risk level labelling ──────────────────────────────────────────────────────

/**
 * Converts a behavioral model probability (0–1) into a risk label.
 * Thresholds come from model_config.json / Section 5.1.2 of the report.
 */
export function getRiskLevel(probability: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (probability >= 0.60) return 'HIGH';
  if (probability >= 0.35) return 'MEDIUM';
  return 'LOW';
}
