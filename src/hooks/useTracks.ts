import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RouteParams, TrackData } from '../types';

export function useTracks() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = [], loading, error] = useCollectionData<TrackData>(
    db.collection('teams').doc(teamId).collection('tracks').orderBy('name', 'asc'),
    {
      idField: 'trackId',
    }
  );

  if (error || loading) {
    error && console.error(error);
    return [];
  }

  return data;
}
