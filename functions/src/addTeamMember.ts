import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ensureAuthenticated } from './helpers';

const db = admin.firestore();
const auth = admin.auth();

/**
 * This function is called directly from the front-end when a user adds a team member to a
 * team by email. It authenticates, looks up the user, and then (assuming this operation is
 * valid) updates teamMembers to mark that this team has a new member and updates memberTeams
 * to mark that this user is now a member of a new team.
 */
export const addTeamMember = functions.https.onCall(async (data, context) => {
  ensureAuthenticated(context);

  const { uid } = context.auth!;

  const { teamId, teamName, memberEmail } = data;

  const membersSnapshot = await db.collection('teamMembers').doc(teamId).get();
  const currentMembers = membersSnapshot.data() || {};

  if (!currentMembers.hasOwnProperty(uid)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authenticated as a member of this team.'
    );
  }

  console.log(`Adding user ${memberEmail} to team ${teamName} (teamId: ${teamId})`);

  let userToAdd: admin.auth.UserRecord;
  try {
    userToAdd = await auth.getUserByEmail(memberEmail);
  } catch (err) {
    throw new functions.https.HttpsError('not-found', 'User not found.');
  }

  if (userToAdd.customClaims?.pairistValidEmail !== true) {
    throw new functions.https.HttpsError('failed-precondition', 'Cannot add unverified user.');
  }

  if (currentMembers.hasOwnProperty(userToAdd.uid)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User is already a member of this team.'
    );
  }

  const batch = db.batch();

  batch.set(
    db.collection('teamMembers').doc(teamId),
    {
      [userToAdd.uid]: {
        displayName: userToAdd.displayName || '',
        email: userToAdd.email || '',
        photoURL: userToAdd.photoURL || '',
      },
    },
    { merge: true }
  );

  batch.set(
    db.collection('memberTeams').doc(userToAdd.uid),
    {
      [teamId]: teamName,
    },
    { merge: true }
  );

  await batch.commit();
});
