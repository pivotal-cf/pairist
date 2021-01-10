import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;

  console.log(`Handling deletion of user ${userId}`);

  // We need to remove all the entries from teamMembers for the deleted user.
  // To do that, first get the teams that this user is a member of.
  const teamMemberships = (await db.collection('memberTeams').doc(userId).get()).data() || {};

  const batch = db.batch();

  for (const teamId in teamMemberships) {
    // For each team, remove the deleted user from teamMembers
    batch.set(
      db.collection('teamMembers').doc(teamId),
      {
        [userId]: admin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );

    batch.delete(db.collection('teams').doc(teamId).collection('people').doc(userId));
  }

  // And also, delete all entries under this userId in memberTeams
  batch.delete(db.collection('memberTeams').doc(userId));

  await batch.commit();
});
