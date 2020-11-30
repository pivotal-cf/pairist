import { TeamHistory, TeamPlacements } from '../types';
import constants from './constants';

export interface AdaptedLane {
  '.key': string;
  locked?: boolean;
}

export interface AdaptedEntity {
  '.key': string;
  type: 'role' | 'track' | 'person';
  location: string;
}

export function adaptCurrentDataForRecommendationEngine(current: TeamPlacements) {
  const adaptedLanes: AdaptedLane[] = [];
  const adaptedEntities: AdaptedEntity[] = [];

  const { tracks, roles, people, lanes } = current;

  Object.keys(lanes).forEach((laneId) => {
    const lane = lanes[laneId];

    adaptedLanes.push({
      '.key': laneId,
      locked: lane.isLocked,
    });
  });

  Object.keys(roles).forEach((roleId) => {
    const role = roles[roleId];

    adaptedEntities.push({
      '.key': roleId,
      type: 'role',
      location: role.laneId || constants.LOCATION.UNASSIGNED,
    });
  });

  Object.keys(tracks).forEach((trackId) => {
    const track = tracks[trackId];

    adaptedEntities.push({
      '.key': trackId,
      type: 'track',
      location: track.laneId || constants.LOCATION.UNASSIGNED,
    });
  });

  Object.keys(people).forEach((userId) => {
    const person = people[userId];

    adaptedEntities.push({
      '.key': userId,
      type: 'person',
      location: person.laneId || constants.LOCATION.UNASSIGNED,
    });
  });

  return { lanes: adaptedLanes, entities: adaptedEntities };
}

export function adaptHistoryDataForRecommendationEngine(teamHistory: TeamHistory) {
  return Object.keys(teamHistory).map((timestamp) => ({
    '.key': timestamp,
    ...adaptCurrentDataForRecommendationEngine(teamHistory[timestamp]),
  }));
}
