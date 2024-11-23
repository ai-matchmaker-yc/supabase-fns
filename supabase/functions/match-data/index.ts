import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk';

const getLinkedinDocument = async (supabase, profileId: str) => {
  const { data, error } = await supabase.from('profiles')
    .select('linkedin_document')
    .eq('id', profileId)
    .single()
  return data?.linkedin_document
}

Deno.serve(async (req) => {
  const { userId, matchUserId, conferenceId } = await req.json()

  console.log(userId, matchUserId)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const [ profileDoc, matchDoc ] = await Promise.all([
    getLinkedinDocument(supabase, userId),
    getLinkedinDocument(supabase, matchUserId)
  ])

  console.log(profileDoc)
  console.log(matchDoc)
  
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')
  });

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert matchmaker, on a mission to help event attendees
        find people with whom to connect. Given the profiles of a target attendee and the
        profile of another attendee who I have determined to be a match, write a 1-2
        sentence blurb on why they are a good match, along with 1-2 icebreakers they
        could use upon meeting.

        <target_attendee>
        ${profileDoc}
        </target_attendee>

        Profile 2:
        <matched_attendee>
        ${matchDoc}
        </matched_attendee>
        
        Follow this JSON structure for your output:
        <output_structure>
        {
          "match_reason": "You'll be a good match because you both went to NC State
            University, and both work in education.",
          "icebreakers": [
            "I see you went to NC State University, too!",
            "Looks like we both work in education - how do you like it?"
          ],
        }
        </output_structure>
        `
      }
    ],
  });

  console.log(msg)

  const matchReasoning = JSON.parse(msg.content[0].text)
  console.log(matchReasoning)

  const { data: insertMatchData, error: insertMatchError } = await supabase.from('matches')
    .insert({
      profile_id_1: userId,
      profile_id_2: matchUserId,
      conference_id: conferenceId,
      icebreakers: matchReasoning.icebreakers,
      match_reason: matchReasoning.match_reason
    })

  console.log(insertMatchData)
  console.log(insertMatchError)

  return new Response(
    JSON.stringify(matchReasoning),
    { headers: { "Content-Type": "application/json" } },
  )
})
