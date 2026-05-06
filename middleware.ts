import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js untuk melindungi route dashboard.
 * Jika token tidak ada, redirect user ke halaman /login.
 * Jika token ada dan user mengakses /login, redirect ke /dashboard.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Jika tidak ada token dan mencoba akses dashboard, redirect ke login
  if (!token && pathname.startsWith('/dashboard')) {
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
  matcher: ['/dashboard/:path*', '/login'],
};
