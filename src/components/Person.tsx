import { css } from 'astroturf';
import React from 'react';
import { cn } from '../helpers';

interface Props {
  userId: string;
  displayName: string;
  photoURL: string;
  draggable: boolean;
}

export default function Person(props: Props) {
  const name = props.displayName || '(no display name)';

  function onDragStart(evt: React.DragEvent<HTMLDivElement>) {
    evt.dataTransfer.setData('entityType', 'person');
    evt.dataTransfer.setData('entityId', props.userId);
  }

  return (
    <div className={cn(styles.person)} draggable={props.draggable} onDragStart={onDragStart}>
      <div className={styles.photo}>
        {props.photoURL ? (
          <img className={styles.img} src={props.photoURL} alt={name} draggable={false} />
        ) : (
          <svg className={styles.img} width="80" height="80" data-jdenticon-value={props.userId} />
        )}
      </div>
      <div className={styles.name}>{name}</div>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .person {
    background: $color-light;
    border: 1px solid $color-border;
    display: inline-flex;
    color: inherit;
    transition: background 0.1s ease-in-out;
    border-radius: $unit-half;
    font-size: inherit;
    align-items: center;
    margin: $unit;
    user-select: none;

    &[draggable='true'] {
      cursor: move;
    }
  }

  .photo {
    height: 3em;
  }

  .img {
    width: 3em;
    height: 3em;
    border-radius: $unit-half;
  }

  .name {
    padding: 0 $unit;
  }
`;
