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

const SEARCH_PROMPT = `Hoje é 31 de março de 2026. Faça buscas específicas para encontrar o que está VIRALIZANDO E SENDO MUITO DISCUTIDO nos últimos 30 dias — entre 1 de março e 31 de março de 2026.

Faça buscas em:
1. "tiktok viral brasil 2026" — o que está viralizando no TikTok brasileiro agora
2. "trending brasil instagram 2026" — reels e assuntos em alta no Instagram agora
3. "youtube viral brasil 2026" — vídeos bombando no YouTube Brasil agora
4. "google trends brasil mais buscado 2026" — termos mais buscados no Brasil agora
5. "noticias comportamento brasil 2026" — comportamento, cultura, polêmicas dos últimos 30 dias
6. "livros mais vendidos brasil 2026" — literatura em alta agora
7. "inteligencia artificial debate 2026" — o que está gerando debate sobre IA agora
8. "influencer polêmica brasil 2026" — casos recentes de influenciadores

REGRA CRÍTICA: Só inclua temas dos últimos 30 dias. Nada anterior a 1 de março de 2026. Se não encontrar data clara e recente, não inclua.

Para cada tema encontrado, analise como pode virar OPINIÃO E POSICIONAMENTO para a Hellena — não conteúdo jornalístico, mas reflexão com perspectiva própria.

Retorne EXATAMENTE neste formato:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data específica de março 2026]
Fontes: [plataformas onde está viralizando — TikTok, Instagram, YouTube, Google Trends, etc]
Ângulo: [como a Hellena transformaria em opinião — 2-3 frases com a voz dela, específico]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [pergunta 1] / [pergunta 2] / [pergunta 3]

---

Retorne entre 6 e 8 temas. TODOS devem ser de março de 2026.`

const CUSTOM_PROMPT = (topic) => `Hoje é 31 de março de 2026. Pesquise sobre: "${topic}" — o que está sendo discutido nos últimos 30 dias no TikTok, Instagram, YouTube, Google Trends e noticiário. Só traga informações de março de 2026.

Analise como a Hellena Aguiar transformaria isso em opinião com perspectiva própria.

Retorne:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data específica de março 2026]
Fontes: [plataformas onde apareceu]
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
