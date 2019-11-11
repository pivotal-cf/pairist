import { db, fieldValue } from '../firebase';

const teamsRef = db.collection('teams');

export async function createLane(teamId: string) {
  const doc = await teamsRef.doc(teamId).collection('lanes').add({
    created: fieldValue.serverTimestamp(),
    isLocked: false,
  });

  return doc.id;
}

export async function lockLane(teamId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('lanes').doc(laneId).update({
    isLocked: true,
  });
}

export async function unlockLane(teamId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('lanes').doc(laneId).update({
    isLocked: false,
  });
}

export async function deleteLane(teamId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('lanes').doc(laneId).delete();
}
