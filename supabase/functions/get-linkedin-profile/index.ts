// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const linkedInApiUrl = 'https://api.linkedin.com/v2/'

Deno.serve(async (req) => {
  const { userId } = await req.json()
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId is required' }),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  const lookupUrl = `${linkedInApiUrl}people/${userId}`
  const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: 'LinkedIn access token is required' }),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  const response = await fetch(lookupUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const json = await response.json();
    console.error('LinkedIn API request failed', response.status, response.statusText, response.body, json);
    return new Response(
      JSON.stringify({ error: 'LinkedIn API request failed' }),
      { headers: { "Content-Type": "application/json" } },
    )
  }

  const data = await response.json();

  console.log(data);

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-linkedin-profile' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
