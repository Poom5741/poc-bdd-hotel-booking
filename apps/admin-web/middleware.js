import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const rawCookie = req.cookies.get('admin_auth_token');
  const adminToken = typeof rawCookie === 'string' ? rawCookie : rawCookie?.value;
  
  const rawGuestCookie = req.cookies.get('auth_token');
  const guestToken = typeof rawGuestCookie === 'string' ? rawGuestCookie : rawGuestCookie?.value;

  const allowAnonymous = ['/admin/rooms', '/admin/bookings'];
  if (allowAnonymous.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtected = pathname.startsWith('/admin') && pathname !== '/admin/login';

  // If guest user (has auth_token but not admin_auth_token) tries to access admin routes
  if (isProtected && guestToken && !adminToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('denied', 'true');
    return NextResponse.redirect(url);
  }

  if (isProtected && !adminToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
