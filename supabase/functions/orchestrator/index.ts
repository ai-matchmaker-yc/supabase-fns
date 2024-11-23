import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { userId, conferenceId, matchLimit } = await req.json()

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );

  const { data: matches, error: matchesError } = await supabase.functions.invoke('match', {
    body: { userId: userId, conferenceId: conferenceId, matchLimit: matchLimit }
  })

  console.log(matches)
  console.log(matchesError)

  const matchDataResults = await Promise.all(matches.map(match => supabase.functions.invoke('match-data', { body: { matchId: match.id }})))
  console.log(matchDataResults)

  const results = matchDataResults.map(r => r.data)
  console.log(results)
  
  return new Response(
    JSON.stringify(results),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
})
