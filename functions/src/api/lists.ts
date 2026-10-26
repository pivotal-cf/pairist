import type { DocumentReference } from 'firebase-admin/firestore';
import type { Request, Response } from 'express';
import { errorMessage, getDocs, validateTeamMembership } from '../helpers';

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

export async function listsEndpoint(req: Request, res: Response) {
  const teamId = String(req.params.teamId);
  const { userId } = res.locals;

  let teamDoc;
  try {
    ({ teamDoc } = await validateTeamMembership(teamId, userId));
  } catch (err) {
    res.status(400).send(errorMessage(err));
    return;
  }

  console.log(`Fetching lists for team ${teamId}`);

  const result = await getCurrentLists(teamDoc);

  res.json(result);
}

async function getCurrentLists(teamDoc: DocumentReference): Promise<ListsResponse> {
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
  teamDoc: DocumentReference,
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
