import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RoleData, RouteParams } from '../types';

export function useRoles() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = [], loading, error] = useCollectionData<RoleData>(
    db.collection('teams').doc(teamId).collection('roles').orderBy('name', 'asc'),
    {
      idField: 'roleId',
    }
  );

  if (error || loading) {
    error && console.error(error);
    return [];
  }

  return data;
}
