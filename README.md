# Pairist

## Development

Run all server dependencies;

 - `yarn start`: run server with local firebase
 - `yarn test`: run and watch tests


## Production

To produce production assets you need credentials for a deployed firebase, to
do so, create a `.env.production` file in this directory (it is currently git
        ignored) with contents like this:

```bash
REACT_APP_FIREBASE_API_KEY="<api-key>"
REACT_APP_FIREBASE_AUTH_DOMAIN="<auth-domain>"
REACT_APP_FIREBASE_URL="<url>"
REACT_APP_FIREBASE_PROJECT_ID="<project-id>"
REACT_APP_FIREBASE_STORAGE_BUCKET="<storage-bucket>"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="<sender-id>"
```

Our main production instance uses lastpass and its credentials can be retrieved
with (assuming access to the `Shared-Pairist` folder):

```bash
lpass show "Shared-Pairist/.env.production" --notes > .env.production
```
