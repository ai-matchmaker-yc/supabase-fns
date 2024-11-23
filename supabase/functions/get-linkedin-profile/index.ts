import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { encodeUrl } from "https://deno.land/x/encodeurl/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const body = await req.json();
  const profileUrl = body.profileUrl;

  console.log(profileUrl);

  const options = { method: "GET" };
  const scrapinResponse = await fetch(
    `https://api.scrapin.io/enrichment/profile?apikey=${Deno.env.get(
      "SCRAPIN_API_KEY"
    )}&linkedInUrl=${encodeUrl(profileUrl)}`,
    options
  );
  const data = await scrapinResponse.json();

  console.log(data);

  const firstName = data.person.firstName;
  const lastName = data.person.lastName;
  const photoUrl = data.person.photoUrl;

  return new Response(
    JSON.stringify({
      firstName,
      lastName,
      photoUrl,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
