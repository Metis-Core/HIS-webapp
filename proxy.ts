import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthCookieEnum } from '@/enum';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AuthCookieEnum.REFRESH_TOKEN);
  const isAuthRoute = pathname.startsWith('/auth');

  if (!hasSession && !isAuthRoute) {
    const url = new URL('/auth', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
