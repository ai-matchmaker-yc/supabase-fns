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
        similarity_score: float, // range 0-1, higher means more similar
    }],
}
```

Calls RPC function `find_similar_profiles`, which uses a cosine distance vector similary search to find matches for a target user within a target conference.

Returns up to `matchLimit` matches. Output is sorted by `similarity_score`, descending.

### ⚡️ match-data
```
Input
-----
{
    userId: UUID,
    matchUserId: UUID,
    conferenceId: int,
}

Output
------
{
    match_reason: "You both have entrepreneurial experience and have recently launched...",
    icebreakers: [
        "I noticed we're both NCSU alum...",
        "How's life after launching? I also..."
    ]
}
```
