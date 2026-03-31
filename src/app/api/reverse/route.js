export const maxDuration = 60

const SYSTEM = `Voce e um estrategista de conteudo especializado na marca pessoal de Hellena Aguiar.

QUEM ELA E: Criadora de opiniao. Pega qualquer assunto e transforma em reflexao com perspectiva propria. Nao ensina - mostra.

TOM: Opiniao clara. Direto. Reflexivo. Honesto sobre o caos. Nunca paternalista. Conecta mundos diferentes.

LINHAS EDITORIAIS: identidade, literatura, comportamento humano, mercado digital e etica, IA, arte, bastidores reais, vida real.

NAO PERTENCE: empreendedorismo feminino como centro, motivacional generico, tutorial sem perspectiva, politica, fitness, positividade toxica.`

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY nao configurada.' }, { status: 500 })

  const { url } = await req.json()
  if (!url) return Response.json({ error: 'URL nao fornecida.' }, { status: 400 })

  const prompt = `Pesquise na internet tudo que encontrar sobre este video: ${url}

Busque: titulo, canal, views, likes, transcricao, resumo, comentarios, repercussao.

Retorne EXATAMENTE neste formato:

TITULO: [titulo real do video]
CANAL: [nome do canal]
PERFORMANCE: [views e likes se encontrar]

---ANALISE---

GANCHO:
[Como o video abre nos primeiros 30s - o que prende, qual promessa e feita]

ARCO NARRATIVO:
[Como a historia se desenvolve - comeco, meio, virada, conclusao]

GATILHOS EMOCIONAIS:
[Quais emocoes sao ativadas - identidade, medo, desejo, pertencimento, raiva, etc]

POR QUE FUNCIONOU:
[2-3 frases diretas sobre o que tornou esse video fora da curva]

---IDEIAS PARA HELLENA---

REEL:
Tema: [tema especifico com angulo de opiniao da Hellena]
Abertura: [primeira frase exata que ela poderia falar - direta, provoca, opiniao]
Estrutura: [como desenvolver em 60-90s]
Por que funciona: [conexao com a marca dela]

VIDEO LONGO:
Tema: [tema especifico com angulo de opiniao da Hellena]
Abertura: [primeira frase exata que ela poderia falar]
Estrutura: [arco em 3-4 etapas]
Por que funciona: [conexao com a marca dela]

CARROSSEL:
Tema: [tema especifico com angulo de opiniao da Hellena]
Capa: [texto exato da capa - provoca, nao explica]
Estrutura: [o que vai em cada slide, de 1 a 7]
Por que funciona: [conexao com a marca dela]`

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
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await res.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  return Response.json({ text })
}
