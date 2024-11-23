import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { encodeUrl } from "https://deno.land/x/encodeurl/mod.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const {
    linkedinProfileUrl,
    githubProfileUrl,
    userId,
    interestString
  } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  console.log(linkedinProfileUrl)

  const options = { method: 'GET' }
  const scrapinResponse = await fetch(`https://api.scrapin.io/enrichment/profile?apikey=${Deno.env.get('SCRAPIN_API_KEY')}&linkedInUrl=${encodeUrl(linkedinProfileUrl)}`, options)
  const data = await scrapinResponse.json()

  console.log(data)

  const coreDataStr = `Name: ${data.person.firstName} ${data.person.lastName}
    Headline: ${data.person.headline}
    Location: ${data.person.location}
    Job History: ${data.person.positions.positionHistory.map(p => {return `${p.title} at ${p.companyName}`}).join(', ')}
    Education History: ${data.person.schools.educationHistory.map(p => {return `${p.degreeName} (${p.fieldOfStudy}) at ${p.schoolName}`}).join(', ')}
    Skills: ${data.person.skills.join(', ')}
    Interests/Goals: ${interestString}`

  // const coreDataStr = "Adam Bowker\n    SDE II @ Amazon | Forkfile on the App Store now!\n    Bellevue, Washington, United States of America\n    Job History: Software Development Engineer II at Amazon, Lead Software Developer at Heller PR, Inc., Software Engineer at Tukios, Special Projects Manager at Persistence AI, Head of Development at Favored Nations, [acquired] Founder & Instructor  at Imagicode, LLC, Mobile App Developer at Aftercare.com - We do the follow up for you, Video Design Intern at North Carolina State University, Software Development Intern at Aftercare.com, IT Intern at Smithfield Foods, Technical Marketing Intern at PawBoost\n    Education History: Computer Science + Civil Engineering (Computer Science + Civil Engineering) at North Carolina State University, High School, Engineering (High School, Engineering) at North Carolina School of Science and Mathematics\n    Skills: Entrepreneurship, Software Development, Amazon Web Services (AWS), Graphic Design, Video Production, Start-ups, HTML, JavaScript, Python (Programming Language), Java, Customer Service, Leadership, Cascading Style Sheets (CSS), Node.js, Express.js, Git, Amazon EC2, Amazon Relational Database Service (RDS), Adobe Creative Suite, MySQL, Heroku, Web Design, REST APIs\n  "
  console.log(coreDataStr)

  const voyageResponse = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get('VOYAGE_API_KEY')}`,
    },
    body: JSON.stringify({
      input: coreDataStr,
      model: 'voyage-3'
    })
  });

  const embeddingData = await voyageResponse.json()
  console.log(embeddingData)

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.person.firstName,
      last_name: data.person.lastName,
      photo_url: data.person.photoUrl,
      github_url: githubProfileUrl,
      linkedin_url: linkedinProfileUrl,
      linkedin_data: data,
      linkedin_document: coreDataStr,
      linkedin_embedding: embeddingData.data[0].embedding
    })
    .eq('id', userId)

  console.log(profileData)
  console.log(profileError)

  return new Response(JSON.stringify({
    firstName: data.person.firstName,
    lastName: data.person.lastName,
    photoUrl: data.person.photoUrl,
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
})
