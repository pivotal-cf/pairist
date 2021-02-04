import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RouteParams } from '../types';

interface TeamMembers {
  [userId: string]: {
    displayName: string;
    photoURL: string;
    contextCount: number;
  };
}

export function useTeamMembers() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = {}, loading, error] = useDocumentData(db.collection('teamMembers').doc(teamId));

  if (error || loading) {
    error && console.error(error);
    return {} as TeamMembers;
  }

  return data as TeamMembers;
}
