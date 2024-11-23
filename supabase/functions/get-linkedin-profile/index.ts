import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { encodeUrl } from "https://deno.land/x/encodeurl/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json();
  const profileUrl = body.profileUrl;

  if (!profileUrl) {
    return new Response("Missing profileUrl", {
      status: 400,
    });
  }

  console.log(profileUrl);

  const options = { method: "GET" };
  const scrapinResponse = await fetch(
    `https://api.scrapin.io/enrichment/profile?apikey=${Deno.env.get(
      "SCRAPIN_API_KEY"
    )}&linkedInUrl=${encodeUrl(profileUrl)}`,
    options
  );

  if (!scrapinResponse.ok) {
    const data = await scrapinResponse.json();
    console.log("Failed to fetch LinkedIn profile", data, scrapinResponse.status, scrapinResponse.statusText);
    return new Response("Failed to fetch LinkedIn profile", {
      status: 500,
    });
  }

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
