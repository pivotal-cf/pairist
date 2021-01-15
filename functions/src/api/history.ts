import * as admin from 'firebase-admin';
import * as express from 'express';
import { validateTeamMembership } from '../helpers';
import { PairResponse } from './current';

interface HistoryResponse {
  [timestamp: string]: {
    pairs: PairResponse[];
  };
}

const db = admin.firestore();

export async function historyEndpoint(req: express.Request, res: express.Response) {
  const { teamId } = req.params;
  const { userId } = res.locals;

  let membersData;
  try {
    ({ membersData } = await validateTeamMembership(teamId, userId));
  } catch (err) {
    res.status(400).send(err.message);
    return;
  }

  console.log(`Fetching history for team ${teamId}`);

  const result = await getTeamHistory(teamId, membersData);

  res.json(result);
}

async function getTeamHistory(teamId: string, membersData: any): Promise<HistoryResponse> {
  const result: HistoryResponse = {};
  const teamHistories = (await db.collection('teamHistories').doc(teamId).get()).data() || {};

  for (const timestamp in teamHistories) {
    const historyEntry = teamHistories[timestamp];

    const pairsByLaneId: { [laneId: string]: PairResponse } = {};

    for (const laneId in historyEntry.lanes) {
      pairsByLaneId[laneId] = { roles: [], tracks: [], people: [] };
    }

    for (const roleId in historyEntry.roles) {
      const role = historyEntry.roles[roleId];

      if (pairsByLaneId.hasOwnProperty(role.laneId)) {
        pairsByLaneId[role.laneId].roles.push({
          id: roleId,
          name: role.name,
        });
      }
    }

    for (const trackId in historyEntry.tracks) {
      const track = historyEntry.tracks[trackId];

      if (pairsByLaneId.hasOwnProperty(track.laneId)) {
        pairsByLaneId[track.laneId].tracks.push({
          id: trackId,
          name: track.name,
        });
      }
    }

    for (const userId in historyEntry.people) {
      const person = historyEntry.people[userId];

      if (pairsByLaneId.hasOwnProperty(person.laneId)) {
        const displayName = (membersData[userId] || {}).displayName || '';

        pairsByLaneId[person.laneId].people.push({
          id: userId,
          displayName,
        });
      }
    }

    result[timestamp] = { pairs: Object.values(pairsByLaneId) };
  }

  return result;
}
