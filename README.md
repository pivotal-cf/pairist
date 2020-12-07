# Pairist v2

This is a re-imagining of the Pairist project. Pairist is a web app for teams that pair. It helps you keep track of your pairs and pairing history, the work you have in progress, standup notes, and action items. It can recommend pairs each day based on who has context on what and how recently people have paired with one another.

## What's new?

Pairist v2 makes several improvements and changes to the original Pairist:

### 🔐 You log in as a _person_, not a team

Previously, Pairist v1 only allowed a single username/password for a whole team. In Pairist v2 you authenticate as **yourself**, with your own credentials.

Now that you're logged in as a _person_, not a team, you can be a member of multiple teams!

A team's "people" are now real users who have been added to the team. Team members can be easily added to/removed from teams to better support rotation between teams.

Plus, since you own your own login, you can reset your password! The v1 implementation left us unable to leverage Firebase's password-reset feature.

### 🎨 New & improved UI

The UI has been updated to be more accessible and more mobile-friendly. We moved away from the Material UI-style components in the original Pairist. Still, the interface should be familiar to anyone who has used the original Pairist.

A few long-standing UI bugs were addressed, especially around text editing for list items and elements getting cut off in smaller browser windows.

### ⚛️ Rewritten using React, TypeScript, and Cloud Firestore

The original version was written in Vue and regular JavaScript. Though this was working fine, in the spirit of experimentation we decided to migrate to React (for fun) and TypeScript (to benefit from static type-checking).

The back-end previously used Firebase's Realtime Database. Pairist 2 still uses Firebase, but has switched to the newer Cloud Firestore offering. [Learn more about the difference.](https://firebase.google.com/docs/database/rtdb-vs-firestore)
