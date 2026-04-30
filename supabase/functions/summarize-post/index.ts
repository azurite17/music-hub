// Supabase Edge Function: summarize-post
// OpenAI-compatible Chat Completions (works with Groq free tier and similar providers).
//
// Supabase secrets (Project → Edge Functions → Secrets):
// - LLM_API_KEY   (required) — e.g. Groq API key from https://console.groq.com/
// - LLM_ENDPOINT  (optional) — default: https://api.groq.com/openai/v1/chat/completions
// - LLM_MODEL     (optional) — default: llama-3.1-8b-instant
//
// Groq: create a free key, paste as LLM_API_KEY. No credit card for the free developer tier.

const DEFAULT_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'llama-3.1-8b-instant'

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
    const endpoint = (Deno.env.get('LLM_ENDPOINT') ?? DEFAULT_CHAT_URL).replace(/\/$/, '')
    const model = Deno.env.get('LLM_MODEL') ?? DEFAULT_MODEL

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          summary:
            'AI summary is temporarily unavailable because the LLM key is missing. You can still review the post details, upvotes, and comment activity normally.',
          warning: 'Missing LLM_API_KEY secret. Fallback summary used.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        },
      )
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

    const llmResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!llmResponse.ok) {
      const responseText = await llmResponse.text()
      const safeDetails = responseText.slice(0, 260).replace(/\s+/g, ' ').trim()
      const fallbackSummary = [
        `Post "${title}" currently has ${upvotes} upvotes and ${comments.length} comments.`,
        description
          ? `Main topic: ${description.slice(0, 180)}${description.length > 180 ? '…' : ''}`
          : 'The post has little description, so feedback likely relies on comments.',
        comments.length
          ? `Comment trend sample: ${String(comments[0]).slice(0, 120)}${String(comments[0]).length > 120 ? '…' : ''}`
          : 'No comment sentiment is available yet.',
      ].join(' ')

      return new Response(
        JSON.stringify({
          summary: fallbackSummary,
          warning: `LLM request failed (${llmResponse.status}) at ${endpoint} using model ${model}. Details: ${safeDetails || 'none'}`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }

    const raw = await llmResponse.json()
    let aiText = ''

    if (typeof raw?.choices?.[0]?.message?.content === 'string') {
      aiText = raw.choices[0].message.content
    } else if (typeof raw?.content?.[0]?.text === 'string') {
      aiText = raw.content[0].text
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
        summary:
          'AI summary is temporarily unavailable. Try again in a moment after checking Edge Function deploy and secrets.',
        warning: error instanceof Error ? error.message : 'Unknown summary error.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})
