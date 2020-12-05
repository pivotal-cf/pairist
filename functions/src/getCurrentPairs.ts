import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

export const current = functions.https.onRequest(async (request, response) => {
  if (request.method !== 'GET') {
    response.status(405).send('Method not allowed');
    return;
  }

  const pairistApiKey = request.headers['x-pairist-team-api-key'];

  if (typeof pairistApiKey !== 'string') {
    response.status(401).send('Invalid team API key');
    return;
  }

  const teamId = request.query['team'];

  if (typeof teamId !== 'string') {
    response.status(400).send('Invalid team');
    return;
  }

  const teamDoc = db.collection('teams').doc(teamId);
  const teamSnapshot = await teamDoc.get();

  if (!teamSnapshot.exists) {
    response.status(404).send('Team not found');
    return;
  }

  const teamData = teamSnapshot.data() || {};
  const validApiKeys = teamData.apiKeys || {};

  if (!validApiKeys.hasOwnProperty(pairistApiKey)) {
    response.status(401).send('Invalid team API key');
    return;
  }

  console.log(`Using valid API key for team ${teamId}`);

  const membersDoc = db.collection('teamMembers').doc(teamId);
  const membersData = (await membersDoc.get()).data() || {};

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

  response.json({
    pairs: Object.values(pairsByLaneId),
  });
});

async function getDocs(ref: admin.firestore.CollectionReference) {
  const snapshot = await ref.get();
  const docsById: any = {};

  for (const doc of snapshot.docs) {
    docsById[doc.id] = doc.data();
  }

  return docsById;
}
