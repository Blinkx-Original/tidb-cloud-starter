// pages/api/decap/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function getBaseUrl(req: NextApiRequest) {
  const proto =
    (req.headers['x-forwarded-proto'] as string) || (req.socket as any)?.encrypted
      ? 'https'
      : 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
  return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send('Missing GITHUB_CLIENT_ID');

  const base = getBaseUrl(req);
  const redirectUri = `${base}/api/decap/callback`;

  // Estado aleatorio + cookie robusta (10 min)
  const state = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  res.setHeader(
    'Set-Cookie',
    [
      `decap_oauth_state=${encodeURIComponent(state)}`,
      'Path=/',
      'Max-Age=600',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
    ].join('; ')
  );

  const scope = 'repo,user:email';
  const url =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;

  res.redirect(302, url);
}
