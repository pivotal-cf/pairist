import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

const db = admin.firestore();

// Inspired by this official Firebase sample:
// https://github.com/firebase/functions-samples/tree/master/authorized-https-endpoint

const app = express();

app.use(cors({ origin: true }));
app.use(validateFirebaseAuthentication);

app.get('/current/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { userId } = res.locals;

  if (typeof teamId !== 'string' || teamId.length === 0) {
    res.status(400).send('Invalid team');
    return;
  }

  const teamDoc = db.collection('teams').doc(teamId);
  const teamSnapshot = await teamDoc.get();

  if (!teamSnapshot.exists) {
    res.status(400).send('Invalid team');
    return;
  }

  const membersDoc = db.collection('teamMembers').doc(teamId);
  const membersData = (await membersDoc.get()).data() || {};

  if (!membersData.hasOwnProperty(userId)) {
    res.status(403).send('Not a member of this team');
    return;
  }

  console.log(`Fetching current pairs for team ${teamId}`);

  const pairs = await getCurrentPairs(membersData, teamDoc);

  res.json({ pairs });
});

export const api = functions.https.onRequest(app);

async function validateFirebaseAuthentication(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const token = await admin.auth().verifyIdToken(idToken);

    if (token.pairistValidEmail === true) {
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

async function getCurrentPairs(membersData: any, teamDoc: admin.firestore.DocumentReference) {
  const pairsByLaneId: any = {};

  const [tracks, roles, people, lanes] = await Promise.all([
    getDocs(teamDoc.collection('tracks')),
    getDocs(teamDoc.collection('roles')),
    getDocs(teamDoc.collection('people')),
    getDocs(teamDoc.collection('lanes')),
  ]);

  for (const laneId in lanes) {
    pairsByLaneId[laneId] = { roles: [], tracks: [], people: [] };
  }

  for (const roleId in roles) {
    const role = roles[roleId];

    if (pairsByLaneId.hasOwnProperty(role.laneId)) {
      pairsByLaneId[role.laneId].roles.push({
        id: roleId,
        name: role.name,
      });
    }
  }

  for (const trackId in tracks) {
    const track = tracks[trackId];

    if (pairsByLaneId.hasOwnProperty(track.laneId)) {
      pairsByLaneId[track.laneId].tracks.push({
        id: trackId,
        name: track.name,
      });
    }
  }

  for (const userId in people) {
    const person = people[userId];

    if (pairsByLaneId.hasOwnProperty(person.laneId)) {
      const displayName = (membersData[userId] || {}).displayName || '';

      pairsByLaneId[person.laneId].people.push({
        id: userId,
        displayName,
      });
    }
  }

  return Object.values(pairsByLaneId);
}

async function getDocs(ref: admin.firestore.CollectionReference) {
  const snapshot = await ref.get();
  const docsById: any = {};

  for (const doc of snapshot.docs) {
    docsById[doc.id] = doc.data();
  }

  return docsById;
}
