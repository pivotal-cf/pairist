import { css } from 'astroturf';
import { DragEvent } from 'react';
import { Edit2 } from 'react-feather';
import { emojis } from '../emojis';
import { cn, hexToRgb, rgbToHsl } from '../helpers';
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

function readableTextColor(bgHexColor: string) {
  const [r, g, b] = hexToRgb(bgHexColor);
  let [h, s, l] = rgbToHsl(+r, +g, +b);

  h = (h + 0.5) % 1;
  s = (s + 0.5) % 1;
  l = (l + 0.5) % 1;

  return `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
}

export default function TrackChip(props: Props) {
  const [, setModalContent] = useModal();

  function onDragStart(evt: DragEvent<HTMLDivElement>) {
    evt.dataTransfer.setData('entityType', props.flavor);
    evt.dataTransfer.setData('entityId', props.entityId);
  }

  return (
    <div
      className={cn(styles.chip, styles[props.flavor], styles.draggable)}
      style={{
        background: props.color,
        color: readableTextColor(props.color),
      }}
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
`;
