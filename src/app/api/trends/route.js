export const maxDuration = 60

const SYSTEM = `Você é um estrategista de conteúdo especializado na marca pessoal de Hellena Aguiar.

QUEM ELA É: Criadora de opinião. Pega qualquer assunto e transforma em reflexão com perspectiva própria. Não ensina — mostra. Vende ideias. Posiciona quem ela é pelo que ela pensa.

LINHAS EDITORIAIS:
1. Identidade e construção de si
2. Literatura e referências culturais
3. Comportamento humano e sociedade
4. Mercado digital, ética e influência
5. IA e tecnologia com perspectiva crítica
6. Arte e cinema
7. Bastidores reais
8. Vida real — maternidade, rotina, caos

TOM: Opinião clara. Direta. Reflexiva. Nunca paternalista. Conecta mundos diferentes.

NÃO PERTENCE: empreendedorismo feminino como centro, motivacional genérico, tutorial sem perspectiva, política partidária, fitness, emagrecimento, positividade tóxica.`

const SEARCH_PROMPT = `Pesquise na internet em três frentes:

FRENTE 1 — NOTÍCIAS QUENTES: O que está no topo do noticiário brasileiro AGORA (março 2026)? Busque em portais de notícia, trending topics, o que está gerando debate nacional. Inclua pautas como CPIs, escândalos, casos envolvendo influenciadores e marcas.

FRENTE 2 — COMPORTAMENTO E CULTURA: O que está em alta em comportamento humano, literatura, cinema, arte, mercado creator, ética digital, IA?

FRENTE 3 — TENDÊNCIAS EMERGENTES: O que está crescendo antes de virar mainstream? Discussões no TikTok, YouTube, podcasts.

Para cada tema, analise como pode virar opinião e posicionamento para a Hellena.

Retorne EXATAMENTE neste formato para cada tema:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data ou período aproximado]
Fontes: [onde apareceu — portais, plataformas]
Ângulo: [como a Hellena transformaria em opinião — 2-3 frases com a voz dela]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [pergunta 1] / [pergunta 2] / [pergunta 3]

---

Retorne entre 6 e 8 temas variados.`

const CUSTOM_PROMPT = (topic) => `Pesquise na internet sobre: "${topic}" — o que está sendo discutido agora, onde apareceu, quando surgiu.

Depois analise como a Hellena Aguiar transformaria isso em opinião e posicionamento.

Retorne:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data ou período aproximado]
Fontes: [onde apareceu]
Ângulo: [como a Hellena transformaria em opinião — 2-3 frases com a voz dela]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [pergunta 1] / [pergunta 2] / [pergunta 3]`

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 500 })

  const { mode, topic } = await req.json()
  const userMsg = mode === 'custom' ? CUSTOM_PROMPT(topic) : SEARCH_PROMPT

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        allowed_callers: ['direct']
      }],
      messages: [{ role: 'user', content: userMsg }]
    })
  })

  const data = await res.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  return Response.json({ text })
}
