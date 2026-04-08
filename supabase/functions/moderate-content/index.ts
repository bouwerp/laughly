import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { content, type } = body

    // TODO: Integrate with AI Provider (Gemini/OpenAI)
    // For now, we'll return a mock "Safe" result with high confidence
    console.log(`Moderating ${type}: ${content.substring(0, 50)}...`)

    const result = {
      isSafe: true,
      confidence: 0.98,
      reason: "Content appears to be standard humor.",
      flaggedCategories: []
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
