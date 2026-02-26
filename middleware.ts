import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Ensure cookies are sent with credentials
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
