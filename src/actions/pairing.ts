import { calculateMovesToBestAssignment, calculateMovesToBestPairing } from '../lib/recommendation';
import { TeamHistory, TeamPlacements } from '../types';
import {
  adaptCurrentDataForRecommendationEngine,
  adaptHistoryDataForRecommendationEngine,
} from '../lib/adapter';
import * as laneActions from './lane';
import * as roleActions from './role';
import * as trackActions from './track';
import * as personActions from './person';

export function getRecommendations(teamId: string, current: TeamPlacements, history: TeamHistory) {
  const adaptedCurrent = adaptCurrentDataForRecommendationEngine(current);
  const adaptedHistory = adaptHistoryDataForRecommendationEngine(history);

  // First, get moves needed to place people in lanes
  const moves = calculateMovesToBestPairing({
    current: adaptedCurrent,
    history: adaptedHistory,
  });

  // If there are no possible moves (e.g. if there are more lanes than can fit people),
  // the recommendation engine will return null.
  if (!moves) {
    return false;
  }

  // Then, add any moves needed to assign roles to people
  const roleMoves = calculateMovesToBestAssignment({
    left: 'person',
    right: 'role',
    current: adaptedCurrent,
    history: adaptedHistory,
  });

  moves.push(...roleMoves);

  moves.forEach(async (rec: any) => {
    const { lane, entities } = rec;

    let laneId: string = lane;
    if (lane === 'new-lane') {
      laneId = await laneActions.createLane(teamId);
    }

    for (const entityId of entities) {
      if (current.tracks.hasOwnProperty(entityId)) {
        trackActions.moveTrackToLane(teamId, entityId, laneId);
      } else if (current.roles.hasOwnProperty(entityId)) {
        roleActions.moveRoleToLane(teamId, entityId, laneId);
      } else if (current.people.hasOwnProperty(entityId)) {
        personActions.movePersonToLane(teamId, entityId, laneId);
      }
    }
  });

  return true;
}
