'use client';
import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { IUser } from '../interfaces';

export const USER_STORAGE_KEY = 'his_user';
export const TOKEN_STORAGE_KEY = 'his_token';
const COOKIE_EXPIRY = 1;

export const useUser = () => {
  const [user, _setUser] = useState<(IUser & { token?: string }) | null>(() => {
    const storedUser = Cookies.get(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setUser = useCallback((newUser: (IUser & { token: string }) | null) => {
    if (newUser) {
      const { token, ...userData } = newUser;
      Cookies.set(USER_STORAGE_KEY, JSON.stringify(userData), { expires: COOKIE_EXPIRY, path: '/' });
      Cookies.set(TOKEN_STORAGE_KEY, token, { expires: COOKIE_EXPIRY, path: '/' });
    } else {
      Cookies.remove(USER_STORAGE_KEY, { path: '/' });
      Cookies.remove(TOKEN_STORAGE_KEY, { path: '/' });
    }
    _setUser(newUser);
  }, []);

  const getToken = useCallback((): string => {
    const token = Cookies.get(TOKEN_STORAGE_KEY);
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  return { user, setUser, getToken };
};
