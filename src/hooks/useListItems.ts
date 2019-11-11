import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RouteParams } from '../types';

export interface ListItemData {
  itemId: string;
  text: string;
  order: number;
  reactions: {};
}

export function useListItems(listId: string) {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = [], loading, error] = useCollectionData(
    db
      .collection('teams')
      .doc(teamId)
      .collection('lists')
      .doc(listId)
      .collection('items')
      .orderBy('order', 'asc'),
    {
      idField: 'itemId',
    }
  );

  if (error || loading) {
    error && console.error(error);
    return [];
  }

  return data as ListItemData[];
}
