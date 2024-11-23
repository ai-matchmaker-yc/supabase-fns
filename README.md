# AI matchmaker 🤓

## functions

### parse-linkedin
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

### match
```
Input
-----
{
    userId: UUID,
    conferenceId: int,
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

Uses vector similary search (cosine distance) to find matches for a target user, within a target conference.

After finding matches, uses Claude to come up with some icebreakers and "descriptions" on why the profiles are a good match.

Matches found are stored in the `matches` table.
