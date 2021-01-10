import { initializeApp } from 'firebase-admin';

initializeApp();

export { addTeamMember } from './addTeamMember';
export { api } from './api';
export { createTeam } from './createTeam';
export { onUserDelete } from './onUserDelete';
export { removeTeamMember } from './removeTeamMember';
export { saveHistory } from './saveHistory';
export { updateTeamSettings } from './updateTeamSettings';
export { updateUserProfile } from './updateUserProfile';
export { verifyNewUser } from './verifyNewUser';
