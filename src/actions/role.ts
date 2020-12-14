import { db, fieldValue } from '../firebase';
import { RoleData } from '../types';

const teamsRef = db.collection('teams');

export async function createRole(teamId: string, role: Partial<RoleData>) {
  await teamsRef.doc(teamId).collection('roles').add({
    created: fieldValue.serverTimestamp(),
    name: role.name,
    color: role.color,
    emoji: role.emoji,
    laneId: '',
  });
}

export async function updateRole(teamId: string, roleId: string, role: Partial<RoleData>) {
  await teamsRef.doc(teamId).collection('roles').doc(roleId).set(
    {
      name: role.name,
      color: role.color,
      emoji: role.emoji,
    },
    { merge: true }
  );
}

export async function moveRoleToLane(teamId: string, roleId: string, laneId: string) {
  await teamsRef.doc(teamId).collection('roles').doc(roleId).set(
    {
      laneId,
    },
    { merge: true }
  );
}

export async function deleteRole(teamId: string, roleId: string) {
  await teamsRef.doc(teamId).collection('roles').doc(roleId).delete();
}
