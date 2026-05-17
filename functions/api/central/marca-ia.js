export async function onRequest({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Auth
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
    return Response.json({ ok: false, error: 'Workers AI não configurado.' }, { status: 500, headers: cors });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ ok: false, error: 'Requisição inválida.' }, { status: 400, headers: cors });
  }

  const { passo, marca } = body;

  if (!passo || !marca) {
    return Response.json({ ok: false, error: 'Dados insuficientes.' }, { status: 400, headers: cors });
  }

  const contextoMarca = `
MARCA: ${marca.nome || ''}
SEGMENTO: ${marca.segmento || ''}
DIFERENCIAL: ${marca.diferencial || ''}
PROPOSTA DE VALOR: ${marca.proposta || ''}
`.trim();

  const contextoPublico = marca.publicoPerfil ? `
PÚBLICO-ALVO: ${marca.publicoPerfil || ''}
DORES: ${marca.publicoDores || ''}
SONHOS: ${marca.publicoSonhos || ''}
OBJEÇÕES: ${marca.publicoObjecoes || ''}
`.trim() : '';

  let systemPrompt = `Você é GU.IA JS — assistente de branding e comunicação da plataforma Studio JS.
Sua função é ajudar profissionais a estruturar sua marca pessoal com precisão e estratégia.
Você responde SOMENTE com JSON válido, sem texto adicional, sem markdown, sem explicações fora do JSON.`;

  let userPrompt = '';

  if (passo === 2) {
    userPrompt = `Com base nas informações de marca abaixo, gere uma análise estratégica do público-alvo ideal para esta marca.
Seja específico, realista e estratégico. Evite respostas genéricas.

${contextoMarca}

IMPORTANTE: todos os valores devem ser STRINGS de texto corrido, NUNCA arrays ou listas JSON.

Responda SOMENTE com este JSON (sem markdown, sem texto fora do JSON):
{
  "publicoPerfil": "perfil detalhado do cliente ideal em texto corrido — cargo, faixa etária, contexto de vida e negócio",
  "publicoDores": "dores separadas por ponto e vírgula — ex: Falta de clareza na rota; Excesso de teoria sem execução; Resultados inconsistentes",
  "publicoSonhos": "sonhos separados por ponto e vírgula — ex: Negócio lucrativo e previsível; Liberdade de tempo; Reconhecimento no mercado",
  "publicoObjecoes": "objeções separadas por ponto e vírgula — ex: Já tentou antes e não funcionou; Acha que é problema de motivação"
}`;
  }

  else if (passo === 3) {
    userPrompt = `Com base nas informações de marca e público abaixo, sugira o tom de voz e identidade comunicacional ideal.
Seja específico ao contexto desta marca. Não seja genérico.

${contextoMarca}
${contextoPublico}

IMPORTANTE: todos os valores devem ser STRINGS de texto corrido, NUNCA arrays ou listas JSON.

Responda SOMENTE com este JSON (sem markdown, sem texto fora do JSON):
{
  "tom": "descrição do tom de voz em 1-2 frases diretas — ex: Direto, provocador e autêntico. Autoridade conquistada na prática, sem floreios.",
  "palavrasUsa": "palavra1, palavra2, palavra3, palavra4, palavra5, palavra6",
  "palavrasEvita": "palavra1, palavra2, palavra3, palavra4, palavra5",
  "emoji": "sim, moderadamente"
}`;
  }

  else if (passo === 4) {
    const tomContexto = marca.tom ? `TOM DE VOZ: ${marca.tom}` : '';
    userPrompt = `Com base no perfil completo da marca abaixo, recomende a estratégia de plataformas e objetivos de conteúdo.

${contextoMarca}
${contextoPublico}
${tomContexto}

IMPORTANTE: todos os valores devem ser STRINGS de texto corrido, NUNCA arrays ou listas JSON.

Responda SOMENTE com este JSON (sem markdown, sem texto fora do JSON):
{
  "plataformas": "instagram, linkedin",
  "objetivo": "autoridade e posicionamento",
  "frequencia": "diário no Instagram, 3x por semana no LinkedIn"
}`;
  }

  else {
    return Response.json({ ok: false, error: 'Passo inválido.' }, { status: 400, headers: cors });
  }

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    let raw = (result.response || '').trim();

    // Extract JSON from response (model may wrap in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('IA não retornou JSON válido');

    const dados = JSON.parse(jsonMatch[0]);
    return Response.json({ ok: true, dados }, { headers: cors });

  } catch (err) {
    return Response.json({ ok: false, error: 'Erro ao gerar: ' + (err.message || 'tente novamente') }, { status: 500, headers: cors });
  }
}
