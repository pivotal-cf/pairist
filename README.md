# 👥 Pairist v2

Pairist is a web app for teams that pair program. It helps you keep track of your pairs and pairing history, the work you have in progress, standup notes, and action items. It can recommend pairs each day based on who has context on what and how recently people have paired with one another.

Pairist v2 is a re-imagining of the Pairist project. The original Pairist can be found on the `v1` branch.

## ✨ What's new in v2?

Pairist v2 introduces several improvements and changes.

### 🔐 You log in as a _person_, not a team

Pairist v1 only allowed a single username/password for a whole team. In v2, you authenticate as **yourself**, with your own credentials.

Now that you're logged in as a _person_, not a team, you can be a member of multiple teams, and you can switch between your teams without logging out.

A team's "people" are now real users who have been added to the team. Team members can be easily added to/removed from teams to better support rotation between teams.

Plus, since you own your own login, you can reset your password! The v1 implementation left us unable to leverage Firebase's password-reset feature.

### 🎨 New & improved UI

The UI has been updated to be more accessible and more mobile-friendly. We moved away from the Material Design-style components in the original Pairist. Still, the interface should be familiar to anyone who used the original.

A few long-standing UI bugs were addressed, especially around text editing for list items and elements getting cut off in smaller browser windows.

### ⚛️ Rewritten using React, TypeScript, and Cloud Firestore

The original version was written in Vue and plain JavaScript. Though this was working fine, in the spirit of experimentation we decided to migrate to React (for fun) and TypeScript (to benefit from static type-checking). Plus, more people in the Pairist community are familiar with React than with Vue, so we hope this increases maintainability and encourages more contributions.

The back-end previously used Firebase's Realtime Database. Now, we still use Firebase, but we've switched to the newer Cloud Firestore offering. [Learn more about the difference.](https://firebase.google.com/docs/database/rtdb-vs-firestore)

## 🚀 Deployment

See the [deployment doc](docs/deployment.md) for detailed instructions.

## 💻 Development

You'll need Node, NPM, and Yarn locally. Clone this repo. Check the [`package.json`](package.json) `scripts` section for all scripts, but some useful ones are:

- `PAIRIST_FIREBASE_PROJECT_ID=... PAIRIST_FIREBASE_API_KEY=... yarn start` to start the front-end locally, using the specified Firebase project as the back-end

- `PAIRIST_FIREBASE_PROJECT_ID=... PAIRIST_FIREBASE_API_KEY=... yarn build` to compile the front-end for production, using the specified Firebase project as the back-end

- `yarn test` to run unit tests
