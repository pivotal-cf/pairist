import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { ensureAuthenticated } from './helpers';

const db = admin.firestore();

export const removeTeamMember = functions.https.onCall(async (data, context) => {
  ensureAuthenticated(context);

  const { uid } = context.auth!;

  const { teamId, userId } = data;

  const membersSnapshot = await db.collection('teamMembers').doc(teamId).get();
  const currentMembers = membersSnapshot.data() || {};

  if (!currentMembers.hasOwnProperty(uid)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Not authenticated as a member of this team.'
    );
  }

  console.log(`Removing user ${userId} from team ${teamId}`);

  if (!currentMembers.hasOwnProperty(userId)) {
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

  batch.delete(db.collection('teams').doc(teamId).collection('people').doc(userId));

  await batch.commit();
});
