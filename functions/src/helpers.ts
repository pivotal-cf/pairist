import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export function ensureAuthenticated(context: functions.https.CallableContext) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated.');
  }

  if (context.auth.token.pairistValidEmail !== true || context.auth.token.email_verified !== true) {
    throw new functions.https.HttpsError('unauthenticated', 'Unverified.');
  }
}

export async function validateFirebaseAuthentication(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('bearer ')) {
    idToken = req.headers.authorization.split('bearer ')[1];
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const token = await admin.auth().verifyIdToken(idToken);

    if (token.pairistValidEmail === true && token.email_verified === true) {
      res.locals.userId = token.uid;
      next();
    } else {
      res.send(403).send('Unverified');
    }
    return;
  } catch (error) {
    res.status(403).send('Unauthorized');
    return;
  }
}

export async function validateTeamMembership(
  teamId: string,
  userId: string
): Promise<{
  teamDoc: admin.firestore.DocumentReference;
  membersData: admin.firestore.DocumentData;
}> {
  if (typeof teamId !== 'string' || teamId.length === 0) {
    throw new Error('Invalid team');
  }

  const teamDoc = db.collection('teams').doc(teamId);
  const teamSnapshot = await teamDoc.get();

  if (!teamSnapshot.exists) {
    throw new Error('Invalid team');
  }

  const membersDoc = await db.collection('teamMembers').doc(teamId).get();
  const membersData = membersDoc.data() || {};

  if (!membersData.hasOwnProperty(userId)) {
    throw new Error('Invalid team');
  }

  return { teamDoc, membersData };
}

export async function getDocs(ref: admin.firestore.CollectionReference) {
  const snapshot = await ref.get();
  const docsById: any = {};

  for (const doc of snapshot.docs) {
    docsById[doc.id] = doc.data();
  }

  return docsById;
}
