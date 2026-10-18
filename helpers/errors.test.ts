import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { extractErrorMessage, isFailureEnvelope } from './errors';

const failure = (data: unknown, status = 400) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    data,
    status,
    statusText: '',
    headers: {},
    config: {} as never,
  });

describe('extractErrorMessage', () => {
  it('shows the API failure envelope message', () => {
    const error = failure({
      status: 'failed',
      error: { code: 'BAD_REQUEST', message: 'The amount is more than the balance' },
    });
    expect(extractErrorMessage(error)).toBe('The amount is more than the balance');
  });

  it('joins validation messages', () => {
    expect(extractErrorMessage(failure({ message: ['name is required', 'fee must be a number'] }))).toBe(
      'name is required, fee must be a number',
    );
  });

  it('uses the fallback when there is nothing to show', () => {
    expect(extractErrorMessage(new Error('boom'), 'Could not save')).toBe('Could not save');
  });
});

describe('isFailureEnvelope', () => {
  it('only matches the failure shape', () => {
    expect(isFailureEnvelope({ status: 'failed', error: { code: 'X', message: 'y' } })).toBe(true);
    expect(isFailureEnvelope({ status: 'success', data: {} })).toBe(false);
    expect(isFailureEnvelope(null)).toBe(false);
  });
});
