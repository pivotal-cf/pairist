import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import { useSession } from './useSession';

interface MemberTeams {
  [teamId: string]: string;
}

export function useMemberTeams() {
  const { userId } = useSession();

  const [data = {}, loading, error] = useDocumentData(
    db.collection('memberTeams').doc(userId || '-')
  );

  if (error || loading) {
    error && userId && console.error(error);
    return {} as MemberTeams;
  }

  return data as MemberTeams;
}
