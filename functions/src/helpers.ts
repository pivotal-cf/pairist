import * as functions from 'firebase-functions';

export function ensureAuthenticated(context: functions.https.CallableContext) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  }

  if (context.auth.token.pairistValidEmail !== true) {
    throw new functions.https.HttpsError('unauthenticated', 'Unverified.');
  }
}
