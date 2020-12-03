import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

export const removeTeamMember = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  }

  if (!context.auth.token.email_verified) {
    throw new functions.https.HttpsError('unauthenticated', 'Unverified.');
  }

  const { uid } = context.auth;

  const { teamId, userId } = data;

  const membersSnapshot = await db.collection('teamMembers').doc(teamId).get();
  const currentMembers = membersSnapshot.data() || {};

  if (!(uid in currentMembers)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authenticated as a member of this team.'
    );
  }

  console.log(`Removing user ${userId} from team ${teamId}`);

  if (!(userId in currentMembers)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User is not a member of this team.'
    );
  }

  const batch = db.batch();

  batch.set(
    db.collection('teamMembers').doc(teamId),
    {
      [userId]: admin.firestore.FieldValue.delete(),
    },
    { merge: true }
  );

  batch.set(
    db.collection('memberTeams').doc(userId),
    {
      [teamId]: admin.firestore.FieldValue.delete(),
    },
    { merge: true }
  );

  await batch.commit();
});
