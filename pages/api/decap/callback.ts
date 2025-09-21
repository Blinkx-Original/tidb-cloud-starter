// pages/api/decap/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query as { code?: string; state?: string };
  const stored = req.cookies['decap_oauth_state'];

  if (!code || !state || !stored || state !== stored) {
    res.status(400).send('Invalid OAuth state.');
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

  // Intercambia code -> access_token
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const json = (await r.json()) as { access_token?: string; error?: string; error_description?: string };

  if (!json.access_token) {
    res
      .status(500)
      .send(`OAuth error: ${json.error || 'no_token'} — ${json.error_description || ''}`);
    return;
  }

  const token = json.access_token;

  // Responde con una página que "devuelve" el token a la ventana madre (Decap)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html><body>
<script>
  (function () {
    var msg = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)} });
    // Enviamos al opener (Decap CMS) y cerramos popup
    if (window.opener) {
      window.opener.postMessage(msg, '*');
      window.close();
    } else {
      document.write('Authentication complete. You can close this window.');
    }
  })();
</script>
</body></html>`);
}
