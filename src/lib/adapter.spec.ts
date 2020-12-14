import constants from './constants';
import {
  adaptCurrentDataForRecommendationEngine,
  adaptHistoryDataForRecommendationEngine,
} from './adapter';

describe('adaptCurrentDataForRecommendationEngine', () => {
  it('converts the new data format into the old data format', () => {
    const result = adaptCurrentDataForRecommendationEngine({
      lanes: {
        l1: { isLocked: true },
        l2: { isLocked: false },
      },
      people: {
        p1: { laneId: '', isLocked: false },
        p2: { laneId: 'l2', isLocked: false },
        p3: { laneId: '', isLocked: true },
      },
      roles: {
        r1: { laneId: 'l1' },
        r2: { laneId: '' },
      },
      tracks: {
        t1: { laneId: '' },
      },
    });

    expect(result).toEqual({
      lanes: expect.arrayContaining([
        { '.key': 'l1', locked: true },
        { '.key': 'l2', locked: false },
      ]),
      entities: expect.arrayContaining([
        { '.key': 'p1', type: 'person', location: constants.LOCATION.UNASSIGNED },
        { '.key': 'p2', type: 'person', location: 'l2' },
        { '.key': 'p3', type: 'person', location: constants.LOCATION.OUT },
        { '.key': 'r1', type: 'role', location: 'l1' },
        { '.key': 'r2', type: 'role', location: constants.LOCATION.UNASSIGNED },
        { '.key': 't1', type: 'track', location: constants.LOCATION.UNASSIGNED },
      ]),
    });
  });
});

describe('adaptHistoryDataForRecommendationEngine', () => {
  it('converts the new data format into the old data format', () => {
    const result = adaptHistoryDataForRecommendationEngine({
      time1: {
        lanes: {
          l1: { isLocked: true },
          l2: { isLocked: false },
        },
        people: {
          p1: { laneId: '', isLocked: false },
          p2: { laneId: 'l2', isLocked: false },
          p3: { laneId: '', isLocked: true },
        },
        roles: {
          r1: { laneId: 'l1' },
          r2: { laneId: '' },
        },
        tracks: {
          t1: { laneId: '' },
        },
      },
      time2: {
        lanes: {},
        people: {
          p1: { laneId: '' },
        },
        roles: {
          r2: { laneId: '' },
        },
        tracks: {},
      },
    });

    expect(result).toEqual([
      {
        '.key': 'time1',
        lanes: expect.arrayContaining([
          { '.key': 'l1', locked: true },
          { '.key': 'l2', locked: false },
        ]),
        entities: expect.arrayContaining([
          { '.key': 'p1', type: 'person', location: constants.LOCATION.UNASSIGNED },
          { '.key': 'p2', type: 'person', location: 'l2' },
          { '.key': 'p3', type: 'person', location: constants.LOCATION.OUT },
          { '.key': 'r1', type: 'role', location: 'l1' },
          { '.key': 'r2', type: 'role', location: constants.LOCATION.UNASSIGNED },
          { '.key': 't1', type: 'track', location: constants.LOCATION.UNASSIGNED },
        ]),
      },
      {
        '.key': 'time2',
        lanes: expect.arrayContaining([]),
        entities: expect.arrayContaining([
          { '.key': 'p1', type: 'person', location: constants.LOCATION.UNASSIGNED },
          { '.key': 'r2', type: 'role', location: constants.LOCATION.UNASSIGNED },
        ]),
      },
    ]);
  });
});
