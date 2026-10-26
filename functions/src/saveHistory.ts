import {
  getFirestore,
  type CollectionReference,
  type DocumentReference,
} from 'firebase-admin/firestore';
import { historyCronSchedule, historyCronTimezone, historyEntriesToKeep } from './config';
import { errorMessage } from './helpers';
import * as functions from 'firebase-functions/v1';

const db = getFirestore();

export const saveHistory = functions.pubsub
  .schedule(historyCronSchedule)
  .timeZone(historyCronTimezone)
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
  teamDoc: DocumentReference
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

    if (newLength > historyEntriesToKeep) {
      const amountToRemove = newLength - historyEntriesToKeep;

      // Filter down to N-1 most recent timestamps (N = historyEntriesToKeep). These are the ones
      // we'll be keeping (plus the new one we're adding right now).
      oldTimestampKeys = oldTimestampKeys.slice(newLength - historyEntriesToKeep);

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
    console.error(`Failed to save history for team ${teamId}. ${errorMessage(err)}`);
  }
}

async function getDocs(ref: CollectionReference) {
  const snapshot = await ref.get();
  const docsById: any = {};

  for (const doc of snapshot.docs) {
    docsById[doc.id] = doc.data();
  }

  return docsById;
}
