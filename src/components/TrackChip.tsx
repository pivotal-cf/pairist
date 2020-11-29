import { css } from 'astroturf';
import React from 'react';
import { Edit2 } from 'react-feather';
import { emojis } from '../emojis';
import { cn } from '../helpers';
import { useModal } from '../hooks/useModal';
import CreateTrackOrRole from './CreateTrackOrRole';
import IconButton from './IconButton';

interface Props {
  entityId: string;
  draggable?: boolean;
  flavor: 'track' | 'role';
  emoji?: string;
  name: string;
  color: string;
  editable?: boolean;
}

export default function TrackChip(props: Props) {
  const [, setModalContent] = useModal();

  function onDragStart(evt: React.DragEvent<HTMLDivElement>) {
    evt.dataTransfer.setData('entityType', props.flavor);
    evt.dataTransfer.setData('entityId', props.entityId);
  }

  if (!styles[`color-${props.color}`]) {
    return null;
  }

  return (
    <div
      className={cn(
        styles.chip,
        styles[props.flavor],
        styles.draggable,
        styles[`color-${props.color}`]
      )}
      draggable={props.draggable}
      onDragStart={onDragStart}
    >
      {props.emoji && <span className={styles.emoji}>{emojis[props.emoji]}</span>}
      <span className={styles.name}>{props.name}</span>
      {props.editable && (
        <div className={styles.editButton}>
          <IconButton
            className={styles.editButton}
            label={`edit ${props.flavor}`}
            icon={<Edit2 />}
            onClick={() =>
              setModalContent(
                <CreateTrackOrRole
                  mode="edit"
                  flavor={props.flavor}
                  entityId={props.entityId}
                  initialName={props.name}
                  initialColor={props.color}
                  initialEmoji={props.emoji}
                />
              )
            }
          />
        </div>
      )}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .chip {
    display: inline-flex;
    align-items: center;
    position: relative;
    user-select: none;
    margin: $unit-half;

    &[draggable='true'] {
      cursor: move;
    }

    &:hover {
      .editButton {
        display: initial;
      }
    }
  }

  .editButton {
    display: none;
    position: absolute;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.6);
    right: 2px;
    top: 50%;
    transform: translateY(-50%);

    &:hover,
    &:focus {
      background: rgba(255, 255, 255, 0.9);
    }
  }

  .track {
    padding: $unit;
    border-radius: 0;
  }

  .role {
    padding: $unit ($unit * 1.5);
    border-radius: 9999px;
  }

  .emoji {
    height: inherit;
    line-height: 1em;
    font-size: 1.4em;
    margin-right: $unit;
  }

  .color-red {
    background-color: #ee0000;
    color: #fff;
  }

  .color-teal {
    background-color: #00ddcc;
    color: #000;
  }

  .color-pink {
    background-color: #dd0099;
    color: #fff;
  }

  .color-purple {
    background-color: #770077;
    color: #fff;
  }

  .color-indigo {
    background-color: #5500ff;
    color: #fff;
  }

  .color-blue {
    background-color: #0077ee;
    color: #fff;
  }

  .color-navy {
    background-color: #000066;
    color: #fff;
  }

  .color-green {
    background-color: #009900;
    color: #fff;
  }

  .color-lime {
    background-color: #99ff00;
    color: #000;
  }

  .color-orange {
    background-color: #ee6600;
    color: #fff;
  }

  .color-yellow {
    background-color: #ffdd00;
    color: #000;
  }
`;
