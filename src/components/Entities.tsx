import { css } from 'astroturf';
import { DragEvent } from 'react';
import { Plus } from 'react-feather';
import * as personActions from '../actions/person';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
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
      <div className={styles.transparencyBar} />
      <section className={styles.entitySection}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Tracks</h1>
          <IconButton
            label="New track"
            icon={<Plus />}
            headerButton={true}
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

      <section className={styles.entitySection}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Roles</h1>
          <IconButton
            label="New role"
            icon={<Plus />}
            headerButton={true}
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

      <section className={styles.entitySection}>
        <header className={styles.header}>
          <h1 className={styles.heading}>People</h1>
          <IconButton
            label="Invite person"
            icon={<Plus />}
            headerButton={true}
            onClick={() => setModalContent(<AddTeamMember />)}
          />
        </header>

        <div className={styles.content}>
          {Object.keys(members).map((userId) => {
            const { laneId, isLocked } = peopleLocations[userId] || {};

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
    display: flex;
    margin: $unit-2 0;
    flex-direction: column;
    overflow-y: auto;

    @media screen and (max-width: $breakpoint) {
      height: initial;
      display: block;
    }
  }

  .entitySection {
    margin: 0 $unit-2 $unit-2 $unit-2;
    background-color: $color-light;
    border: 1px solid $color-border;
    border-radius: 6px;
    box-shadow: 0 0 $unit 0 rgba(0, 0, 0, 0.2);
  }

  .header {
    flex: 0;
    display: flex;
    top: 0;
    position: -webkit-sticky;
    position: sticky;
    z-index: 2;
    padding: $unit;
    padding-left: $unit-2;
    align-items: center;
    border-radius: 6px 6px 0 0;
    justify-content: space-between;
    border-bottom: 1px solid $color-border;
    background-color: $color-secondary !important;
    color: $color-light;
  }

  .transparencyBar {
    z-index: 1;
    width: 100%;
    height: $unit;
    margin: 0 $unit;
    position: fixed;
    background-color: #f2f2f2;
  }

  .heading {
    margin: 0;
    width: 100%;
    height: 100%;
    font-size: inherit;
  }

  .content {
    padding: $unit;
  }
`;
