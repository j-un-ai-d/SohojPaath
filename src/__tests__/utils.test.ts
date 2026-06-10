import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn() — Tailwind class merger', () => {

  it('returns a single class unchanged', () => {
    expect(cn('text-sm')).toBe('text-sm');
  });

  it('joins multiple classes with a space', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold');
  });

  it('ignores falsy values (false, null, undefined)', () => {
    expect(cn('text-sm', false, null, undefined, 'font-bold'))
      .toBe('text-sm font-bold');
  });

  it('includes only truthy conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'bg-primary', isDisabled && 'opacity-50'))
      .toBe('base bg-primary');
  });

  it('deduplicates conflicting Tailwind utilities (last one wins)', () => {
    // Tailwind-merge resolves conflicts: text-sm and text-lg both set font-size
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('handles an empty call without throwing', () => {
    expect(() => cn()).not.toThrow();
    expect(cn()).toBe('');
  });

  it('flattens array arguments', () => {
    expect(cn(['px-4', 'py-2'], 'rounded')).toBe('px-4 py-2 rounded');
  });

});
