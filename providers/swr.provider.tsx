'use client';

import { SWRConfig } from 'swr';
import { api } from '@/helpers/axios';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

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
