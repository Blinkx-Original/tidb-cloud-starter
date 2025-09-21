// pages/api/decap/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function html(body: string) {
  return `<!doctype html><meta charset="utf-8"><body>${body}</body>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query as { code?: string; state?: string };
  const cookieState = req.cookies['decap_oauth_state'];
  const allowStateless = process.env.DECAP_OAUTH_ALLOW_STATELESS === '1';

  if (!code) return res.status(400).send(html('<pre>Missing OAuth code.</pre>'));

  if (!allowStateless && (!state || !cookieState || state !== cookieState)) {
    return res
      .status(400)
      .send(
        html(
          `<pre>Invalid OAuth state.
- Repite el login desde /admin (no abras el callback directo).
- Prueba en incógnito o desactiva bloqueadores de cookies/popups.
- O habilita temporalmente DECAP_OAUTH_ALLOW_STATELESS=1.</pre>`
        )
      );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send(html('<pre>Missing GITHUB_CLIENT_ID/SECRET.</pre>'));
  }

  // Intercambio code -> token
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
        html(
          `<pre>OAuth error: ${json.error || 'no_token'}
${json.error_description || ''}

Revisa Client ID/Secret y el callback URL exacto.</pre>`
        )
      );
  }

  // Limpia cookie de estado
  res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');

  // 1) Si hubo popup: envía el token por postMessage y cierra
  // 2) Si NO hay opener (misma pestaña): redirige a /admin con el token en el hash
  const token = json.access_token;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(
    `<!doctype html><meta charset="utf-8"><body>
<script>
  (function(){
    var payload = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)} });
    if (window.opener) {
      window.opener.postMessage(payload, '*');
      window.close();
    } else {
      // Fallback: misma pestaña -> devolvemos el token a /admin
      var dest = '/admin/index.html#github_token=' + encodeURIComponent(${JSON.stringify(token)});
      window.location.replace(dest);
    }
  })();
</script>
</body>`
  );
}

