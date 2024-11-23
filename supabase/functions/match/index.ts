import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const DEFAULT_MATCH_LIMIT = 5

Deno.serve(async (req) => {
  const { userId, conferenceId, matchLimit } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  // call RPC function
  const { data: matchData, error: matchError } = await supabase
    .rpc('find_similar_profiles', {
      'match_limit': matchLimit ?? DEFAULT_MATCH_LIMIT,
      'target_conference_id': conferenceId.toString(), // TODO: make this accept an int instead
      'user_id': userId,
    })

  console.log(matchData)
  console.log(matchError)

  return new Response(
    JSON.stringify(matchData),
    { headers: { "Content-Type": "application/json" } },
  )
})
