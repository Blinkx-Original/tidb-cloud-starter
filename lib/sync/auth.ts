import { NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = 'admin-auth';

function requiredPassword(): string {
  const password = process.env.ADMIN_DASH_PASSWORD;
  if (!password || !password.trim()) {
    throw new Error('ADMIN_DASH_PASSWORD environment variable is required');
  }
  return password.trim();
}

function computeToken(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function expectedCookieToken(): string {
  return computeToken(requiredPassword());
}

function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  const parts = header.split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('=') || '');
  }
  return cookies;
}

export function isAuthorizedRequest(req: Request): boolean {
  const password = requiredPassword();
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey && headerKey === password) {
    return true;
  }
  const cookieHeader = req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return token === expectedCookieToken();
}

export function requireAdmin(req: Request): NextResponse | null {
  try {
    if (isAuthorizedRequest(req)) {
      return null;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function createAuthCookieResponse(body: any): NextResponse {
  const response = NextResponse.json(body);
  const token = expectedCookieToken();
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function clearAuthCookieResponse(body: any): NextResponse {
  const response = NextResponse.json(body);
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return response;
}
