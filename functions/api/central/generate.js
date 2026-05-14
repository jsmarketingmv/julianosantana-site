export async function onRequest({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Verificar autenticação
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return Response.json({ ok: false, error: 'Não autorizado.' }, { status: 401, headers: cors });

  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length < 3) throw new Error();
    const secret = parts.slice(2).join(':');
    if (secret !== env.CENTRAL_SECRET) throw new Error();
  } catch {
    return Response.json({ ok: false, error: 'Token inválido.' }, { status: 401, headers: cors });
  }

  if (!env.AI) {
    return Response.json({ ok: false, error: 'Workers AI não configurado. Ative o binding AI no Cloudflare.' }, { status: 500, headers: cors });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ ok: false, error: 'Requisição inválida.' }, { status: 400, headers: cors });
  }

  const { pilar = 'acao', plataforma = 'ig', formato = 'Post', contexto = '' } = body;

  const pilares = {
    acao:     'AÇÃO — proatividade, execução, atitude, verdade, resiliência. O que o empreendedor precisa FAZER agora.',
    reacao:   'REAÇÃO — adaptação, empatia, confiança, fidelidade. Como responder ao que a vida e o mercado trazem.',
    campo:    'CAMPO — histórias reais de trilhas e montanhas com analogia direta para negócios. 2.100km trilhados em 2023.',
    negocios: 'NEGÓCIOS — estratégia, marketing, Os 8 Ps (base Kotler), empreendedorismo com experiência real de 25 anos.',
    mapa:     'MAPA DA VERDADE — diagnóstico de negócio, clareza de rota, IA treinada com a filosofia AÇÃO & REAÇÃO.',
  };

  const plat = plataforma === 'ig' ? 'Instagram' : 'LinkedIn';

  const systemPrompt = `Você é o assistente de conteúdo exclusivo de Juliano Sant'Ana.

SOBRE JULIANO:
- Mentor, Estrategista e Palestrante com 25 anos de campo real
- Montanhista: trilhou mais de 2.100km em 2023
- Criador do Mapa da Verdade (IA com sua filosofia)
- Fui premiado, errei, cai, levantei, recomeçai, cresci, conquistei.

FILOSOFIA DA MARCA — REGRAS ABSOLUTAS:
- AÇÃO & REAÇÃO é uma FILOSOFIA DE VIDA E CARREIRA. NUNCA um método, técnica ou ferramenta.
- AÇÃO: Atitude, Verdade, Resiliência
- REAÇÃO: Empatia, Confiança, Fidelidade

TOM DE VOZ:
✓ Direto, sem rodeios
✓ Autoridade conquistada em campo
✓ Provocação que gera reflexão
✓ Analogias de trilha e natureza
✓ Humaniza com histórias reais de erro e recomeço
✓ Números concretos (25 anos, 2.100km)

✗ NUNCA clichê motivacional ("acredite em você!")
✗ NUNCA coach genérico
✗ NUNCA "método" para AÇÃO & REAÇÃO
✗ NUNCA promessas sem embasamento
✗ NUNCA "Olá" ou apresentações no início`;

  const userPrompt = `Escreva uma copy completa para ${plat} no pilar: ${pilares[pilar] || pilar}.

Formato: ${formato}
Contexto adicional: ${contexto || 'Nenhum — use a filosofia da marca livremente.'}

REGRAS DA COPY:
- Comece DIRETO com o gancho (sem "Olá", sem apresentação)
- Primeira frase deve parar o scroll imediatamente
- Tom autêntico de quem viveu o que está dizendo
- Termine com pergunta ou CTA específico
- Máximo 250 palavras
- Linguagem brasileira natural

Escreva APENAS a copy, sem títulos, sem explicações, sem aspas externas:`;

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const copy = (result.response || '').trim();
    if (!copy) throw new Error('Resposta vazia da IA');

    return Response.json({ ok: true, copy }, { headers: cors });
  } catch (err) {
    return Response.json({ ok: false, error: 'Erro ao gerar: ' + (err.message || 'tente novamente') }, { status: 500, headers: cors });
  }
}
