// Cloudflare Pages Function — OAuth proxy para Decap CMS + GitHub
// Rota: /api/auth

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // --- Passo 2: GitHub retorna com o código de autorização ---
  if (code) {
    try {
      const resp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await resp.json();

      if (data.error || !data.access_token) {
        return postMessageResponse('error', data.error_description || 'Autenticação falhou');
      }

      const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
      return postMessageResponse('success', payload);

    } catch (err) {
      return postMessageResponse('error', err.message);
    }
  }

  // --- Passo 1: Redireciona para GitHub OAuth ---
  const scope = url.searchParams.get('scope') || 'repo,user';
  const callbackUrl = `${url.origin}/api/auth`;
  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubUrl.searchParams.set('scope', scope);
  githubUrl.searchParams.set('redirect_uri', callbackUrl);

  return Response.redirect(githubUrl.toString(), 302);
}

function postMessageResponse(status, content) {
  const safe = content
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/</g, '\\x3C');

  const html = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var msg = 'authorization:github:${status}:${safe}';
  function send() {
    if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
    else { setTimeout(send, 100); }
  }
  send();
})();
</script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
