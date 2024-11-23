# AI matchmaker 🤓

## functions

### ⚡️ parse-linkedin
```
Input
-----
{
    userId: UUID,
    profileUrl: str, // linkedin profile URL
}

Output
------
{}
```
Uses VoyageAI to create an embedding from the given LinkedIn profile, based on:
- Work history
- Education history
- Bio
- Location
- Skills

...then stores this data in the `profiles` table (`linkedin_data: jsonb`, `linkedin_embedding: vector`).

### ⚡️ match
```
Input
-----
{
    userId: UUID,
    conferenceId: int,
    matchLimit: int // optional, defaults to 5
}

Output
------
{
    matches: [{
        userId: UUID,
        reasons: [str],
        icebreakers: [str],
    }],
}
```

Calls RPC function `find_similar_profiles`, which uses a cosine distance vector similary search to find matches for a target user within a target conference.

After finding matches, uses Claude to come up with some icebreakers and "descriptions" on why the profiles are a good match.

Returns up to `matchLimit` matches. Results are stored in the `matches` table.
