'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR, { mutate as globalMutate } from 'swr';
import { AuthEndpointEnum, AuthErrorCodeEnum, AuthStatusEnum } from '@/enum';
import authService, { AuthApiError } from '@/helpers/auth.service';
import tokenStore from '@/helpers/tokens';
import type { IAuthContext, IAuthError, ILoginDto, ISignupDto, IUser } from '@/interfaces';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const clearAllSwrCache = () => globalMutate(() => true, undefined, { revalidate: false });

const toAuthError = (error: unknown): IAuthError => {
  if (error instanceof AuthApiError) {
    return { code: error.code, message: error.message, statusCode: error.statusCode };
  }
  return {
    code: AuthErrorCodeEnum.UNKNOWN,
    message: (error as Error)?.message ?? 'Unknown error',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasSession = typeof window !== 'undefined' && tokenStore.hasSession();
  const swrKey = hasSession ? AuthEndpointEnum.ME : null;

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<IUser>(swrKey, () => authService.me(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const login = useCallback(
    async (dto: ILoginDto): Promise<IUser> => {
      const tokens = await authService.login(dto);
      const nextUser = await mutate(() => authService.me(), {
        revalidate: false,
        populateCache: true,
      });
      const target = searchParams?.get('next') ?? '/';
      router.replace(target);
      if (tokens.mustResetPassword && nextUser) {
        return { ...nextUser, mustResetPassword: true };
      }
      return nextUser as IUser;
    },
    [mutate, router, searchParams],
  );

  const signup = useCallback(
    async (dto: ISignupDto): Promise<IUser> => {
      await authService.signup(dto);
      const nextUser = await mutate(() => authService.me(), {
        revalidate: false,
        populateCache: true,
      });
      router.replace('/');
      return nextUser as IUser;
    },
    [mutate, router],
  );

  const logout = useCallback(
    async (options: { allDevices?: boolean } = {}): Promise<void> => {
      await authService.logout(options);
      await mutate(undefined, { revalidate: false });
      await clearAllSwrCache();
      if (pathname !== '/auth') router.replace('/auth');
    },
    [mutate, pathname, router],
  );

  const refreshUser = useCallback(async () => mutate(), [mutate]);

  const value = useMemo<IAuthContext>(() => {
    const status: AuthStatusEnum = !hasSession
      ? AuthStatusEnum.UNAUTHENTICATED
      : isLoading
        ? AuthStatusEnum.LOADING
        : user
          ? AuthStatusEnum.AUTHENTICATED
          : AuthStatusEnum.UNAUTHENTICATED;

    return {
      status,
      user: user ?? null,
      error: error ? toAuthError(error) : null,
      isAuthenticated: status === AuthStatusEnum.AUTHENTICATED,
      isLoading: status === AuthStatusEnum.LOADING,
      login,
      signup,
      logout,
      refreshUser,
    };
  }, [error, hasSession, isLoading, login, logout, refreshUser, signup, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthProvider;
