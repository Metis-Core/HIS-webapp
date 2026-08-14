import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthCookieEnum, UserRoleEnum } from '@/enum';

type RouteAccess = { prefix: string; roles: readonly UserRoleEnum[] };

const ADMINS = [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN] as const;
const FRONT_DESK_CLINICAL = [...ADMINS, UserRoleEnum.DOCTOR, UserRoleEnum.NURSE, UserRoleEnum.RECEPTIONIST] as const;
const CLINICAL_STAFF = [...ADMINS, UserRoleEnum.DOCTOR, UserRoleEnum.NURSE] as const;
const FLOOR_STAFF = [
  ...FRONT_DESK_CLINICAL,
  UserRoleEnum.LAB_TECH,
  UserRoleEnum.PHARMACIST,
  UserRoleEnum.ACCOUNTANT,
] as const;

const routeAccess: RouteAccess[] = [
  { prefix: '/settings', roles: ADMINS },
  { prefix: '/patients', roles: FRONT_DESK_CLINICAL },
  { prefix: '/triage', roles: FRONT_DESK_CLINICAL },
  { prefix: '/consultation', roles: CLINICAL_STAFF },
  { prefix: '/queue', roles: FLOOR_STAFF },
  { prefix: '/lab', roles: [...ADMINS, UserRoleEnum.DOCTOR, UserRoleEnum.LAB_TECH] },
  { prefix: '/appointments', roles: FRONT_DESK_CLINICAL },
];

const decodeRole = (token: string): UserRoleEnum | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return (JSON.parse(atob(padded)).role as UserRoleEnum) ?? null;
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AuthCookieEnum.REFRESH_TOKEN)?.value;
  const isAuthRoute = pathname.startsWith('/auth');

  if (!token) {
    if (isAuthRoute) return NextResponse.next();
    const url = new URL('/auth', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const guarded = routeAccess.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (guarded) {
    const role = decodeRole(token);
    if (role && !guarded.roles.includes(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
