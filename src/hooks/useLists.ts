import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { ListData, RouteParams } from '../types';

export function useLists() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = [], loading, error] = useCollectionData(
    db.collection('teams').doc(teamId).collection('lists').orderBy('order', 'asc'),
    {
      idField: 'listId',
    }
  );

  if (error || loading) {
    error && console.error(error);
    return [];
  }

  return data as ListData[];
}
