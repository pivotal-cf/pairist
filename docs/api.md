# API access

Pairist v2 exposes a very basic API endpoint for the retrieval of the current pairs. It's powered by [a Cloud Function](../functions/api.ts).

## How to use

In general, these endpoints can be reached at:

`https://us-central1-${PAIRIST_FIREBASE_PROJECT_ID}.cloudfunctions.net/api/${ENDPOINT}`.

Note the full URL. Firebase Cloud Functions are deployed into the `us-central1` region by default. If you change this, your URL may look different.

For programmatic usage (e.g. the backend of a Slackbot), a suggested approach is to make a new account for the bot. A team member will have to invite this account by email to their team, thereby giving the bot access to this endpoint. Since team members may remove other team members at any time, this is how you would disable the integration from within a team.

## `GET /api/current/:teamId`

This endpoint requires an `Authorization` header containing a valid Firebase ID token. The provided token must be valid and must belong to a member of the team in question.

A team ID is just the team URL slug: if your team lives at `<pairist-URL>/teams/my-team`, then your team ID is `my-team`.

### Sample `curl`

```
curl 'https://us-central1-my-firebase-project.cloudfunctions.net/api/current/my-team' -H 'Authorization: Bearer some-token'
```

### Sample response

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

## `GET /api/lists/:teamId`

This endpoint requires an `Authorization` header containing a valid Firebase ID token. The provided token must be valid and must belong to a member of the team in question.

A team ID is just the team URL slug: if your team lives at `<pairist-URL>/teams/my-team`, then your team ID is `my-team`.

### Sample `curl`

```
curl 'https://us-central1-my-firebase-project.cloudfunctions.net/api/lists/my-team' -H 'Authorization: Bearer some-token'
```

### Sample response

**Note about ordering:** The elements of the `lists` array and the `items` array within each list are _not returned in a stable order_. If clients want to reconstruct the order shown in the UI, use the `order` field on each list/item to sort ascending. These order values themselves are not really meaningful, but they are used to track the relative order of lists and items.

```json
{
  "lists": [
    {
      "title": "List two",
      "order": 1610597815650,
      "items": [
        {
          "text": "aaa",
          "order": 1610597853013,
          "reactions": {}
        },
        {
          "text": "bbb",
          "order": 1610597852061,
          "reactions": {}
        },
        {
          "text": "ccc",
          "order": 1610597854093,
          "reactions": {}
        }
      ]
    },
    {
      "title": "List one",
      "order": 1610597810279,
      "items": [
        {
          "text": "nice",
          "order": 1610597849957,
          "reactions": {
            "full_moon_with_face": {
              "count": 4,
              "timestamp": 1610597858276
            }
          }
        },
        {
          "text": "lol",
          "order": 1610597847797,
          "reactions": {
            "alarm_clock": {
              "count": 1,
              "timestamp": 1610597857053
            }
          }
        }
      ]
    },
    {
      "title": "List three",
      "order": 1610597819820,
      "items": []
    }
  ]
}
```

## `GET /api/history/:teamId`

This endpoint requires an `Authorization` header containing a valid Firebase ID token. The provided token must be valid and must belong to a member of the team in question.

A team ID is just the team URL slug: if your team lives at `<pairist-URL>/teams/my-team`, then your team ID is `my-team`.

History entries are keyed by timestamp. The max number of history entries stored per team, and the schedule by which history is saved, are [configurable](./configuration.md) per deployment.

### Sample `curl`

```
curl 'https://us-central1-my-firebase-project.cloudfunctions.net/api/current/my-team' -H 'Authorization: Bearer some-token'
```

### Sample response

```json
{
  "1610524804113": {
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
  },
  "1610438407529": {
    "pairs": [
      {
        "people": [
          {
            "id": "user-id-1",
            "displayName": "Person 1"
          }
        ],
        "roles": [],
        "tracks": [
          {
            "id": "track-id-1",
            "name": "Track 1"
          }
        ]
      },
      {
        "people": [
          {
            "id": "user-id-3",
            "displayName": "Person 3"
          },
          {
            "id": "user-id-2",
            "displayName": ""
          }
        ],
        "roles": [],
        "tracks": []
      }
    ]
  }
}
```
