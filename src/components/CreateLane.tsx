import { css } from 'astroturf';
import { DragEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as laneActions from '../actions/lane';
import * as personActions from '../actions/person';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
import { cn } from '../helpers';
import { RouteParams } from '../types';

interface Props {}

export default function CreateLane(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function onDragEnter() {
    setIsDraggingOver(true);
  }

  function onDragOver(evt: DragEvent<HTMLDivElement>) {
    evt.preventDefault();
  }

  function onDragLeave() {
    setIsDraggingOver(false);
  }

  async function onDrop(evt: DragEvent<HTMLDivElement>) {
    setIsDraggingOver(false);

    const entityType = evt.dataTransfer.getData('entityType');
    const entityId = evt.dataTransfer.getData('entityId');
    if (!entityType || !entityId) return;

    const laneId = await laneActions.createLane(teamId);

    switch (entityType) {
      case 'person': {
        personActions.movePersonToLane(teamId, entityId, laneId);
        break;
      }

      case 'role': {
        roleActions.moveRoleToLane(teamId, entityId, laneId);
        break;
      }

      case 'track': {
        trackActions.moveTrackToLane(teamId, entityId, laneId);
        break;
      }
    }
  }

  return (
    <div
      className={cn(styles.createLane, isDraggingOver && styles.isDraggingOver)}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDraggingOver && <div>Add lane</div>}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .createLane {
    min-height: 100px;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    &.isDraggingOver {
      background: $color-border;
    }
  }
`;
