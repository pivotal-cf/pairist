import { initializeApp } from 'firebase-admin/app';
import { v1 as firestoreV1 } from '@google-cloud/firestore';
import * as functions from 'firebase-functions/v1';
import { backupBucketName } from './config';

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

// [START fs_schedule_export]
if (backupBucketName) {
  const client = new firestoreV1.FirestoreAdminClient();

  exports.scheduledFirestoreExport = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const projectId = await client.getProjectId();
    const databaseName = client.databasePath(projectId, '(default)');

    try {
      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: backupBucketName,
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [],
      });

      console.log(`Operation Name: ${response.name}`);
    } catch (err) {
      console.error(err);
      throw new Error('Export operation failed');
    }
  });
}
// [END fs_schedule_export]
