import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

const { pairist } = functions.config();

const cronSchedule = pairist.history_cron_schedule || 'every mon,tue,wed,thu,fri 00:00';
const timezone = pairist.history_cron_timezone || 'America/Los_Angeles';
const entriesToKeep = parseInt(pairist.history_entries_to_keep) || 20;

export const saveHistory = functions.pubsub
  .schedule(cronSchedule)
  .timeZone(timezone)
  .onRun(async () => {
    const timestamp = Date.now().toString();

    console.log(`Recording history for all teams; timestamp: ${timestamp}`);

    const teamsSnapshot = await db.collection('teams').get();

    for (const teamDocSnapshot of teamsSnapshot.docs) {
      const teamId = teamDocSnapshot.id;
      const teamDoc = db.collection('teams').doc(teamId);

      await saveTeamHistory(timestamp, teamId, teamDoc);
    }
  });

async function saveTeamHistory(
  newTimestampKey: string,
  teamId: string,
  teamDoc: admin.firestore.DocumentReference
) {
  const [tracks, roles, people, lanes] = await Promise.all([
    getDocs(teamDoc.collection('tracks')),
    getDocs(teamDoc.collection('roles')),
    getDocs(teamDoc.collection('people')),
    getDocs(teamDoc.collection('lanes')),
  ]);

  try {
    const teamHistory = (await db.collection('teamHistories').doc(teamId).get()).data() || {};

    // Get old timestamps, sorted from low to high
    let oldTimestampKeys = Object.keys(teamHistory)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b)
      .map((n) => n.toString());

    // We'll be adding one more entry in this function, so use length + 1 for calculations
    const newLength = oldTimestampKeys.length + 1;

    if (newLength > entriesToKeep) {
      const amountToRemove = newLength - entriesToKeep;

      // Filter down to N-1 most recent timestamps (N = entriesToKeep). These are the ones
      // we'll be keeping (plus the new one we're adding right now).
      oldTimestampKeys = oldTimestampKeys.slice(newLength - entriesToKeep);

      console.log(`Removing ${amountToRemove} old entries for team ${teamId}`);
    }

    const entries: any = {};

    for (const oldTimestampKey of oldTimestampKeys) {
      entries[oldTimestampKey] = teamHistory[oldTimestampKey];
    }

    entries[newTimestampKey] = { tracks, roles, people, lanes };

    await db.collection('teamHistories').doc(teamId).set(entries);

    console.log(`Saved history for team ${teamId}.`);
  } catch (err) {
    console.error(`Failed to save history for team ${teamId}. ${err.message}`);
  }
}

async function getDocs(ref: admin.firestore.CollectionReference) {
  const snapshot = await ref.get();
  const docsById: any = {};

  for (const doc of snapshot.docs) {
    docsById[doc.id] = doc.data();
  }

  return docsById;
}
