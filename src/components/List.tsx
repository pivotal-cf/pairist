import { css } from 'astroturf';
import { FC, FormEvent, memo, useCallback, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { ArrowDown, ArrowUp, Trash2 } from 'react-feather';
import { useParams } from 'react-router';
import * as listActions from '../actions/list';
import * as listItemActions from '../actions/list-item';
import { db } from '../firebase';
import { cn } from '../helpers';
import { ListItemData, useListItems } from '../hooks/useListItems';
import { useModal } from '../hooks/useModal';
import { RouteParams } from '../types';
import ConfirmDelete from './ConfirmDelete';
import Editable from './Editable';
import IconButton from './IconButton';
import ListItem from './ListItem';
import Textarea from './Textarea';

interface Props {
  listId: string;
  title: string;
  index: number;
  moveDown: (index: number) => any;
  moveUp: (index: number) => any;
}

const ListItems: FC<{
  listId: string;
  items: ListItemData[];
  deleteItem: (itemId: string) => void;
}> = memo((props) => {
  return (
    <>
      {props.items.map((item, index) => (
        <Draggable key={item.itemId} draggableId={item.itemId} index={index}>
          {(draggableProvided, draggableSnapshot) => (
            <li
              className={cn(styles.item, draggableSnapshot.isDragging && styles.dragging)}
              ref={draggableProvided.innerRef}
              {...draggableProvided.draggableProps}
            >
              <ListItem
                listId={props.listId}
                itemId={item.itemId}
                text={item.text}
                checked={item.checked}
                reactions={item.reactions}
                deleteItem={props.deleteItem}
                dragHandleProps={draggableProvided.dragHandleProps}
              />
            </li>
          )}
        </Draggable>
      ))}
    </>
  );
});

export default function List(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();
  const items = useListItems(props.listId);
  const [newItemText, setNewItemText] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [, setModalContent] = useModal();

  function deleteList() {
    setModalContent(
      <ConfirmDelete
        action={`delete list ${props.title}`}
        onConfirm={() => listActions.deleteList(teamId, props.listId)}
      />
    );
  }

  async function addNewItem(evt?: FormEvent) {
    evt && evt.preventDefault();
    const text = newItemText;
    setNewItemText('');

    await listItemActions.createListItem(teamId, props.listId, {
      text,
      order: Date.now(),
    });
  }

  function updateList(newTitle: string) {
    listActions.updateList(teamId, {
      listId: props.listId,
      title: newTitle,
    });
  }

  const deleteItem = useCallback(
    (itemId: string) => {
      listItemActions.deleteListItem(teamId, props.listId, itemId);
    },
    [teamId, props.listId]
  );

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    if (!items.length) return;

    const { index: sourceIndex } = result.source;
    const { index: targetIndex } = result.destination;

    const newItems = [...items];
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    const batch = db.batch();

    newItems.forEach((item, newIndex) => {
      batch.set(
        db
          .collection('teams')
          .doc(teamId)
          .collection('lists')
          .doc(props.listId)
          .collection('items')
          .doc(item.itemId),
        { order: newIndex },
        { merge: true }
      );
    });

    batch.commit();
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>
        <div className={styles.itemWrapper}>
          <Editable
            value={props.title}
            onChange={(evt) => updateList(evt.target.value)}
            placeholder="Set list title..."
          />
        </div>
        <IconButton
          label="Move list down"
          icon={<ArrowDown />}
          onClick={() => props.moveDown(props.index)}
        />
        <IconButton
          label="Move list up"
          icon={<ArrowUp />}
          onClick={() => props.moveUp(props.index)}
        />
        <IconButton label="Delete list" icon={<Trash2 />} onClick={deleteList} />
      </h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={props.listId}>
          {(droppableProvided) => (
            <ul className={styles.list} ref={droppableProvided.innerRef}>
              {items.length > 0 && (
                <ListItems listId={props.listId} items={items} deleteItem={deleteItem} />
              )}
              {droppableProvided.placeholder}
              <li className={styles.inputItem}>
                <form onSubmit={addNewItem} ref={formRef}>
                  <Textarea
                    placeholder="Add an item..."
                    value={newItemText}
                    onChange={(evt) => setNewItemText(evt.target.value)}
                    onEnter={addNewItem}
                  />
                </form>
              </li>
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .wrapper {
    background: var(--color-theme);

    + .wrapper {
      border-top: 2px solid var(--color-border);
    }
  }

  .title {
    top: 0;
    margin: 0;
    z-index: 1;
    width: 100%;
    position: sticky;
    padding: $unit;
    font-size: inherit;
    display: flex;
    align-items: center;
    background-color: var(--color-theme);
    box-shadow: 0 2px 4px 0px rgba(var(--color-box-shadow), 0.1);
  }

  .list {
    padding: 0;
    margin: 0;
    background: var(--color-border);
  }

  .item {
    background: var(--color-theme);
    list-style-type: none;
    padding: $unit;
    display: flex;
    align-items: center;

    &.dragging {
      box-shadow: 0 4px 8px 0px rgba(var(--color-box-shadow), 0.2);
    }
  }

  .inputItem {
    background: var(--color-theme);
    list-style-type: none;
    padding: $unit;

    textarea {
      color: var(--color-text);
    }
  }

  .itemWrapper {
    flex: 1;
  }
`;
