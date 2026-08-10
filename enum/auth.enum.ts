export enum AuthEndpointEnum {
  LOGIN = '/auth/login',
  SIGNUP = '/auth/signup',
  REFRESH = '/auth/refresh',
  LOGOUT = '/auth/logout',
  ME = '/auth/me',
}

export enum AuthCookieEnum {
  REFRESH_TOKEN = 'rt',
}

export enum JwtTokenTypeEnum {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum AuthErrorCodeEnum {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  MUST_RESET_PASSWORD = 'MUST_RESET_PASSWORD',
  REFRESH_FAILED = 'REFRESH_FAILED',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export enum AuthStatusEnum {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}
