// pages/api/decap/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function getBaseUrl(req: NextApiRequest) {
  const proto =
    (req.headers['x-forwarded-proto'] as string) ||
    (req.socket as any)?.encrypted
      ? 'https'
      : 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const scope = 'repo,user:email';
  const base = getBaseUrl(req);
  const redirectUri = `${base}/api/decap/callback`;

  const url =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  // (opcional) CSRF state sencillo
  const state = Math.random().toString(36).slice(2);
  res.setHeader('Set-Cookie', `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  res.redirect(url + `&state=${state}`);
}
