// Vercel Serverless Function — autenticação da Central de Comando
// POST /api/central/auth  → login (user + password → token)
// GET  /api/central/auth  → verificar token (Authorization: Bearer <token>)

export default function handler(req, res) {
  const { CENTRAL_USER, CENTRAL_PASSWORD, CENTRAL_SECRET } = process.env;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: Login ────────────────────────────────────────
  if (req.method === 'POST') {
    if (!CENTRAL_USER || !CENTRAL_PASSWORD || !CENTRAL_SECRET) {
      return res.status(500).json({
        ok: false,
        error: 'Servidor não configurado. Defina as variáveis de ambiente no Vercel.',
      });
    }

    const { user, password } = req.body || {};

    if (!user || !password) {
      return res.status(400).json({ ok: false, error: 'Usuário e senha são obrigatórios.' });
    }

    if (user !== CENTRAL_USER || password !== CENTRAL_PASSWORD) {
      return res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos.' });
    }

    const token = Buffer.from(
      `${CENTRAL_USER}:${Date.now()}:${CENTRAL_SECRET}`
    ).toString('base64');

    return res.status(200).json({ ok: true, token });
  }

  // ── GET: Verificar token ────────────────────────────────
  if (req.method === 'GET') {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ ok: false, error: 'Token ausente.' });
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length < 3) throw new Error('Token inválido');

      const [tokenUser, timestamp, ...secretParts] = parts;
      const secret = secretParts.join(':');

      if (secret !== CENTRAL_SECRET || tokenUser !== CENTRAL_USER) {
        return res.status(401).json({ ok: false, error: 'Token inválido.' });
      }

      const age = Date.now() - parseInt(timestamp);
      if (age > 30 * 24 * 60 * 60 * 1000) {
        return res.status(401).json({
          ok: false,
          error: 'Sessão expirada. Faça login novamente.',
        });
      }

      return res.status(200).json({ ok: true, user: tokenUser });
    } catch {
      return res.status(401).json({ ok: false, error: 'Token inválido.' });
    }
  }

  res.status(405).end('Método não permitido');
}
