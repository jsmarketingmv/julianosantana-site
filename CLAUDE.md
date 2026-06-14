# CLAUDE.md — julianosantana-site

Memória de contexto do repositório. Atualizado em: 2026-06-13.

---

## Proprietário

**Juliano Santana** · marketing@julianosantana.com.br  
Site: https://www.julianosantana.com.br  
Hospedagem: Vercel  
Repo: jsmarketingmv/julianosantana-site  

---

## Organização de Sessões no Claude Code (App)

> ⚠️ Manter esta organização. Ao reabrir o app, verificar se os grupos estão corretos.

### Grupos e sessões:

| Grupo | Sessões |
|-------|---------|
| **TRAKO** | TRAKO/app · TRAKO/estrutural |
| **CRYIA Sessions** | CRYIA/marketing · CRYIA/estrutural |
| **MAPA DV Sessions** | MAPA/v5/hospedagem · MAPA/v5/bancodedados · MAPA/v5/fluxo/simula1 · MAPA/v5/fluxo/pontozero |
| **LOS VIAJEROS Sessions** | VIAJEROS/estrutural |
| **AONIK Site Sessions** | AONIK/site/refugios · AONIK/site/coxilharica · AONIK/site/compostela · AONIK/site/skorpios · AONIK/site/dolomitas · AONIK/site/montblanc · AONIK/site/homepage/v2 |
| **IDEIAS PESSOAIS** | **Éter Sleep - APP** ← sessão atual |

---

## Projeto Principal Ativo: Éter · Sono da Alma

### O que é
App web espiritual de monitoramento de sono (PWA instalável).  
URL de produção: https://www.julianosantana.com.br/eter/  
URL alternativa (redirect): https://www.julianosantana.com.br/sleep-tracker/

### Arquivos do projeto Éter

| Arquivo | Descrição |
|---------|-----------|
| `eter/index.html` | App completo (~2200 linhas, HTML/CSS/JS autocontido) |
| `eter/manifest.json` | PWA manifest (nome, ícone, cores, orientação) |
| `eter/sw.js` | Service Worker (cache offline) |
| `eter/icon.svg` | Ícone: lua crescente roxa com estrelas, 512×512 |
| `sleep-tracker/index.html` | Redirect para /eter/ |

### Identidade visual
- Cor de fundo: `#06091a` (azul muito escuro)
- Cor de acento: `#8b5cf6` (roxo)
- Cor primária: `#4a8ef8` (azul)
- Gradiente logo: `linear-gradient(135deg, #c084fc, #7eb8ff, #60d4ff)`
- Fonte: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## Estado atual do app (2026-06-13)

### Funcionalidades implementadas

#### Monitoramento de sono
- Microfone via `getUserMedia` — AnalyserNode + RMS detection
- Threshold de sensibilidade: Alta=0.018, Média=0.030, Baixa=0.050
- Grava clips de 8s quando detecta som acima do threshold
- Mínimo de 10s entre gravações
- Wake Lock API para manter tela ligada
- Keep-alive iOS: silent buffer source em loop no AudioContext
- Recuperação de sessão interrompida (localStorage `sleeptrack_active`)

#### Sons para dormir (Web Audio API — sem arquivos externos)
Grupo **Espiritual/Binaural**:
- `pad` — Meditação (acorde Am→C→F→Dm, ciclos de 10s)
- `om` — OM · 136 Hz (3 harmônicos: 136, 272, 408 Hz)
- `hz432` — 432 Hz Cura (432 + 864 Hz)
- `theta` — Ondas Theta binaural (200 Hz esq + 206 Hz dir = 6 Hz percebido)
- `bowl` — Tigela Tibetana (percussão 196 Hz + 588 Hz, a cada 8s)

Grupo **Música Instrumental** (substituiu os sons de natureza em 2026-06-14):
- `piano` — Piano Zen (arpejos pentatônicos triangle + delay)
- `harp` — Harpa Etérea (harpejos com harmônicos naturais)
- `flute` — Flauta de Bambu (frases pentatônicas sine + vibrato)
- `strings` — Cordas (acordes em swell sawtooth filtrado, troca a cada 10s)
- `hangdrum` — Hang Drum (padrões em Ré dórico, parciais inarmônicos)

> Sons de natureza removidos: rain, fire, ocean, wind, white.

#### Música real para dormir (Spotify embed — tela Sons)
- Player oficial do Spotify embutido: playlist **Peaceful Piano** (`37i9dQZF1DXaKgOqDv3HpW`)
- URL embed: `https://open.spotify.com/embed/playlist/37i9dQZF1DXaKgOqDv3HpW`
- Timer "Parar música em" (15/30/60 min) → remove o iframe via JS (`stopMusic`/`restartMusic`)
- Limitação: requer internet + login Spotify p/ faixas completas; pausa se a tela bloquear
- ⚠️ MP3 self-hosted NÃO foi possível: ambiente de build bloqueia download de archive.org/Pixabay (host_not_allowed). Para hospedar MP3s reais offline, adicionar esses hosts à allowlist de egress do ambiente.

