'use client';

import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import api from '@/helpers/axios';

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await api.get<T>(url);
  return response.data;
};

export default function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
