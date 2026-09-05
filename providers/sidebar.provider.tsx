'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const STORAGE_KEY = 'his:sidebar-collapsed';

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === '1') setCollapsed(true);
  }, []);

  const setCollapsedPersisted = useCallback((v: boolean) => {
    setCollapsed(v);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    }
  }, []);

  const toggle = useCallback(() => setCollapsedPersisted(!collapsed), [collapsed, setCollapsedPersisted]);

  const value = useMemo(
    () => ({ collapsed, toggle, setCollapsed: setCollapsedPersisted }),
    [collapsed, toggle, setCollapsedPersisted],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
