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

// [START fs_schedule_export]
const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

const bucket = functions.config().pairist.backup_bucket_name;

if (bucket) {
  exports.scheduledFirestoreExport = functions.pubsub
    .schedule('every 24 hours')
    .onRun((context: any) => {

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName =
      client.databasePath(projectId, '(default)');

    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: []
    })
      .then((responses: any) => {
        const response = responses[0];
        console.log(`Operation Name: ${response['name']}`);
      })
      .catch((err: any) => {
        console.error(err);
        throw new Error('Export operation failed');
      });
  });
};
// [END fs_schedule_export]
