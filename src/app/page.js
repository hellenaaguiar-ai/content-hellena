'use client'
import { useState, useRef } from 'react'

const C = {
  cream: '#F5EDD8', ink: '#1A1208', espresso: '#2E1B0E', leather: '#5C3320',
  rust: '#8B4A2A', amber: '#A67C3D', amberDim: '#7A5C2E', sage: '#4A5740',
  parchment: '#EDE0C4', parchDark: '#C8B896', aged: '#D4C4A0',
}
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`
const F = "Raleway, sans-serif"

// ─── PARSER ───────────────────────────────────────────────────────────────────
function parseTrends(raw) {
  if (!raw) return []
  const items = []
  const blocks = raw.split(/(?=\n\*\*|\r\n\*\*)/).filter(b => b.includes('**'))
  for (const block of blocks) {
    const titleMatch = block.match(/\*\*([^*]+)\*\*/)
    if (!titleMatch) continue
    const title = titleMatch[1].trim()
    const fitRaw = block.match(/Fit:\s*([^\n\r]+)/i)?.[1]?.trim() || ''
    const fit = fitRaw.toLowerCase().includes('alta') ? 'Alta'
      : fitRaw.toLowerCase().includes('dia') ? 'Média'
      : fitRaw.toLowerCase().includes('baixa') ? 'Baixa' : 'Média'
    const quando = block.match(/Quando:\s*([^\n\r]+)/i)?.[1]?.trim() || ''
    const fontes = block.match(/Fontes:\s*([^\n\r]+)/i)?.[1]?.trim() || ''
    const angulo = block.match(/[Âa]ngulo:\s*([\s\S]+?)(?=\nFormato:|---|\*\*|$)/i)?.[1]?.replace(/\n/g, ' ').trim() || ''
    const formato = block.match(/Formato:\s*([^\n\r]+)/i)?.[1]?.trim() || ''
    const timing = block.match(/Timing:\s*([^\n\r]+)/i)?.[1]?.trim() || ''
    const provRaw = block.match(/Provoca[çc][oõ]es:\s*([\s\S]+?)(?=\n---|\n\*\*|$)/i)?.[1]?.trim() || ''
    const provocacoes = provRaw
      .split(/\/|\n[-–•]\s*|\n\d+\.\s*/)
      .map(p => p.trim())
      .filter(p => p.length > 8)
    if (title.length > 2) {
      items.push({ title, fit, quando, fontes, angulo, formato, timing, provocacoes })
    }
  }
  return items
}

function parseReverse(raw) {
  if (!raw) return null
  const field = (labels) => {
    for (const label of labels) {
      const m = raw.match(new RegExp(`${label}[^\\n]*\\n([\\s\\S]+?)(?=\\n[A-ZÁÉÍÓÃÂÊÔÇ]{3}|---IDEIAS|$)`, 'i'))
      if (m) return m[1].trim()
    }
    return ''
  }
  const idea = (fmts) => {
    for (const fmt of fmts) {
      const escaped = fmt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const m = raw.match(new RegExp(`${escaped}:[\\s\\S]+?(?=\\n(?:VÍDEO|VIDEO|CARROSSEL|REEL):|$)`, 'i'))
      if (m) {
        const b = m[0]
        return {
          tema: b.match(/Tema:\s*(.+)/i)?.[1]?.trim() || '',
          abertura: (b.match(/Abertura:\s*(.+)/i)?.[1] || b.match(/Capa:\s*(.+)/i)?.[1] || '').trim(),
          estrutura: b.match(/Estrutura:\s*([\s\S]+?)(?=\nPor que|$)/i)?.[1]?.trim() || '',
          porque: b.match(/Por que[^:]*:\s*(.+)/i)?.[1]?.trim() || '',
        }
      }
    }
    return null
  }
  return {
    titulo: raw.match(/TITULO[^:]*:\s*(.+)/i)?.[1]?.trim() || '',
    canal: raw.match(/CANAL[^:]*:\s*(.+)/i)?.[1]?.trim() || '',
    performance: raw.match(/PERFORMANCE[^:]*:\s*(.+)/i)?.[1]?.trim() || '',
    gancho: field(['GANCHO']),
    arco: field(['ARCO NARRATIVO', 'ARCO']),
    gatilhos: field(['GATILHOS EMOCIONAIS', 'GATILHOS']),
    porque: field(['POR QUE FUNCIONOU', 'POR QUE']),
    ideias: {
      reel: idea(['REEL']),
      video: idea(['VÍDEO LONGO', 'VIDEO LONGO']),
      carrossel: idea(['CARROSSEL']),
    },
  }
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function FitBadge({ fit }) {
  const map = { Alta: [C.sage, C.cream], Média: [C.amberDim, C.cream], Baixa: [C.aged, C.espresso] }
  const [bg, color] = map[fit] || [C.amberDim, C.cream]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 3, background: bg, color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {fit}
    </span>
  )
}

function Tag({ children }) {
  return <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 3, background: C.parchDark, color: C.espresso, fontFamily: F, letterSpacing: '0.06em', fontWeight: 600 }}>{children}</span>
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.aged : C.espresso, color: C.cream, border: 'none', borderRadius: 4, padding: '11px 24px', fontSize: 11, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {children}
    </button>
  )
}

function GhostBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: 'transparent', color: C.amberDim, border: `1.5px solid ${C.parchDark}`, borderRadius: 4, padding: '10px 18px', fontSize: 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? C.espresso : 'transparent', color: active ? C.cream : C.amberDim, border: `1.5px solid ${active ? C.espresso : C.parchDark}`, borderRadius: 4, padding: '7px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all .15s' }}>
      {children}
    </button>
  )
}

function TextInput({ value, onChange, onKeyDown, placeholder }) {
  return (
    <input value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}
      style={{ flex: 1, background: C.parchment, border: `1px solid ${C.parchDark}`, borderRadius: 4, padding: '11px 16px', fontSize: 13, color: C.ink, fontFamily: F, outline: 'none' }} />
  )
}

function MiniLabel({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.amberDim, fontFamily: F, marginBottom: 6 }}>{children}</div>
}

// ─── TREND CARD ───────────────────────────────────────────────────────────────
function TrendCard({ item }) {
  const [open, setOpen] = useState(false)
  const [openExplorar, setOpenExplorar] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const [erro, setErro] = useState('')

  async function enviarClickUp() {
    setSending(true)
    setErro('')
    try {
      const desc = `Ângulo:\n${item.angulo}\n\nFormato: ${item.formato}\nTiming: ${item.timing}\n\nProvcações:\n${item.provocacoes.join('\n')}\n\nFontes: ${item.fontes}\nQuando: ${item.quando}`
      const res = await fetch('/api/clickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, description: desc, format: item.formato || 'Conteúdo' })
      })
      const data = await res.json()
      if (data.url) setSent(data.url)
      else setErro(data.error || 'Erro ao criar tarefa.')
    } catch (e) {
      setErro('Erro de conexão.')
    }
    setSending(false)
  }

  const timingUrgente = item.timing?.toLowerCase().includes('urgente')

  return (
    <div style={{ border: `1px solid ${C.aged}`, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>

      {/* Toggle principal — título + fit */}
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: open ? C.parchment : C.cream, backgroundImage: NOISE, border: 'none', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: F, lineHeight: 1.3, flex: 1 }}>{item.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <FitBadge fit={item.fit} />
          <span style={{ fontSize: 12, color: C.amberDim }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Conteúdo interno */}
      {open && (
        <div style={{ background: C.cream, backgroundImage: NOISE, borderTop: `1px solid ${C.aged}`, padding: '16px 20px' }}>

          {/* Data + Fontes + Timing */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {item.quando && <Tag>📅 {item.quando}</Tag>}
            {item.timing && (
              <Tag>{timingUrgente ? '🔥 ' : ''}{item.timing}</Tag>
            )}
          </div>

          {item.fontes && (
            <div style={{ marginBottom: 12 }}>
              <MiniLabel>Fontes</MiniLabel>
              <p style={{ fontSize: 12, color: C.leather, lineHeight: 1.6, margin: 0, fontFamily: F }}>{item.fontes}</p>
            </div>
          )}

          {/* Toggle "Como explorar" */}
          <div style={{ border: `1px solid ${C.parchDark}`, borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
            <button
              onClick={() => setOpenExplorar(!openExplorar)}
              style={{ width: '100%', background: openExplorar ? C.parchment : 'transparent', border: 'none', padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: C.amberDim, fontFamily: F, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Como explorar</span>
              <span style={{ fontSize: 12, color: C.amberDim }}>{openExplorar ? '▲' : '▼'}</span>
            </button>

            {openExplorar && (
              <div style={{ background: C.parchment, backgroundImage: NOISE, borderTop: `1px solid ${C.parchDark}`, padding: '16px' }}>

                {/* Ângulo */}
                {item.angulo && (
                  <div style={{ marginBottom: 14 }}>
                    <MiniLabel>Ângulo</MiniLabel>
                    <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: 0, fontFamily: F }}>{item.angulo}</p>
                  </div>
                )}

                {/* Formato */}
                {item.formato && (
                  <div style={{ marginBottom: 14 }}>
                    <MiniLabel>Formato</MiniLabel>
                    <Tag>{item.formato}</Tag>
                  </div>
                )}

                {/* Timing */}
                {item.timing && (
                  <div style={{ marginBottom: 14 }}>
                    <MiniLabel>Timing</MiniLabel>
                    <Tag>{item.timing}</Tag>
                  </div>
                )}

                {/* Provocações */}
                {item.provocacoes?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <MiniLabel>Provocações</MiniLabel>
                    {item.provocacoes.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <span style={{ color: C.amber, fontWeight: 700, fontFamily: F, flexShrink: 0 }}>—</span>
                        <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.6, margin: 0, fontFamily: F, fontStyle: 'italic' }}>{p}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão ClickUp — SÓ aqui dentro */}
                <div style={{ borderTop: `1px solid ${C.parchDark}`, paddingTop: 14 }}>
                  {sent
                    ? <a href={sent} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.sage, fontWeight: 700, textDecoration: 'none', fontFamily: F, letterSpacing: '0.05em' }}>✓ Abrir no ClickUp →</a>
                    : (
                      <button
                        onClick={enviarClickUp}
                        disabled={sending}
                        style={{ background: C.espresso, color: C.cream, border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 11, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: sending ? 0.5 : 1 }}
                      >
                        {sending ? 'Enviando...' : 'Enviar pro ClickUp'}
                      </button>
                    )
                  }
                  {erro && <p style={{ fontSize: 11, color: C.rust, margin: '8px 0 0', fontFamily: F }}>{erro}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── IDEIA CARD ───────────────────────────────────────────────────────────────
function IdeiaCard({ format, idea, url }) {
  const [sending, setSending] = useState(false)
  const [sentUrl, setSentUrl] = useState(null)
  if (!idea?.tema) return null

  const map = {
    reel: { label: 'Reel', bg: C.sage, color: C.cream },
    video: { label: 'Vídeo Longo', bg: C.rust, color: C.cream },
    carrossel: { label: 'Carrossel', bg: C.amberDim, color: C.cream },
  }
  const { label, bg, color } = map[format]
  const fmtMap = { reel: 'REEL', video: 'VÍDEO LONGO', carrossel: 'CARROSSEL' }

  async function enviar() {
    setSending(true)
    try {
      const desc = `Abertura:\n"${idea.abertura}"\n\nEstrutura:\n${idea.estrutura}\n\nPor que funciona:\n${idea.porque}\n\nReferência: ${url}`
      const res = await fetch('/api/clickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: idea.tema, description: desc, format: fmtMap[format] })
      })
      const data = await res.json()
      if (data.url) setSentUrl(data.url)
    } catch (e) {}
    setSending(false)
  }

  return (
    <div style={{ background: C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '18px 20px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 3, background: bg, color, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: F }}>{label}</span>
        {sentUrl
          ? <a href={sentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.sage, fontWeight: 700, textDecoration: 'none', fontFamily: F }}>✓ Abrir no ClickUp →</a>
          : <button onClick={enviar} disabled={sending} style={{ fontSize: 11, color: C.amberDim, background: 'transparent', border: `1px solid ${C.parchDark}`, borderRadius: 3, padding: '5px 12px', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: F, opacity: sending ? 0.5 : 1 }}>
              {sending ? 'Enviando...' : 'Enviar pro ClickUp'}
            </button>
        }
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12, lineHeight: 1.4, fontFamily: F }}>{idea.tema}</div>
      {idea.abertura && (
        <div style={{ background: C.parchment, backgroundImage: NOISE, borderLeft: `3px solid ${C.amber}`, padding: '10px 14px', marginBottom: 12, borderRadius: '0 3px 3px 0' }}>
          <MiniLabel>Abertura</MiniLabel>
          <div style={{ fontSize: 13, color: C.leather, fontStyle: 'italic', lineHeight: 1.6, fontFamily: F }}>"{idea.abertura}"</div>
        </div>
      )}
      {idea.estrutura && <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: '0 0 10px', fontFamily: F }}>{idea.estrutura}</p>}
      {idea.porque && <p style={{ fontSize: 12, color: C.amberDim, lineHeight: 1.6, margin: 0, fontFamily: F }}>{idea.porque}</p>}
    </div>
  )
}

// ─── ABA TRENDS ──────────────────────────────────────────────────────────────
function TrendsTab() {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('todos')
  const [status, setStatus] = useState('')
  const [loadingRun, setLoadingRun] = useState(false)
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [topic, setTopic] = useState('')
  const timer = useRef(null)

  const STEPS = [
    'Varrendo notícias quentes do último mês...',
    'Buscando o que está bombando no TikTok, YouTube e Instagram...',
    'Checando Google Trends e tech news...',
    'Cruzando com suas linhas editoriais...',
    'Gerando ângulos de opinião e provocações...',
  ]

  function startSteps() {
    let i = 0; setStatus(STEPS[0])
    timer.current = setInterval(() => { if (++i < STEPS.length) setStatus(STEPS[i]) }, 4000)
  }

  async function buscarTrends() {
    setLoadingRun(true); startSteps()
    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'search' })
      })
      const data = await res.json()
      clearInterval(timer.current)
      if (data.error) { setStatus('Erro: ' + data.error); setLoadingRun(false); return }
      const parsed = parseTrends(data.text)
      setResults(parsed)
      setStatus(parsed.length
        ? `${parsed.length} temas encontrados · ${parsed.filter(r => r.fit === 'Alta').length} com fit alto`
        : 'Tente novamente.')
    } catch (e) {
      clearInterval(timer.current)
      setStatus('Erro de conexão. Tente novamente.')
    }
    setLoadingRun(false)
  }

  async function analisarTema() {
    if (!topic.trim()) return
    setLoadingCustom(true); setStatus(`Pesquisando: "${topic}"...`)
    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'custom', topic })
      })
      const data = await res.json()
      if (data.error) { setStatus('Erro: ' + data.error); setLoadingCustom(false); return }
      const parsed = parseTrends(data.text)
      setResults(prev => [...parsed, ...prev])
      setStatus(parsed.length ? `Tema analisado · Fit: ${parsed[0]?.fit}` : 'Concluído.')
      setTopic('')
    } catch (e) {
      setStatus('Erro de conexão. Tente novamente.')
    }
    setLoadingCustom(false)
  }

  const filtered = filter === 'todos' ? results : results.filter(r => r.fit === filter)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <PrimaryBtn onClick={buscarTrends} disabled={loadingRun}>
          {loadingRun ? 'Buscando...' : 'Buscar Trends Agora'}
        </PrimaryBtn>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {['todos', 'Alta', 'Média', 'Baixa'].map(f => (
            <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'todos' ? 'Todos' : f === 'Alta' ? 'Fit Alto' : f === 'Média' ? 'Fit Médio' : 'Fit Baixo'}
            </FilterBtn>
          ))}
        </div>
      )}

      {status && <p style={{ fontSize: 12, color: C.amberDim, marginBottom: 16, fontFamily: F }}>{status}</p>}

      <div style={{ height: 1, background: C.aged, margin: '16px 0 20px' }} />

      <MiniLabel>Ou analise um tema específico</MiniLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <TextInput
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analisarTema()}
          placeholder="Ex: CPI das bets, ética de influenciadores, livros em alta..."
        />
        <GhostBtn onClick={analisarTema} disabled={loadingCustom}>
          {loadingCustom ? 'Analisando...' : 'Analisar'}
        </GhostBtn>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: C.amberDim, fontSize: 13, lineHeight: 1.8, fontFamily: F }}>
            Clique em "Buscar Trends Agora" e o agente vai pesquisar<br />
            o que está sendo falado agora no TikTok, YouTube, Instagram,<br />
            Google Trends e noticiário — e cruzar com suas linhas editoriais.
          </p>
        </div>
      ) : (
        <div>{filtered.map((item, i) => <TrendCard key={i} item={item} />)}</div>
      )}
    </div>
  )
}

// ─── ABA REVERSE ─────────────────────────────────────────────────────────────
function ReverseTab() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const timer = useRef(null)

  const STEPS = [
    'Baixando áudio do vídeo...',
    'Transcrevendo com Whisper...',
    'Analisando estrutura narrativa...',
    'Gerando ideias com a sua voz...',
  ]

  function startSteps() {
    let i = 0; setStatus(STEPS[0])
    timer.current = setInterval(() => { if (++i < STEPS.length) setStatus(STEPS[i]) }, 5000)
  }

  async function analisar() {
    if (!url.trim()) return
    setLoading(true); setResult(null); startSteps()
    try {
      const res = await fetch('/api/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      clearInterval(timer.current)
      if (data.error) { setStatus('Erro: ' + data.error) }
      else { setResult(parseReverse(data.text)); setStatus('') }
    } catch (e) {
      clearInterval(timer.current)
      setStatus('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ background: C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '20px', marginBottom: 24 }}>
        <MiniLabel>Cole a URL do vídeo de referência</MiniLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analisar()}
            placeholder="YouTube, ou link público do Google Drive..."
          />
          <PrimaryBtn onClick={analisar} disabled={loading}>
            {loading ? 'Analisando...' : 'Analisar'}
          </PrimaryBtn>
        </div>
        <p style={{ fontSize: 11, color: C.amberDim, margin: '8px 0 0', fontFamily: F }}>
          YouTube (automático) · Instagram/TikTok: baixe o vídeo, suba no Drive com link público e cole o link aqui
        </p>
      </div>

      {status && <p style={{ fontSize: 12, color: C.amberDim, marginBottom: 16, fontFamily: F }}>{status}</p>}

      {!result && !loading && (
        <div style={{ background: C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: C.amberDim, fontSize: 13, lineHeight: 1.8, fontFamily: F }}>
            Cole o link de um vídeo do YouTube — ou baixe um vídeo do Instagram/TikTok,<br />
            suba no Google Drive com link público e cole o link aqui.<br />
            O agente transcreve e gera ideias de <strong style={{ color: C.leather }}>Reel</strong>, <strong style={{ color: C.leather }}>Vídeo Longo</strong> e <strong style={{ color: C.leather }}>Carrossel</strong>.
          </p>
        </div>
      )}

      {result && (
        <>
          <div style={{ background: C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4, fontFamily: F }}>{result.titulo || url}</div>
            <div style={{ fontSize: 12, color: C.amberDim, fontFamily: F }}>{result.canal}{result.performance ? ` · ${result.performance}` : ''}</div>
          </div>

          <div style={{ background: C.parchment, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 6, padding: '18px 20px', marginBottom: 20 }}>
            <MiniLabel>Engenharia Reversa</MiniLabel>
            {[['Gancho (primeiros 30s)', result.gancho], ['Arco Narrativo', result.arco], ['Gatilhos Emocionais', result.gatilhos], ['Por que Funcionou', result.porque]].map(([label, value]) => value ? (
              <div key={label} style={{ marginBottom: 14 }}>
                <MiniLabel>{label}</MiniLabel>
                <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: 0, fontFamily: F }}>{value}</p>
              </div>
            ) : null)}
          </div>

          <MiniLabel>Ideias para o seu canal</MiniLabel>
          {[['reel', result.ideias.reel], ['video', result.ideias.video], ['carrossel', result.ideias.carrossel]].map(([fmt, idea]) => (
            <IdeiaCard key={fmt} format={fmt} idea={idea} url={url} />
          ))}
        </>
      )}
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('trends')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5EDD8; }
        input::placeholder { color: #C8B896; }
        input:focus { border-color: #A67C3D !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.cream, backgroundImage: NOISE, padding: '40px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', color: C.amberDim, textTransform: 'uppercase', fontFamily: F, marginBottom: 10 }}>
              Hellena Aguiar · Agente de Conteúdo
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: C.ink, lineHeight: 1.1, fontFamily: F, marginBottom: 10 }}>
              Content<br />Intelligence
            </h1>
            <div style={{ width: 36, height: 2, background: C.amber, marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.6, fontFamily: F }}>
              Trends em tempo real · Engenharia reversa · Ideias prontas pro ClickUp
            </p>
          </div>

          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: `2px solid ${C.parchDark}` }}>
            {[['trends', 'Radar de Trends'], ['reverse', 'Engenharia Reversa']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: 'transparent', border: 'none',
                borderBottom: tab === id ? `2px solid ${C.espresso}` : '2px solid transparent',
                marginBottom: -2, padding: '10px 24px',
                fontSize: 12, fontWeight: tab === id ? 700 : 500,
                color: tab === id ? C.ink : C.amberDim,
                cursor: 'pointer', fontFamily: F,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all .15s'
              }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'trends' ? <TrendsTab /> : <ReverseTab />}
        </div>
      </div>
    </>
  )
}
