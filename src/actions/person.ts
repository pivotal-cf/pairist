import { db } from '../firebase';

const teamsRef = db.collection('teams');

export async function movePersonToLane(teamId: string, userId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('people').doc(userId).set(
    {
      laneId,
      contextCount: 0,
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

export async function setContextCount(teamId: string, userId: string, contextCount: number) {
  await teamsRef.doc(teamId).collection('people').doc(userId).set(
    {
      contextCount
    },
    { merge: true }
  );
}
