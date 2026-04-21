// Supabase Edge Function: summarize-post
// Uses school-hosted LLM endpoint (e.g. https://chat.hpc.fau.edu/).
// Required secrets:
// - LLM_API_KEY
// Optional secrets:
// - LLM_ENDPOINT (default: https://chat.hpc.fau.edu/)
// - LLM_MODEL (default: openai/gemma4:26b)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const apiKey = Deno.env.get('LLM_API_KEY')
    const endpoint = Deno.env.get('LLM_ENDPOINT') ?? 'https://chat.hpc.fau.edu/'
    const model = Deno.env.get('LLM_MODEL') ?? 'openai/gemma4:26b'

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing LLM_API_KEY secret.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await req.json()
    const title = String(payload?.title ?? '')
    const description = String(payload?.description ?? '')
    const upvotes = Number(payload?.upvotes ?? 0)
    const comments = Array.isArray(payload?.comments) ? payload.comments : []
    const posts = Array.isArray(payload?.posts) ? payload.posts : []

    const prompt = `Analyze this music forum discussion and provide an overall summary.
Return ONLY valid JSON in this format:
{"summary":"string"}

Data:
Title: ${title}
Description: ${description}
Upvotes: ${upvotes}
Comments (${comments.length}): ${comments.join(' | ')}
Posts context: ${JSON.stringify(posts)}

Requirements:
- 4-6 sentences
- Neutral and helpful tone
- Mention notable themes and sentiment when possible`

    const llmResponse = await fetch(`${endpoint.replace(/\/$/, '')}/api/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      return new Response(
        JSON.stringify({
          error: `LLM request failed (${llmResponse.status}).`,
          details: errorText,
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }

    const raw = await llmResponse.json()
    let aiText = ''

    if (typeof raw?.content?.[0]?.text === 'string') {
      aiText = raw.content[0].text
    } else if (typeof raw?.choices?.[0]?.message?.content === 'string') {
      aiText = raw.choices[0].message.content
    } else if (typeof raw?.output_text === 'string') {
      aiText = raw.output_text
    } else {
      aiText = JSON.stringify(raw)
    }

    let cleanJson = aiText.trim()
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3).trim()
    if (cleanJson.startsWith('json')) cleanJson = cleanJson.slice(4).trim()
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3).trim()

    let parsed: { summary?: string } = {}
    try {
      parsed = JSON.parse(cleanJson)
      if (typeof (parsed as { content?: string }).content === 'string') {
        parsed = JSON.parse((parsed as { content: string }).content)
      }
    } catch {
      parsed = { summary: aiText }
    }

    const summary = parsed.summary?.trim() || aiText.trim() || 'No summary returned.'

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown summary error.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})
