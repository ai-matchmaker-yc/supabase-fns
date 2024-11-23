// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Anthropic from '@anthropic-ai/sdk';

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { userId, conferenceId, matchLimit } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')
  });

  // call RPC function
  const { data: matchData, error: matchError } = await supabase
    .rpc('find_similar_profiles', {
      'match_limit': matchLimit,
      'target_conference_id': conferenceId,
      'user_id': userId,
    })
  if (matchError) console.error(matchError)
  else console.log(matchData)

  // TODO: call claude to make sense of the results

  return new Response(
    JSON.stringify({ hello: 'world' }),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/match' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
