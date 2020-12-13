import { css } from 'astroturf';
import { DragEvent } from 'react';
import { Plus } from 'react-feather';
import * as personActions from '../actions/person';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
import { cn } from '../helpers';
import { useModal } from '../hooks/useModal';
import { usePeople } from '../hooks/usePeople';
import { useRoles } from '../hooks/useRoles';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTracks } from '../hooks/useTracks';
import AddTeamMember from './AddTeamMember';
import CreateTrackOrRole from './CreateTrackOrRole';
import IconButton from './IconButton';
import Person from './Person';
import TrackChip from './TrackChip';

interface Props {
  teamId: string;
}

export default function Entities(props: Props) {
  const { teamId } = props;
  const [, setModalContent] = useModal();
  const members = useTeamMembers();
  const tracks = useTracks();
  const roles = useRoles();
  const people = usePeople();

  const peopleLocations: any = people.reduce(
    (acc, person) => ({
      ...acc,
      [person.userId]: {
        laneId: person.laneId,
        isLocked: person.isLocked,
      },
    }),
    {}
  );

  function onDragOver(evt: DragEvent<HTMLDivElement>) {
    evt.preventDefault();
  }

  function onDrop(evt: DragEvent<HTMLDivElement>) {
    const entityType = evt.dataTransfer.getData('entityType');
    const entityId = evt.dataTransfer.getData('entityId');
    if (!entityType || !entityId) return;

    switch (entityType) {
      case 'person': {
        personActions.movePersonToLane(teamId, entityId, '');
        break;
      }

      case 'role': {
        roleActions.moveRoleToLane(teamId, entityId, '');
        break;
      }

      case 'track': {
        trackActions.moveTrackToLane(teamId, entityId, '');
        break;
      }
    }
  }

  return (
    <div className={styles.entities} onDragOver={onDragOver} onDrop={onDrop}>
      <section>
        <header className={styles.header}>
          <h1 className={styles.heading}>Tracks</h1>
          <IconButton
            label="New track"
            icon={<Plus />}
            onClick={() => setModalContent(<CreateTrackOrRole mode="create" flavor="track" />)}
          />
        </header>

        <div className={styles.content}>
          {tracks.map((track) => {
            if (track.laneId) return null;

            return (
              <TrackChip
                key={track.trackId}
                entityId={track.trackId}
                flavor="track"
                name={track.name}
                emoji={track.emoji}
                color={track.color}
                draggable
                editable
              />
            );
          })}
        </div>
      </section>

      <section>
        <header className={cn(styles.header, styles.borderTop)}>
          <h1 className={styles.heading}>Roles</h1>
          <IconButton
            label="New role"
            icon={<Plus />}
            onClick={() => setModalContent(<CreateTrackOrRole mode="create" flavor="role" />)}
          />
        </header>

        <div className={styles.content}>
          {roles.map((role) => {
            if (role.laneId) return null;

            return (
              <TrackChip
                key={role.roleId}
                entityId={role.roleId}
                flavor="role"
                name={role.name}
                emoji={role.emoji}
                color={role.color}
                draggable
                editable
              />
            );
          })}
        </div>
      </section>

      <section>
        <header className={cn(styles.header, styles.borderTop)}>
          <h1 className={styles.heading}>People</h1>
          <IconButton
            label="Invite person"
            icon={<Plus />}
            onClick={() => setModalContent(<AddTeamMember />)}
          />
        </header>

        <div className={styles.content}>
          {Object.keys(members).map((userId) => {
            const { laneId, isLocked } = peopleLocations[userId];

            if (laneId) return null;

            const person = members[userId];

            return (
              <Person
                key={userId}
                userId={userId}
                displayName={person.displayName}
                photoURL={person.photoURL}
                teamId={teamId}
                isLocked={isLocked}
                draggable
                editable
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .entities {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid $color-border;

    @media screen and (max-width: $breakpoint) {
      height: initial;
      display: block;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $unit;
    padding-left: $unit-2;
    border-bottom: 1px solid $color-border;
    flex: 0;
  }

  .borderTop {
    border-top: 1px solid $color-border;
  }

  .heading {
    margin: 0;
    font-size: inherit;
  }

  .content {
    padding: $unit;
  }
`;
