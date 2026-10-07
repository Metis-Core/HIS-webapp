'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (v: boolean) => void;
}

const COLLAPSED_STORAGE_KEY = 'his:sidebar-collapsed';

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCollapsedState(window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1');
    }
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, value ? '1' : '0');
  }, []);

  const toggle = useCallback(() => setMobileOpen((v) => !v), []);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, toggle, setMobileOpen }),
    [collapsed, setCollapsed, mobileOpen, toggle],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
