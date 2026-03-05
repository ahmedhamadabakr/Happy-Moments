import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { UserRole } from '@/lib/types/roles';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Ensure cookies are sent with credentials
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Skip auth check for login, register, and static files
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/health', '/api/photos'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  // Skip for static files and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return response;
  }
  
  // Special handling for register page, users management, and manager dashboard - only allow managers
  if (
    request.nextUrl.pathname === '/register' || 
    request.nextUrl.pathname === '/dashboard/users' ||
    request.nextUrl.pathname === '/dashboard/manager'
  ) {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== UserRole.MANAGER) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  if (!isPublicPath && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api'))) {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      // No token, redirect to login
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    const payload = await verifyJWT(token);
    
    if (!payload) {
      // Token invalid, try to refresh
      const refreshToken = request.cookies.get('refreshToken')?.value;
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Try to refresh token by calling refresh API
      try {
        const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });
        
        if (!refreshResponse.ok) {
          // Refresh failed, redirect to login
          if (request.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url));
          }
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        // Get the new cookies from refresh response
        const setCookieHeader = refreshResponse.headers.get('set-cookie');
        if (setCookieHeader) {
          response.headers.set('set-cookie', setCookieHeader);
        }
      } catch (error) {
        // Refresh API call failed, redirect to login
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
