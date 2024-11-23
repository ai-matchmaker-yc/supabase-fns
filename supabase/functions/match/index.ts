import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_MATCH_LIMIT = 5

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

  const { data: insertMatchData, error: insertMatchError } = await supabase.from('matches').insert(matchData.map(match => {
    return {
      source_user_id: userId,
      match_user_id: match.id,
      conference_id: conferenceId,
      compatibility: match.similarity_score
    }
  })).select()

  console.log(insertMatchData)
  console.log(insertMatchError)

  // const results = await Promise.all(
  //   matchData.map(match => supabase.from('matches').insert({
  //     source_user_id: userId,
  //     match_user_id: match.id,
  //     conference_id: conferenceId,
  //     compatibility: match.similarity_score
  //   }).select())
  // )

  return new Response(
    JSON.stringify(insertMatchData),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
})
