import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import { ensureAuthenticated } from './helpers';

const db = getFirestore();

export const createTeam = functions.https.onCall(async (data, context) => {
  ensureAuthenticated(context);

  const { uid } = context.auth!;

  let { teamId, teamName, userDisplayName, userPhotoURL } = data;

  teamId = teamId.toLowerCase();

  console.log(`Creating team ${teamName} (id: ${teamId}) as user ${uid}`);

  const teamSnapshot = await db.collection('teams').doc(teamId).get();

  if (teamSnapshot.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Team with this name already exists.'
    );
  }

  const batch = db.batch();

  batch.set(db.collection('teams').doc(teamId), {
    created: FieldValue.serverTimestamp(),
    teamName,
  });

  batch.set(db.collection('teams').doc(teamId).collection('people').doc(uid), {
    laneId: '',
  });

  batch.set(
    db.collection('teamMembers').doc(teamId),
    {
      [uid]: {
        displayName: userDisplayName || '',
        photoURL: userPhotoURL || '',
      },
    },
    { merge: true }
  );

  batch.set(
    db.collection('memberTeams').doc(uid),
    {
      [teamId]: teamName,
    },
    { merge: true }
  );

  await batch.commit();
});
