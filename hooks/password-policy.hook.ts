'use client';

import useSWR from 'swr';
import { AuthEndpointEnum } from '@/enum';
import { DEFAULT_PASSWORD_MIN_LENGTH } from '@/helpers/password-policy';

/** The API decides the minimum length (PASSWORD_MIN_LENGTH); the default applies while it loads. */
export function usePasswordPolicy() {
  const { data } = useSWR<{ minLength: number }>(AuthEndpointEnum.PASSWORD_POLICY, { revalidateOnFocus: false });
  return { minLength: data?.minLength ?? DEFAULT_PASSWORD_MIN_LENGTH };
}
