# Architecture

This doc aims to give an overview of Pairist's architecture and the technologies it uses.

## Front-end

Pairist v2 is a React app, bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It uses [Craco](https://github.com/gsoft-inc/craco) to override a bit of the default CRA configuration without needing to fully eject.

It uses the latest version of React (as of this writing). It makes heavy use of [hooks](https://reactjs.org/docs/hooks-overview.html) and functional components.

Styles are written in [Sass](https://sass-lang.com/), which gets compiled into CSS. We use the [astroturf](https://github.com/4Catalyzer/astroturf) library to let us write Sass styles directly in component files, then reference those styles via class names. Behind the scenes, astroturf + webpack compile these styles and bundle them accordingly.

The front-end is served by Firebase hosting, just like the rest of the app. This makes deployment straightforward.

## Back-end

The back-end is powered by two Firebase offerings: [Cloud Functions](https://firebase.google.com/docs/functions) and [Cloud Firestore](https://firebase.google.com/docs/firestore).

### Cloud Functions

These are Firebase "serverless" functions. They can trigger on certain events (e.g. a user being created, or a cron schedule), or they can be called directly from the app via HTTP requests. Pairist does both in different cases.

See all of Pairist's functions in the [functions directory](../functions). There are comments explaining some of the less intuitive parts.

### Cloud Firestore

This is the Firebase database offering that Pairist uses. It is a NoSQL database that organizes its data into "documents" (JSON objects) and "collections" (lists of documents).

As of this writing, these are the top-level collections in Pairist's database:

- `teams`: indexed by team URL, and keeps track of current tracks/roles/lanes/locations for a single team
- `teamMembers`: indexed by team URL, and keeps track of which user IDs are members of a given team
- `memberTeams`: indexed by user ID, and keeps track of which teams a user is a member of
- `userRefresh`: indexed by user ID, used to refresh a user's session state in some edge cases

Note that there is some duplication/denormalization, across the three primary collections. This is to make querying simpler from the front-end: sometimes we want to fetch all members of a given team, and sometimes we want to fetch all teams for a given user. But this means that there is some bookkeeping to be done to keep all of these collections in-sync. Several Cloud Functions are responsible for doing this bookkeeping (e.g. when a user is deleted, delete all the corresponding entries from each collection).

For querying data from Firestore in a React-y way, the front-end uses the [react-firebase-hooks](https://www.npmjs.com/package/react-firebase-hooks) library, which provides hooks that subscribe to collections/documents and automatically re-render on changes.
