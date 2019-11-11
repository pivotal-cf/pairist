import { auth, db, fieldValue, funcs } from '../firebase';
import { TeamData } from '../types';

const teamsRef = db.collection('teams');
const createTeamFunc = funcs.httpsCallable('createTeam');
const addTeamMemberFunc = funcs.httpsCallable('addTeamMember');

export async function createTeam(team: Partial<TeamData>) {
  const { teamId, isPublic, teamName } = team;

  if (!teamId) return;

  const currentUser = auth.currentUser;

  await createTeamFunc({
    teamId,
    teamName,
    isPublic,
    userDisplayName: currentUser ? currentUser.displayName : '',
    userPhotoURL: currentUser ? currentUser.photoURL : '',
  });
}

export async function updateTeam(team: Partial<TeamData>) {
  const opts: Partial<TeamData> = {};
  if ('isPublic' in team) opts.isPublic = team.isPublic;
  if ('teamName' in team) opts.teamName = team.teamName;

  await teamsRef.doc(team.teamId).set(
    {
      ...opts,
    },
    { merge: true }
  );
}

export async function addTeamMember(teamId: string, teamName: string, memberEmail: string) {
  await addTeamMemberFunc({
    teamId,
    teamName,
    memberEmail,
  });
}

export async function removeTeamMember(opts: { id: string; userId: string }) {
  await teamsRef.doc(opts.id).set(
    {
      members: {
        [opts.userId]: fieldValue.delete(),
      },
    },
    { merge: true }
  );
}
