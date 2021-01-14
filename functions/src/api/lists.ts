import * as admin from 'firebase-admin';
import * as express from 'express';
import { getDocs, validateTeamMembership } from '../helpers';

interface ListsResponse {
  lists: ListResponse[];
}

interface ListResponse {
  title: string;
  order: number;
  items: {
    text: string;
    order: number;
    reactions: {
      [emoji: string]: number;
    };
  }[];
}

export async function listsEndpoint(req: express.Request, res: express.Response) {
  const { teamId } = req.params;
  const { userId } = res.locals;

  let teamDoc;
  try {
    ({ teamDoc } = await validateTeamMembership(teamId, userId));
  } catch (err) {
    res.status(400).send(err.message);
    return;
  }

  console.log(`Fetching lists for team ${teamId}`);

  const result = await getCurrentLists(teamDoc);

  res.json(result);
}

async function getCurrentLists(teamDoc: admin.firestore.DocumentReference): Promise<ListsResponse> {
  const lists = await getDocs(teamDoc.collection('lists'));

  const promises = [];

  for (const listId in lists) {
    const { title, order } = lists[listId];

    promises.push(getList(teamDoc, listId, title, order));
  }

  return {
    lists: await Promise.all(promises),
  };
}

async function getList(
  teamDoc: admin.firestore.DocumentReference,
  listId: string,
  listTitle: string,
  order: number
): Promise<ListResponse> {
  const itemsCollection = teamDoc.collection('lists').doc(listId).collection('items');
  const itemsById = await getDocs(itemsCollection);

  const items = [];

  for (const itemId in itemsById) {
    const { text, order, reactions } = itemsById[itemId];

    items.push({ text, order, reactions });
  }

  return {
    title: listTitle,
    order,
    items,
  };
}
