import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useParams, useHistory } from 'react-router';
import { db } from '../firebase';
import { RouteParams } from '../types';

interface TeamSettings {
  teamName: string;
}

export function useTeamSettings() {
  const { teamId = '-' } = useParams<RouteParams>();
  const [data = {}, loading, error] = useDocumentData(db.collection('teams').doc(teamId));

  if (error || loading) {
    error && console.error(error);
    return { loading, error, teamSettings: {} as TeamSettings };
  }

  return { loading, error, teamSettings: data as TeamSettings };
}
