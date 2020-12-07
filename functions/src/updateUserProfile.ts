import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ensureAuthenticated } from './helpers';

const db = admin.firestore();
const auth = admin.auth();

export const updateUserProfile = functions.https.onCall(async (data, context) => {
  ensureAuthenticated(context);

  const { uid } = context.auth!;
  const { displayName, photoURL } = data;

  console.log(`Updating profile for user ${uid}`);

  // First, actually update the authenticated user's profile
  const updatedUser = await auth.updateUser(uid, {
    displayName: displayName || '',
    photoURL: photoURL || null,
  });

  // Then, we need to update the teamMembers collection to reflect the new displayName/photoURL.
  // To do that, first get the teams that this user is a member of.
  const teamMemberships = (await db.collection('memberTeams').doc(uid).get()).data() || {};

  const batch = db.batch();

  for (const teamId in teamMemberships) {
    // For each team, update the corresponding entry in teamMembers to have the new fields.
    batch.set(
      db.collection('teamMembers').doc(teamId),
      {
        [uid]: {
          displayName: updatedUser.displayName || '',
          photoURL: updatedUser.photoURL || '',
        },
      },
      { merge: true }
    );
  }

  batch.commit();
});
