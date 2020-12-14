# API access

Pairist v2 exposes a very basic API endpoint for the retrieval of the current pairs. It's powered by [a Cloud Function](../functions/api.ts).

The endpoint looks like this: `GET /api/current/:teamId`. It requires an `Authorization` header containing a valid Firebase ID token.

## How to use

The provided token must be valid and must belong to a member of the team in question.

For programmatic usage (e.g. the backend of a Slackbot), a suggested approach is to make a new account for the bot. A team member will have to invite this account by email to their team, thereby giving the bot access to this endpoint. Since team members may remove other team members at any time, this is how you would disable the integration from within a team.

## Request & response

Sample `curl`:

```
curl 'https://us-central1-${PAIRIST_FIREBASE_PROJECT_ID}.cloudfunctions.net/api/current/${TEAM_ID}' -H 'Authorization: Bearer some-token'
```

Note the full URL. Firebase Cloud Functions are deployed into the `us-central-1` region by default. If you change this, your URL may look different.

A team ID is just the team URL slug: if your team lives at `<pairist-URL>/teams/lol`, then your team ID is `lol`.

The endpoint returns JSON that looks like this:

```json
{
  "pairs": [
    {
      "people": [
        {
          "id": "user-id-1",
          "displayName": "Person 1"
        },
        {
          "id": "user-id-2",
          "displayName": ""
        }
      ],
      "roles": [
        {
          "id": "role-id-1",
          "name": "Role 1"
        }
      ],
      "tracks": []
    },
    {
      "people": [
        {
          "id": "user-id-3",
          "displayName": "Person 3"
        }
      ],
      "roles": [],
      "tracks": [
        {
          "id": "track-id-1",
          "name": "Track 1"
        }
      ]
    }
  ]
}
```
