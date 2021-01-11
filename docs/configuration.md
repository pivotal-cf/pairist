# Configuring Pairist

When deploying via the [deploy script](../scripts/deploy), you can set some environment variables to change Pairist's behavior.

**Note:** If an optional environment variable is set on one deploy, then not set on a following deploy, the configuration option will be unset and revert to its default.

## `PAIRIST_FIREBASE_PROJECT_ID` (required)

This is the Firebase project ID you are deploying into. You should be logged in with the Firebase CLI, and you should have access to the project.

If unset, the deploy will fail quickly.

## `PAIRIST_FIREBASE_API_KEY` (required)

This is the Firebase API key for the project you are deploying into. See the Firebase docs for instructions on getting this API key.

If unset, the deploy will fail quickly.

## `PAIRIST_FIREBASE_AUTH_DOMAIN` (optional)

This is the Firebase auth domain for this Firebase app. This is usually `<project-id>.firebaseapp.com`. You'll only need to set this explicitly if your auth domain is different from the default.

If unset, the default is `${PAIRIST_FIREBASE_PROJECT_ID}.firebaseapp.com`.

## `PAIRIST_FIREBASE_URL` (optional)

This is the Firebase database URL for this app. This is usually `https://<project-id>.firebaseio.com`. You'll only need to set this explicitly if your database URL is different from the default.

If unset, the default is `https://${PAIRIST_FIREBASE_PROJECT_ID}.firebaseio.com`.

## `PAIRIST_ALLOWED_EMAIL_DOMAINS` (optional)

Comma-separated list of email domains to allow (e.g. `company1.com,company2.com`).

When a new user signs up, a Cloud Function checks their email against this setting and (if allowed) marks the user as verified. If the email does not have an allowed domain, the user will not be able to see or do anything within Pairist or be added to any teams.

If the allowed domains are changed after users have signed up, existing users will not be unverified. An admin will have to manually verify/unverify older users.

**Note:** If unset, **any** email domain will be accepted.

## `PAIRIST_HISTORY_CRON_SCHEDULE` (optional)

This is the interval at which Pairist will record a snapshot of the current pairs for a team. The recommendation engine uses these snapshots to generate pairs based on pairing history.

Default is `every mon,tue,wed,thu,fri 00:00` (weekdays at midnight).

The syntax used is the [AppEngine cron.yml syntax](https://cloud.google.com/appengine/docs/standard/python/config/cronref).

For more information, see the Firebase/GCP docs:

- https://firebase.google.com/docs/functions/schedule-functions
- https://cloud.google.com/appengine/docs/standard/python/config/cronref

_You probably won't ever need to change this!_

## `PAIRIST_HISTORY_CRON_TIMEZONE` (optional)

This is the timezone used when scheduling the saving of history (see above). If we save history every weekday at midnight, this is the timezone used to determine when exactly midnight is.

As described in the [Firebase docs about scheduled functions](https://firebase.google.com/docs/functions/schedule-functions), this value should be a time zone name from the [tz database](https://en.wikipedia.org/wiki/Tz_database).

Default is `America/Los_Angeles`.

## `PAIRIST_HISTORY_ENTRIES_TO_KEEP` (optional)

This is the number of history entries Pairist stores per team. The default is `20`. The recommendation engine uses these to generate pairs based on pairing history.

_You probably won't ever need to change this!_
