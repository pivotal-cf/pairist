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

export async function lockPerson(teamId: string, userId: string) {
  await teamsRef.doc(teamId).collection('people').doc(userId).set(
    {
      isLocked: true,
      laneId: '',
    },
    { merge: true }
  );
}

export async function unlockPerson(teamId: string, userId: string) {
  await teamsRef.doc(teamId).collection('people').doc(userId).set(
    {
      isLocked: false,
    },
    { merge: true }
  );
}
