import { describe, expect, it } from 'vitest';
import { DEFAULT_PASSWORD_MIN_LENGTH, isValidPassword, passwordRules } from './password-policy';

describe('password policy', () => {
  it('follows the configured minimum length', () => {
    expect(isValidPassword('Clinic2026', 10)).toBe(true);
    expect(isValidPassword('Clinic2026', 12)).toBe(false);
  });

  it('needs a letter and a number', () => {
    expect(isValidPassword('onlyletterss', DEFAULT_PASSWORD_MIN_LENGTH)).toBe(false);
    expect(isValidPassword('1234567890123', DEFAULT_PASSWORD_MIN_LENGTH)).toBe(false);
  });

  it('labels the length rule with the minimum', () => {
    expect(passwordRules(12)[0].label).toBe('At least 12 characters');
  });
});
