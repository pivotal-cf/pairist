import { db } from '../firebase';

const teamsRef = db.collection('teams');

export async function movePersonToLane(teamId: string, userId: string, laneId: string) {
  const newSettings: {
    laneId: string;
    isLocked?: boolean;
  } = {
    laneId,
  };

  if (laneId) {
    // We only want to update this field when we are moving this person into an
    // actual lane. And if we're moving this person to a lane, we know they should
    // not be considered locked anymore.
    newSettings.isLocked = false;
  }

  await teamsRef.doc(teamId).collection('people').doc(userId).set(newSettings, { merge: true });
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
