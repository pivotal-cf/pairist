import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { LaneData, RouteParams } from '../types';

export function useLanes() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = [], loading, error] = useCollectionData<LaneData>(
    db.collection('teams').doc(teamId).collection('lanes').orderBy('created', 'asc'),
    {
      idField: 'laneId',
    }
  );

  if (error || loading) {
    error && console.error(error);
    return [];
  }

  return data;
}
