import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router';
import { db } from '../firebase';
import { RouteParams, TeamHistory } from '../types';

export function useTeamHistories() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = {}, loading, error] = useDocumentData(db.collection('teamHistories').doc(teamId));

  if (error || loading) {
    error && console.error(error);
    return {} as TeamHistory;
  }

  return data as TeamHistory;
}
