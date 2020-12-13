import { css } from 'astroturf';
import { memo, useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { Move, Smile, Trash } from 'react-feather';
import { useParams } from 'react-router';
import * as listItemActions from '../actions/list-item';
import { RouteParams } from '../types';
import { emojis } from '../emojis';
import Editable from './Editable';
import EmojiMenu from './EmojiMenu';
import IconButton from './IconButton';
import { fieldValue } from '../firebase';

interface Props {
  listId: string;
  itemId: string;
  text: string;
  reactions: { [name: string]: { count: number; timestamp: number } };
  deleteItem: (id: string) => any;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
}

export default memo(function ListItem(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();
  const [emojisExpanded, setEmojisExpanded] = useState(false);

  function updateItemText(newText: string) {
    listItemActions.updateListItem(teamId, props.listId, props.itemId, {
      text: newText,
    });
  }

  function updateItemReactions(emojiName: string, incrementBy: number) {
    const previous = (props.reactions as any)[emojiName] || {};
    const newCount = (previous.count || 0) + incrementBy;

    listItemActions.updateListItem(teamId, props.listId, props.itemId, {
      reactions: {
        ...props.reactions,
        [emojiName]:
          newCount < 1
            ? fieldValue.delete()
            : {
                timestamp: previous.timestamp || Date.now(),
                count: newCount,
              },
      },
    });
  }

  const emojisButtons = Object.keys(props.reactions)
    .sort((a, b) => props.reactions[a].timestamp - props.reactions[b].timestamp)
    .map((emojiName) => {
      if (props.reactions[emojiName].count < 1) return null;

      return (
        <button
          key={emojiName}
          className={styles.emojiDisplay}
          title={`${emojiName}: click to remove`}
          aria-label={emojiName}
          onClick={() => updateItemReactions(emojiName, -1)}
        >
          {emojis[emojiName]}
        </button>
      );
    });

  return (
    <>
      <div className={styles.dragIcon} {...props.dragHandleProps}>
        <Move />
      </div>

      <div className={styles.itemWrapper}>
        <Editable
          markdown
          value={props.text}
          onChange={(evt) => updateItemText(evt.target.value)}
        />
      </div>

      <div className={styles.emojisWrapper}>{emojisButtons}</div>

      <div style={{ position: 'relative', overflow: 'visible' }}>
        <IconButton
          label="Add emoji reaction"
          icon={<Smile />}
          onClick={() => setEmojisExpanded(true)}
        />

        {emojisExpanded ? (
          <EmojiMenu
            onSelect={(name) => {
              name && updateItemReactions(name, 1);
              setEmojisExpanded(false);
            }}
          />
        ) : null}
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

  .emojisWrapper {
    max-width: 20%;
    text-align: right;
  }

  .emojiDisplay {
    background: none;
    border: none;
    cursor: pointer;
    border-radius: $unit-half;
    font-size: inherit;

    &:hover,
    &:focus {
      background: rgba(0, 0, 0, 0.1);
    }
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
