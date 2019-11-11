import { db, fieldValue } from '../firebase';
import { ListItemData } from '../types';

const teamsRef = db.collection('teams');

export async function createListItem(teamId: string, listId: string, item: Partial<ListItemData>) {
  await teamsRef.doc(teamId).collection('lists').doc(listId).collection('items').add({
    created: fieldValue.serverTimestamp(),
    text: item.text,
    order: item.order,
    reactions: {},
  });
}

export async function updateListItem(teamId: string, listId: string, item: Partial<ListItemData>) {
  await teamsRef
    .doc(teamId)
    .collection('lists')
    .doc(listId)
    .collection('items')
    .doc(item.itemId)
    .update({
      text: item.text,
    });
}

export async function deleteListItem(teamId: string, listId: string, itemId: string) {
  await teamsRef
    .doc(teamId)
    .collection('lists')
    .doc(listId)
    .collection('items')
    .doc(itemId)
    .delete();
}
