import { db } from '../firebase';

const teamsRef = db.collection('teams');

export async function movePersonToLane(teamId: string, userId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('people').doc(userId).set(
    {
      laneId,
    },
    { merge: true }
  );
}
