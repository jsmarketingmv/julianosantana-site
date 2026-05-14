export async function onRequest({ request, env }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers });

  // POST /api/central/auth — Login
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { user, password } = body;

      if (!env.CENTRAL_USER || !env.CENTRAL_PASSWORD || !env.CENTRAL_SECRET) {
        return Response.json({ ok: false, error: 'Servidor não configurado. Defina as variáveis de ambiente.' }, { status: 500, headers });
      }

      if (user !== env.CENTRAL_USER || password !== env.CENTRAL_PASSWORD) {
        return Response.json({ ok: false, error: 'Usuário ou senha incorretos.' }, { status: 401, headers });
      }

      const token = btoa(`${env.CENTRAL_USER}:${Date.now()}:${env.CENTRAL_SECRET}`);
      return Response.json({ ok: true, token }, { headers });

    } catch (e) {
      return Response.json({ ok: false, error: 'Requisição inválida.' }, { status: 400, headers });
    }
  }

  // GET /api/central/auth — Verificar token
  if (request.method === 'GET') {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.replace('Bearer ', '').trim();

    if (!token) return Response.json({ ok: false, error: 'Token ausente.' }, { status: 401, headers });

    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      if (parts.length < 3) throw new Error('Token inválido');

      const [user, timestamp, ...secretParts] = parts;
      const secret = secretParts.join(':');

      if (secret !== env.CENTRAL_SECRET || user !== env.CENTRAL_USER) {
        return Response.json({ ok: false, error: 'Token inválido.' }, { status: 401, headers });
      }

      const age = Date.now() - parseInt(timestamp);
      if (age > 30 * 24 * 60 * 60 * 1000) { // 30 dias
        return Response.json({ ok: false, error: 'Sessão expirada. Faça login novamente.' }, { status: 401, headers });
      }

      return Response.json({ ok: true, user }, { headers });
    } catch {
      return Response.json({ ok: false, error: 'Token inválido.' }, { status: 401, headers });
    }
  }

  return new Response('Método não permitido', { status: 405, headers });
}
