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

NAO PERTENCE: empreendedorismo feminino como centro, motivacional genérico, tutorial sem perspectiva, política partidária, fitness, emagrecimento, positividade tóxica.`

const SEARCH_PROMPT = `Pesquise na internet o que está sendo muito falado e pesquisado nas últimas 4 semanas (fevereiro e março de 2026) no Brasil. Busque em todas essas fontes:

- Google Trends Brasil: termos mais pesquisados recentemente
- TikTok Brasil: vídeos virais, audios em alta, discussões nos comentários
- YouTube Brasil: vídeos com muitas visualizações recentes
- Instagram: reels virais, assuntos gerando debate
- Noticiário de tech: lançamentos, polêmicas, debates sobre IA, redes sociais, mercado digital
- Noticiário brasileiro geral: pautas quentes, casos envolvendo influenciadores e marcas
- Literatura: livros mais vendidos e discutidos agora
- Comportamento e cultura: tendências de comportamento, paradoxos sociais em discussão

Para cada tema, analise como pode virar OPINIÃO E POSICIONAMENTO para a Hellena.

Retorne EXATAMENTE neste formato para cada tema:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [quando surgiu ou está em alta]
Fontes: [onde apareceu — ex: "Google Trends, TikTok, G1"]
Ângulo: [como a Hellena transformaria isso em opinião — específico, com a voz dela, 2-3 frases]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [pergunta 1] / [pergunta 2] / [pergunta 3]

---

Retorne entre 6 e 8 temas variados e RECENTES — últimas 4 semanas.`

const CUSTOM_PROMPT = (topic) => `Pesquise na internet sobre: "${topic}" — o que está sendo discutido agora no Google Trends, TikTok, YouTube, Instagram e noticiário brasileiro. Quando surgiu e onde está sendo falado.

Depois analise como a Hellena Aguiar transformaria isso em opinião com perspectiva própria.

Retorne:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [quando surgiu ou está em alta]
Fontes: [onde apareceu]
Ângulo: [como a Hellena transformaria em opinião — 2-3 frases com a voz dela]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [pergunta 1] / [pergunta 2] / [pergunta 3]`

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY nao configurada.' }, { status: 500 })

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
