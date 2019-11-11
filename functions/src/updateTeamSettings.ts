import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

/**
 * This function is meant to propagate changes to team settings (e.g. team names)
 * to all the places where the data has been duplicated. Due to the way Firestore
 * works, we had to duplicate (AKA denormalize) some data. So when the source of
 * truth changes, we have to update the duplicates.
 *
 * Specifically, when a team's name is changed, we need to go into memberTeams and
 * update the team names there.
 */
export const updateTeamSettings = functions.firestore
  .document('/teams/{teamId}')
  .onUpdate(async (change, context) => {
    const { teamId } = context.params;

    console.log(`Detected update to team ${teamId}`);

    const { teamName: oldTeamName } = change.before.data();
    const { teamName: newTeamName } = change.after.data();

    if (oldTeamName === newTeamName) {
      console.log('No change to team name; returning early');
      return;
    }

    console.log(`Propagating team name change: ${oldTeamName} -> ${newTeamName}`);

    // Find all users who are members of the team that was changed
    const teamMembers = (await db.collection('teamMembers').doc(teamId).get()).data() || {};

    const batch = db.batch();

    for (const userId in teamMembers) {
      // For each user that is a member of this team, update the corresponding entry
      // in memberTeams to have the new team name.
      batch.set(
        db.collection('memberTeams').doc(userId),
        {
          [teamId]: newTeamName,
        },
        { merge: true }
      );
    }

    batch.commit();
  });
