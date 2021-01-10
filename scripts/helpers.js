const admin = require('firebase-admin');

export async function run(func) {
  try {
    await func();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export async function initializeFirebase() {
  const projectId = process.env.PAIRIST_FIREBASE_PROJECT_ID;
  const serviceAccountPath = process.env.PAIRIST_FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!projectId) {
    console.error('PAIRIST_FIREBASE_PROJECT_ID is not set.');
    process.exit(1);
  }

  if (!serviceAccountPath) {
    console.error('PAIRIST_FIREBASE_SERVICE_ACCOUNT_PATH is not set.');
    process.exit(1);
  }

  console.log(`Firebase project is: ${projectId}`);

  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    databaseURL: `https://${projectId}.firebaseio.com`,
  });

  return {
    auth: admin.auth(),
  };
}
