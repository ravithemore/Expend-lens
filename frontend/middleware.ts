import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets and internal next paths immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg'
  ) {
    return NextResponse.next();
  }

  const jwt = request.cookies.get('jwt')?.value;

  const isAuthRequired = pathname === '/' || pathname.startsWith('/wrapped') || pathname.startsWith('/investments') || pathname.startsWith('/insights');
  const isGuestOnly = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthRequired && !jwt) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && jwt) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Safe wild-card matcher; filters are processed programmatically above
  matcher: ['/:path*'],
};
