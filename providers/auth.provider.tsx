'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IAuthContext, IAuthState, ILoginDto, ISignupDto, IUser } from '@/interfaces';
import { AuthStatusEnum } from '@/enum';
import authService from '@/helpers/auth.service';
import tokenStore from '@/helpers/tokens';

const AuthContext = createContext<IAuthContext | null>(null);

const INITIAL_STATE: IAuthState = {
  status: AuthStatusEnum.IDLE,
  user: null,
  error: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<IAuthState>(INITIAL_STATE);
  const bootstrapped = useRef(false);

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
    [router],
  );

  const signup = useCallback(
    async (dto: ISignupDto): Promise<IUser> => {
      setState((s) => ({ ...s, status: AuthStatusEnum.LOADING, error: null }));
      try {
        const { user } = await authService.signup(dto);
        setState({ status: AuthStatusEnum.AUTHENTICATED, user, error: null });
        router.replace('/');
        return user;
      } catch (err: any) {
        const message = err?.response?.data?.message ?? 'Signup failed';
        const error = { code: err?.response?.data?.code ?? 'UNKNOWN', message };
        setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error });
        throw error;
      }
    },
    [router],
  );

  const logout = useCallback(
    async (options?: { allDevices?: boolean }) => {
      await authService.logout(options?.allDevices);
      setState({ status: AuthStatusEnum.UNAUTHENTICATED, user: null, error: null });
      router.replace('/auth');
    },
    [router],
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
    () => ({ ...state, isAuthenticated, isLoading, login, signup, logout, refreshUser }),
    [state, isAuthenticated, isLoading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
