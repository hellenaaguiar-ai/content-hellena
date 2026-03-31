export const runtime = 'edge'

const LIST_ID = '901326362792'

export async function POST(req) {
  const apiKey = process.env.CLICKUP_API_KEY
  if (!apiKey) return Response.json({ error: 'CLICKUP_API_KEY nao configurada.' }, { status: 500 })

  const { title, description, format } = await req.json()

  const res = await fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({
      name: `[${format}] ${title}`,
      description,
      status: 'to do',
    })
  })

  const data = await res.json()
  if (data.err) return Response.json({ error: data.err }, { status: 500 })
  return Response.json({ url: data.url, id: data.id })
}
