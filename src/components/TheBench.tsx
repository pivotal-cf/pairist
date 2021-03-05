import { css } from 'astroturf';
import { DragEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePeople } from '../hooks/usePeople';
import { useTeamMembers } from '../hooks/useTeamMembers';
import * as personActions from '../actions/person';
import { cn } from '../helpers';
import { RouteParams } from '../types';
import Person from './Person';

interface Props {
  theBench?: boolean,
  benchwarmers: string[];
}

export default function TheBench(props: Props) {
  const { theBench, benchwarmers } = props;
  const { teamId = '-' } = useParams<RouteParams>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const members = useTeamMembers();
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

    switch (entityType) {
      case 'person': {
        theBench
          ? personActions.lockPerson(teamId, entityId)
          : personActions.unlockPerson(teamId, entityId);
        break;
      }
    }
  }

  return (
    <div
      className={cn(styles.theBench, isDraggingOver && styles.isDraggingOver)}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {benchwarmers.map((userId) => {
        const { isLocked } = peopleLocations[userId] || {};
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
  );
}

const styles = css`
  @import '../variables.scss';

  .theBench {
    min-height: 100px;

    &.isDraggingOver {
      background: var(--color-border);
    }
  }
`;
