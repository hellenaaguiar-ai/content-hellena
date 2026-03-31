export const maxDuration = 60

const SYSTEM = `Você é um estrategista de conteúdo especializado na marca pessoal de Hellena Aguiar.

QUEM ELA É: Criadora de opinião. Pega qualquer assunto e transforma em reflexão com perspectiva própria. Não ensina — mostra. Vende ideias.

LINHAS EDITORIAIS: identidade, literatura, comportamento humano, mercado digital e ética, IA, arte, bastidores reais, vida real.

TOM: Opinião clara. Direta. Reflexiva. Honesta sobre o caos. Nunca paternalista.

NÃO PERTENCE: empreendedorismo feminino como centro, motivacional genérico, tutorial sem perspectiva, política, fitness, positividade tóxica.`

const N8N_WEBHOOK = 'https://n8n-production-7c857.up.railway.app/webhook/transcrever'

function converterLinkDrive(url) {
  // Converte link de compartilhamento do Drive para link de download direto
  // https://drive.google.com/file/d/FILE_ID/view → baixável via yt-dlp
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`
  }
  return url
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 500 })

  const { url } = await req.json()
  if (!url) return Response.json({ error: 'URL não fornecida.' }, { status: 400 })

  // Converte link do Drive se necessário
  const urlProcessada = url.includes('drive.google.com') ? converterLinkDrive(url) : url

  // Etapa 1 — envia URL para o n8n que baixa e transcreve
  let transcription = ''
  try {
    const n8nRes = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlProcessada }),
    })
    const n8nData = await n8nRes.json()
    if (n8nData.error) return Response.json({ error: 'Erro na transcrição: ' + n8nData.error }, { status: 500 })
    transcription = n8nData.transcription || ''
  } catch (e) {
    return Response.json({ error: 'Não foi possível conectar com o serviço de transcrição.' }, { status: 500 })
  }

  if (!transcription) return Response.json({ error: 'Transcrição vazia. Verifique se o arquivo está público e acessível.' }, { status: 400 })

  // Etapa 2 — Claude analisa a transcrição
  const prompt = `Analise a transcrição abaixo de um vídeo de referência e faça a engenharia reversa completa.

TRANSCRIÇÃO:
${transcription.slice(0, 4000)}

Retorne EXATAMENTE neste formato:

TITULO: [identifique pelo conteúdo da transcrição]
CANAL: [identifique pelo conteúdo se possível]
PERFORMANCE: [não disponível]

---ANALISE---

GANCHO:
[Como o vídeo abre nos primeiros 30s — o que prende, qual promessa é feita]

ARCO NARRATIVO:
[Como a história se desenvolve — começo, meio, virada, conclusão]

GATILHOS EMOCIONAIS:
[Quais emoções são ativadas e como]

POR QUE FUNCIONOU:
[2-3 frases sobre o que tornou esse vídeo fora da curva]

---IDEIAS PARA HELLENA---

REEL:
Tema: [tema com ângulo de opinião da Hellena]
Abertura: [primeira frase exata que ela poderia falar]
Estrutura: [como desenvolver em 60-90s]
Por que funciona: [conexão com a marca dela]

VIDEO LONGO:
Tema: [tema com ângulo de opinião da Hellena]
Abertura: [primeira frase exata que ela poderia falar]
Estrutura: [arco em 3-4 etapas]
Por que funciona: [conexão com a marca dela]

CARROSSEL:
Tema: [tema com ângulo de opinião da Hellena]
Capa: [texto exato da capa — provoca, não explica]
Estrutura: [o que vai em cada slide, de 1 a 7]
Por que funciona: [conexão com a marca dela]`

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
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await res.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  return Response.json({ text })
}
