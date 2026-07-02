import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRequired = pathname === '/' || pathname.startsWith('/wrapped');
  const isGuestOnly = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthRequired && !jwt) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isGuestOnly && jwt) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static symbols)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
