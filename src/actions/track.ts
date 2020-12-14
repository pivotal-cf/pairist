import { db, fieldValue } from '../firebase';
import { TrackData } from '../types';

const teamsRef = db.collection('teams');

export async function createTrack(teamId: string, track: Partial<TrackData>) {
  await teamsRef.doc(teamId).collection('tracks').add({
    created: fieldValue.serverTimestamp(),
    name: track.name,
    color: track.color,
    emoji: track.emoji,
    laneId: '',
  });
}

export async function updateTrack(teamId: string, trackId: string, track: Partial<TrackData>) {
  await teamsRef.doc(teamId).collection('tracks').doc(trackId).set(
    {
      name: track.name,
      color: track.color,
      emoji: track.emoji,
    },
    { merge: true }
  );
}

export async function moveTrackToLane(teamId: string, trackId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('tracks').doc(trackId).set(
    {
      laneId,
    },
    { merge: true }
  );
}

export async function deleteTrack(teamId: string, trackId: string) {
  await teamsRef.doc(teamId).collection('tracks').doc(trackId).delete();
}
