'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IAuthContext, IAuthState, ILoginDto, IUser } from '@/interfaces';
import { AuthStatusEnum, UserRoleEnum } from '@/enum';
import authService from '@/helpers/auth.service';
import { roleInGroup } from '@/helpers/role-groups';
import tokenStore from '@/helpers/tokens';

const AuthContext = createContext<IAuthContext | null>(null);

const VIEW_AS_KEY = 'metis.viewAsRole';

const readViewAs = (): UserRoleEnum | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.sessionStorage.getItem(VIEW_AS_KEY);
  return Object.values(UserRoleEnum).find((r) => r === stored) ?? null;
};

const INITIAL_STATE: IAuthState = {
  status: AuthStatusEnum.IDLE,
  user: null,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<IAuthState>(INITIAL_STATE);
  const bootstrapped = useRef(false);
  const [viewAs, setViewAs] = useState<UserRoleEnum | null>(readViewAs);

  const viewAsRole = useCallback((role: UserRoleEnum | null) => {
    if (role) window.sessionStorage.setItem(VIEW_AS_KEY, role);
    else window.sessionStorage.removeItem(VIEW_AS_KEY);
    setViewAs(role);
  }, []);

  const isAdminUser = roleInGroup(state.user?.role, 'ADMINS');
  const effectiveRole = state.user ? (isAdminUser && viewAs ? viewAs : state.user.role) : null;
  const isRolePicked = !isAdminUser || viewAs !== null;

  const isAuthenticated = state.status === AuthStatusEnum.AUTHENTICATED;
  const isLoading = state.status === AuthStatusEnum.IDLE || state.status === AuthStatusEnum.LOADING;

  const bootstrap = useCallback(async () => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    if (!tokenStore.hasSession()) {
      setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error: null });
      return;
    }

    setState((s) => ({ ...s, status: AuthStatusEnum.LOADING }));
    try {
      if (!tokenStore.getAccessToken()) {
        await authService.refresh();
      }
      const user = await authService.me();
      setState({ status: AuthStatusEnum.AUTHENTICATED, user, error: null });
    } catch {
      tokenStore.clear();
      setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error: null });
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (dto: ILoginDto): Promise<IUser> => {
      setState((s) => ({ ...s, status: AuthStatusEnum.LOADING, error: null }));
      try {
        const { user } = await authService.login(dto);
        viewAsRole(null);
        setState({ status: AuthStatusEnum.AUTHENTICATED, user, error: null });
        router.replace('/');
        return user;
      } catch (err: any) {
        const message = err?.response?.data?.message ?? 'Login failed';
        const error = { code: err?.response?.data?.code ?? 'UNKNOWN', message };
        setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error });
        throw error;
      }
    },
    [router, viewAsRole],
  );

  const logout = useCallback(
    async (options?: { allDevices?: boolean }) => {
      await authService.logout(options?.allDevices);
      viewAsRole(null);
      setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error: null });
      router.replace('/auth');
    },
    [router, viewAsRole],
  );

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.me();
      setState((s) => ({ ...s, user }));
      return user;
    } catch {
      return undefined;
    }
  }, []);

  const value = useMemo<IAuthContext>(
    () => ({
      ...state,
      isAuthenticated,
      isLoading,
      effectiveRole,
      isRolePicked,
      viewAsRole,
      login,
      logout,
      refreshUser,
    }),
    [state, isAuthenticated, isLoading, effectiveRole, isRolePicked, viewAsRole, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
