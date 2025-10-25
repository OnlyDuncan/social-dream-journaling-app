import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  const response = NextResponse.next();
  
  // Set CSP headers that allow necessary scripts
  response.headers.set(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self';"
  );
  
  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all routes except static files
};