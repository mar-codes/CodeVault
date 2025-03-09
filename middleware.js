import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.startsWith('/dashboard') ||
    path.startsWith('/profile') ||
    path.startsWith('/create');

  const isAuthPath = path.startsWith('/auth/login') ||
    path.startsWith('/auth/signup');

  const token = request.cookies.get('auth_token')?.value;

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/create/:path*',
  ],
};
