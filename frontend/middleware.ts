import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. Skip static assets immediately
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/assets') ||
      pathname === '/favicon.ico' ||
      pathname === '/favicon.svg'
    ) {
      return NextResponse.next();
    }

    // 2. Safely read the JWT cookie (prevent crash if cookies object is undefined)
    let jwt: string | undefined = undefined;
    if (request.cookies) {
      const cookie = request.cookies.get('jwt');
      if (cookie) {
        jwt = cookie.value;
      }
    }

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
  } catch (error) {
    // Catch any Edge Runtime errors safely and continue to let the client load
    console.error("Middleware invocation exception caught safely:", error);
    return NextResponse.next();
  }
}

export const config = {
  // Safe wild-card matcher; filters are processed programmatically above
  matcher: ['/:path*'],
};
