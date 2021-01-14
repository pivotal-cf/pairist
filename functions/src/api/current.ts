import * as admin from 'firebase-admin';
import * as express from 'express';
import { getDocs, validateTeamMembership } from '../helpers';

interface PairsResponse {
  pairs: PairResponse[];
}

interface PairResponse {
  roles: {
    id: string;
    name: string;
  }[];
  tracks: {
    id: string;
    name: string;
  }[];
  people: {
    id: string;
    displayName: string;
  }[];
}

export async function currentPairsEndpoint(req: express.Request, res: express.Response) {
  const { teamId } = req.params;
  const { userId } = res.locals;

  let teamDoc, membersData;
  try {
    ({ teamDoc, membersData } = await validateTeamMembership(teamId, userId));
  } catch (err) {
    res.status(400).send(err.message);
    return;
  }

  console.log(`Fetching current pairs for team ${teamId}`);

  const result = await getCurrentPairs(membersData, teamDoc);

  res.json(result);
}

async function getCurrentPairs(
  membersData: any,
  teamDoc: admin.firestore.DocumentReference
): Promise<PairsResponse> {
  const pairsByLaneId: { [laneId: string]: PairResponse } = {};

  const [tracks, roles, people, lanes] = await Promise.all([
    getDocs(teamDoc.collection('tracks')),
    getDocs(teamDoc.collection('roles')),
    getDocs(teamDoc.collection('people')),
    getDocs(teamDoc.collection('lanes')),
  ]);

  for (const laneId in lanes) {
    pairsByLaneId[laneId] = { roles: [], tracks: [], people: [] };
  }

  for (const roleId in roles) {
    const role = roles[roleId];

    if (pairsByLaneId.hasOwnProperty(role.laneId)) {
      pairsByLaneId[role.laneId].roles.push({
        id: roleId,
        name: role.name,
      });
    }
  }

  for (const trackId in tracks) {
    const track = tracks[trackId];

    if (pairsByLaneId.hasOwnProperty(track.laneId)) {
      pairsByLaneId[track.laneId].tracks.push({
        id: trackId,
        name: track.name,
      });
    }
  }

  for (const userId in people) {
    const person = people[userId];

    if (pairsByLaneId.hasOwnProperty(person.laneId)) {
      const displayName = (membersData[userId] || {}).displayName || '';

      pairsByLaneId[person.laneId].people.push({
        id: userId,
        displayName,
      });
    }
  }

  return {
    pairs: Object.values(pairsByLaneId),
  };
}