#### Telas / Navegação
Bottom nav com **4 abas**: Início · Sons · Espiritual · Histórico

| Tela | ID | Descrição |
|------|-----|-----------|
| Breathing ritual | `screen-breathing` | 4 ciclos de respiração guiada antes de dormir |
| Home | `screen-home` | Dashboard principal, configurações, débito de sono |
| Sleeping | `screen-sleeping` | Monitoramento ativo (sem nav, tela cheia com estrelas) |
| Report | `screen-report` | Relatório após acordar (score, gráficos, clips) |
| History | `screen-history` | Lista de noites registradas |
| **Sons** | `screen-sounds` | Mixer de áudio acessível a qualquer momento |
| **Espiritual** | `screen-spiritual` | Insights + Orações e Mensagens + YouTube embed |

#### Funcionalidades de dados
- Score de qualidade: 0–100 (penaliza duração curta e número de clips)
- Fases de sono estimadas: Profundo / Leve / Acordado / Adormecer
- Débito de sono: últimas 7 noites vs. meta de 8h
- Semana: barras por dia com score
- Tendências: comparação com 3 noites anteriores
- Prescrição: próximos 5 dias de recomendações
- Temperatura: OpenMeteo API (gratuita, sem API key), geolocalização
- Tags de sonho por horário do clip (Adormecer / Sono profundo / Sono leve / Possível sonho)

#### Spiritual Insights
Array `INSIGHTS` com 12 cards rotativos (rotação por dia do mês).  
Tradições: Católica, Espírita (Kardec), Budismo, Umbanda, Indígena, Universal.  
`getSpiritualMorningMessage()` — mensagem personalizada por score após acordar.

#### Orações e Mensagens (tela Espiritual)
4 orações: Prece do Sono Protegido (Católica) · Prece Espírita da Noite · Meditação da Gratidão (Universal) · Mantra do Descanso (Budismo Tibetano)  
YouTube embed: `https://www.youtube-nocookie.com/embed/lAdVyAa-vXw`

#### Alarme inteligente
- Toggle on/off + horário configurável + janela (15/20/30/45 min antes)
- Detecta sono leve (sem clips nos últimos 8 min) na janela e dispara
- Chime: acorde C5-E5-G5-C6 + vibração

#### Demo e histórico
- Botão "Ver demonstração" → carrega 7 noites simuladas
- Botão "← Sair da demonstração" → limpa dados demo, restaura estado pessoal
- `clearHistory()` → apaga tudo e restaura botão demo

### localStorage
| Chave | Conteúdo |
|-------|----------|
| `sleeptrack_sessions` | Array de sessões salvas |
| `sleeptrack_active` | Sessão em andamento (crash recovery) |

---

## Git / Deploy

- Branch de desenvolvimento: `claude/sleep-tracking-prototype-swpsqw`
- Commit mais recente: nav expandida + tela Sons + tela Espiritual + orações + YouTube + fix mobile sons + ritmo respiratório explicado
- Para produção: merge da branch acima para `main` → Vercel deploya automaticamente

### Workflow de merge
```bash
# Via GitHub MCP (mcp__github__merge_pull_request)
# ou criar PR e fazer merge pelo GitHub
```

---

## Histórico de bugs corrigidos

| Bug | Causa | Fix |
|-----|-------|-----|
| Sons espirituais silenciosos | `gain.connect(masterGain)` e `masterGain.connect(ctx.destination)` ausentes | Adicionado em cada branch (om/hz432/theta/bowl) |
| Painel de sons não fechava | Sem botão de fechar, overflow | Botão × adicionado no header |
| Threshold muito alto | 0.055 RMS → nada gravado | Lowered para 0.018 (Alta sensibilidade) |
| Sessão perdida ao travar tela | iOS suspende AudioContext | Keep-alive buffer + Wake Lock + auto-save |
| Painel cortado no mobile | Sem max-height nem scroll | `max-height:85dvh; overflow-y:auto` |
| Músicas não tocavam no mobile | AudioContext suspenso | `.resume()` ao togglear qualquer som |
| Som mata AudioContext ao iniciar monitoramento | `new AudioContext()` sempre | Reusa se já existir |

---

## Próximas ideias / backlog

- [ ] Exportar relatório como PDF ou imagem compartilhável
- [ ] Notificação push "hora de dormir" (hora configurável)
- [ ] Análise de vozes vs. ronco (FFT para distinguir frequências)
- [ ] Mais canais de meditação guiada no YouTube
- [ ] Modo escuro já está ativo (único modo)
- [ ] Compartilhar score de sono para redes sociais (card gerado)
