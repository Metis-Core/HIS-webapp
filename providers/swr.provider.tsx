'use client';

import { SWRConfig } from 'swr';
import { api } from '@/helpers/axios';

const fetcher = (url: string) =>
  api.get(url).then((r) => {
    const body = r.data;
    return body && typeof body === 'object' && body.status === 'success' && 'data' in body ? body.data : body;
  });

export default function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
