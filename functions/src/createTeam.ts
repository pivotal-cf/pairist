import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

export const createTeam = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  }

  if (!context.auth.token.email_verified) {
    throw new functions.https.HttpsError('unauthenticated', 'Unverified.');
  }

  const { uid } = context.auth;

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
    created: admin.firestore.FieldValue.serverTimestamp(),
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
