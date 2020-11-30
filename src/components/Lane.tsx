import { css } from 'astroturf';
import React, { useState } from 'react';
import { Lock, Trash, Unlock } from 'react-feather';
import * as laneActions from '../actions/lane';
import * as personActions from '../actions/person';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
import { cn } from '../helpers';
import { RoleData, TrackData } from '../types';
import IconButton from './IconButton';
import Person from './Person';
import TrackChip from './TrackChip';

interface Props {
  teamId: string;
  laneId: string;
  isLocked: boolean;
  tracks: TrackData[];
  roles: RoleData[];
  people: any[];
}

export default function Lane(props: Props) {
  const { teamId, laneId, isLocked, tracks, roles, people } = props;
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function toggleLock() {
    if (isLocked) {
      laneActions.unlockLane(teamId, laneId);
    } else {
      laneActions.lockLane(teamId, laneId);
    }
  }

  async function clearLane() {
    for (const track of tracks) {
      trackActions.moveTrackToLane(teamId, track.trackId, '');
    }

    for (const role of roles) {
      roleActions.moveRoleToLane(teamId, role.roleId, '');
    }

    for (const person of people) {
      personActions.movePersonToLane(teamId, person.userId, '');
    }

    laneActions.deleteLane(teamId, laneId);
  }

  function onDragOver(evt: React.DragEvent<HTMLDivElement>) {
    if (isLocked) return;
    evt.preventDefault();
    setIsDraggingOver(true);
  }

  function onDragLeave() {
    setIsDraggingOver(false);
  }

  function onDrop(evt: React.DragEvent<HTMLDivElement>) {
    setIsDraggingOver(false);

    const entityType = evt.dataTransfer.getData('entityType');
    const entityId = evt.dataTransfer.getData('entityId');
    if (!entityType || !entityId) return;

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
      className={cn(styles.lane, isDraggingOver && styles.isDraggingOver)}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className={styles.entities}>
        <div className={styles.people}>
          {people.map((person) => (
            <Person
              key={person.userId}
              userId={person.userId}
              displayName={person.displayName}
              photoURL={person.photoURL}
              draggable={!isLocked}
            />
          ))}
        </div>
        <div className={styles.chips}>
          {tracks.map((track) => (
            <TrackChip
              key={track.trackId}
              entityId={track.trackId}
              flavor="track"
              name={track.name}
              emoji={track.emoji}
              color={track.color}
              draggable={!isLocked}
              editable
            />
          ))}
          {roles.map((role) => (
            <TrackChip
              key={role.roleId}
              entityId={role.roleId}
              flavor="role"
              name={role.name}
              emoji={role.emoji}
              color={role.color}
              draggable={!isLocked}
              editable
            />
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <IconButton
          icon={isLocked ? <Lock /> : <Unlock />}
          label={isLocked ? 'Unlock lane' : 'Lock lane'}
          onClick={toggleLock}
          dark={isLocked}
        />
        <IconButton icon={<Trash />} label="Clear lane" onClick={clearLane} />
      </div>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .lane {
    padding: $unit;
    display: flex;
    font-size: inherit;
    border-bottom: 1px solid $color-border;
    width: 100%;
    width: stretch;
    min-width: $unit * 30;
    align-items: center;

    &.isDraggingOver {
      background: $color-border;
    }
  }

  .entities {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
  }

  .people {
    flex-grow: 1;
  }

  .chips {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .buttons {
    display: flex;
    flex-direction: column;
  }
`;
