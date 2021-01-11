# Deploying Pairist v2

Pairist v2 is meant to be deployed into your own Firebase project (or that of your team/organization).

To do so, follow the steps below. It should only take 10-15 minutes.

1. **Set up a Firebase project for your Pairist instance.**

   1. Go to the [Firebase console](https://console.firebase.google.com/) and add a new project.
        1. If you're using an existing GCP project, follow the prompts to select that project and add Firebase to it.
   1. From the console, create a new Firestore database for your project.
   1. Find the authentication page, click "Get started", and enable the "Email/Password" sign-in method. Don't enable the "passwordless log-in".
   1. Find the billing page and upgrade your project to the **"Blaze - pay as you go"** plan.
   1. Under project settings, set a "Public-facing name" for your project (e.g. "MyOrg's Pairist").

1. **Clone the Pairist repo & checkout version tag.**

   1. `git clone https://github.com/pivotal-cf/pairist.git ~/workspace/pairist`
   1. `cd ~/workspace/pairist`
   1. `git checkout v2.0.0` (tag for whichever version you're deploying)

1. **Install dependencies.**

   1. Install Node/NPM, if you don't already have them. There are lots of ways to do this, but some options are listed [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
   1. Install Yarn, as described [here](https://classic.yarnpkg.com/en/docs/install/).

1. **Install the Firebase CLI & target new Firebase project.**

   1. Can either install with NPM (`npm install -g firebase-tools`) or as a standalone binary (`curl -sL firebase.tools | bash`). More options are listed [here](https://firebase.google.com/docs/cli).
   1. Run `firebase login` (which will pop up a browser window to authenticate).
   1. Run `firebase projects:list` to list your projects (which should include the one you created earlier).
   1. Run `firebase use <your-project-id>` to target your new project.

1. **Run the deploy script.**

   1. Run `yarn deploy` from the repo directory with the following required environment variables set:

      - `PAIRIST_FIREBASE_PROJECT_ID`: this is your project ID (the one you used for `firebase use <your-project-id>`)
      - `PAIRIST_FIREBASE_API_KEY`: can be found in the Firebase console, under project settings
      - any other optional variables, as described in the [configuration docs](./configuration.md)

## Troubleshooting

- **Problem:** You get an error when deploying like: `Error: HTTP Error: 400, Billing account for project '___' is not found. Billing must be enabled for activation of service(s) 'cloudbuild.googleapis.com,containerregistry.googleapis.com' to proceed.`
  - **Solution:** In the Firebase console, make sure your project is set to the "Blaze - pay as you go" plan, not the free plan.
