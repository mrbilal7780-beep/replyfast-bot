import { NextResponse } from 'next/server';

// Middleware de securite pour toutes les routes
export function middleware(request) {
  const response = NextResponse.next();

  // ===================
  // SECURITY HEADERS
  // ===================

  // Protection contre le clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");

  // Protection contre le MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Protection XSS (active par defaut dans les navigateurs modernes)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // ===================
  // RATE LIMITING (basique)
  // ===================

  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Log des requetes API pour monitoring
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[API] ${request.method} ${request.nextUrl.pathname} from ${clientIP}`);
  }

  // ===================
  // CORS pour les API routes
  // ===================

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://replyfast.ai',
      'https://www.replyfast.ai',
      'http://localhost:3000'
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  return response;
}

// Routes a proteger
export const config = {
  matcher: [
    // Toutes les pages
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
