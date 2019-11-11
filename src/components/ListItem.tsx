import { css } from 'astroturf';
import React from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { Move, Trash } from 'react-feather';
import { useParams } from 'react-router';
import * as listItemActions from '../actions/list-item';
import { RouteParams } from '../types';
import Editable from './Editable';
import IconButton from './IconButton';

interface Props {
  listId: string;
  itemId: string;
  text: string;
  reactions: { [name: string]: number };
  deleteItem: (id: string) => any;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
}

export default React.memo(function ListItem(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();

  function updateItem(newText: string) {
    listItemActions.updateListItem(teamId, props.listId, {
      itemId: props.itemId,
      text: newText,
    });
  }

  return (
    <>
      <div className={styles.dragIcon} {...props.dragHandleProps}>
        <Move />
      </div>
      <div className={styles.itemWrapper}>
        <Editable markdown value={props.text} onChange={(evt) => updateItem(evt.target.value)} />
      </div>
      <IconButton
        label="Delete item"
        icon={<Trash />}
        onClick={() => props.deleteItem(props.itemId)}
      />
    </>
  );
});

const styles = css`
  @import '../variables.scss';

  .itemWrapper {
    flex: 1;
  }

  .dragIcon {
    width: $unit-4;
    height: $unit-4;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      opacity: 0.6;
    }
  }
`;
