import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const rawCookie = req.cookies.get('auth_token');
  const token = typeof rawCookie === 'string' ? rawCookie : rawCookie?.value;

  const isProtected = pathname.startsWith('/dashboard');

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
