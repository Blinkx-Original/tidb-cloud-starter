// pages/api/decap/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function page(body: string) {
  return `<!doctype html><meta charset="utf-8"><body>${body}</body>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query as { code?: string; state?: string };
  const cookieState = req.cookies['decap_oauth_state'];
  const allowStateless = process.env.DECAP_OAUTH_ALLOW_STATELESS === '1';

  if (!code) return res.status(400).send(page('<pre>Missing OAuth code.</pre>'));

  if (!allowStateless && (!state || !cookieState || state !== cookieState)) {
    return res
      .status(400)
      .send(
        page(
          `<pre>Invalid OAuth state.
- Cierra todas las pestañas, entra de nuevo por /admin (sin abrir el callback directo).
- Prueba en incógnito o desactiva bloqueadores de cookies/popups.
- Temporalmente puedes usar DECAP_OAUTH_ALLOW_STATELESS=1.</pre>`
        )
      );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send(page('<pre>Missing GITHUB_CLIENT_ID/SECRET.</pre>'));
  }

  // Intercambio de code -> token
  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const json = (await r.json()) as { access_token?: string; error?: string; error_description?: string };

  if (!json.access_token) {
    return res
      .status(500)
      .send(
        page(
          `<pre>OAuth error: ${json.error || 'no_token'}
${json.error_description || ''}

Revisa Client ID/Secret y el callback URL exacto.</pre>`
        )
      );
  }

  // Limpia cookie de estado
  res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');

  // Devuelve token a Decap (popup) o muestra token OK si no hay opener
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(
    page(`
<script>
  (function(){
    var payload = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(
      json.access_token
    )} });
    if (window.opener) { window.opener.postMessage(payload, '*'); window.close(); }
    else { document.write('<pre>Authentication complete. You can close this window.</pre>'); }
  })();
</script>`)
  );
}
