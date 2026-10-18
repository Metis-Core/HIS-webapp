export const DEFAULT_PASSWORD_MIN_LENGTH = 10;

export interface IPasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const passwordRules = (minLength: number): IPasswordRule[] => [
  { label: `At least ${minLength} characters`, test: (v) => v.length >= minLength },
  { label: 'At least one letter', test: (v) => /[A-Za-z]/.test(v) },
  { label: 'At least one number', test: (v) => /\d/.test(v) },
];

export const isValidPassword = (value: string, minLength: number) =>
  passwordRules(minLength).every((rule) => rule.test(value));
