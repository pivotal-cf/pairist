import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();
const auth = admin.auth();

export const addTeamMember = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  }

  if (!context.auth.token.email_verified) {
    throw new functions.https.HttpsError('unauthenticated', 'Unverified.');
  }

  const { uid } = context.auth;

  const { teamId, teamName, memberEmail } = data;

  const membersSnapshot = await db.collection('teamMembers').doc(teamId).get();
  const currentMembers = membersSnapshot.data() || {};

  if (!(uid in currentMembers)) {
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

  if (!userToAdd.emailVerified) {
    throw new functions.https.HttpsError('failed-precondition', 'Cannot add unverified user.');
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
