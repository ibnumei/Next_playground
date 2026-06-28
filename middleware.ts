import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js untuk melindungi semua route dashboard dan sub-page.
 * Jika token tidak ada, redirect user ke halaman /login.
 * Jika token ada dan user mengakses /login, redirect ke /dashboard.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Jika tidak ada token dan mencoba akses halaman terproteksi, redirect ke login
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/role') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/gl-maintenance') ||
    pathname.startsWith('/config-sftp') ||
    pathname.startsWith('/business-parameter') ||
    pathname.startsWith('/system-parameter');

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan mencoba akses login page, redirect ke dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi route yang di-handle oleh middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/role/:path*',
    '/user/:path*',
    '/gl-maintenance/:path*',
    '/config-sftp/:path*',
    '/business-parameter/:path*',
    '/system-parameter/:path*',
    '/login',
  ],
};
