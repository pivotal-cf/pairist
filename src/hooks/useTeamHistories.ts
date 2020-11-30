import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RouteParams } from '../types';

interface TeamHistories {
  [timestamp: string]: {
    lanes: {
      [laneId: string]: {
        isLocked: boolean;
      };
    };
    tracks: {
      [trackId: string]: {
        name: string;
        laneId: string;
      };
    };
    roles: {
      [roleId: string]: {
        name: string;
        laneId: string;
      };
    };
    people: {
      [userId: string]: {
        laneId: string;
      };
    };
  };
}

export function useTeamHistories() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = {}, loading, error] = useDocumentData(db.collection('teamHistories').doc(teamId));

  if (error || loading) {
    error && console.error(error);
    return {} as TeamHistories;
  }

  return data as TeamHistories;
}
