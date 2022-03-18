import { css } from 'astroturf';
import { Shuffle } from 'react-feather';
import { useParams } from 'react-router-dom';
import * as pairingActions from '../actions/pairing';
import { useLanes } from '../hooks/useLanes';
import { useNotification } from '../hooks/useNotification';
import { usePeople } from '../hooks/usePeople';
import { useRoles } from '../hooks/useRoles';
import { useTeamHistories } from '../hooks/useTeamHistories';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTracks } from '../hooks/useTracks';
import { RoleData, RouteParams, TrackData } from '../types';
import CreateLane from './CreateLane';
import IconButton from './IconButton';
import Lane from './Lane';

export default function Pairs() {
  const { teamId = '-' } = useParams<RouteParams>();
  const lanes = useLanes();
  const tracks = useTracks();
  const roles = useRoles();
  const people = usePeople();
  const members = useTeamMembers();
  const teamHistory = useTeamHistories();
  const [, setNotification] = useNotification();

  const tracksByLaneId: { [id: string]: TrackData[] } = {};
  const rolesByLaneId: { [id: string]: RoleData[] } = {};
  const peopleByLaneId: { [id: string]: any[] } = {};

  for (const track of tracks) {
    const { laneId } = track;
    if (!laneId) continue;

    tracksByLaneId[laneId] = tracksByLaneId[laneId] || [];
    tracksByLaneId[laneId].push(track);
  }

  for (const role of roles) {
    const { laneId } = role;
    if (!laneId) continue;

    rolesByLaneId[laneId] = rolesByLaneId[laneId] || [];
    rolesByLaneId[laneId].push(role);
  }

  for (const person of people) {
    const { laneId, userId } = person;
    if (!laneId) continue;

    const memberData = members[userId];
    if (!memberData) continue;

    peopleByLaneId[laneId] = peopleByLaneId[laneId] || [];
    peopleByLaneId[laneId].push({
      userId,
      displayName: memberData.displayName,
      photoURL: memberData.photoURL,
    });
  }

  function recommendPairs() {
    const madeRecommendation = pairingActions.getRecommendations(
      teamId,
      {
        tracks: tracks.reduce(
          (acc, track) => ({
            ...acc,
            [track.trackId]: { laneId: track.laneId },
          }),
          {}
        ),
        roles: roles.reduce(
          (acc, role) => ({
            ...acc,
            [role.roleId]: { laneId: role.laneId },
          }),
          {}
        ),
        people: people.reduce(
          (acc, person) => ({
            ...acc,
            [person.userId]: { laneId: person.laneId, isLocked: person.isLocked },
          }),
          {}
        ),
        lanes: lanes.reduce(
          (acc, lane) => ({
            ...acc,
            [lane.laneId]: { isLocked: lane.isLocked },
          }),
          {}
        ),
      },
      teamHistory
    );

    if (!madeRecommendation) {
      setNotification('Failed to make a recommendation. Do you have too many lanes?');
    }
  }

  return (
    <section className={styles.pairs}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pairs</h1>
        <IconButton label="Recommend pairs" icon={<Shuffle />} headerButton={true} onClick={recommendPairs} />
      </header>

      <div className={styles.lanes}>
        {lanes.map((lane) => (
          <Lane
            key={lane.laneId}
            teamId={teamId}
            laneId={lane.laneId}
            isLocked={lane.isLocked}
            people={peopleByLaneId[lane.laneId] || []}
            roles={rolesByLaneId[lane.laneId] || []}
            tracks={tracksByLaneId[lane.laneId] || []}
          />
        ))}

        <CreateLane />
      </div>
    </section>
  );
}

const styles = css`
  @import '../variables.scss';

  .pairs {
    flex: 1;
    display: flex;
    margin: $unit-2 0;
    padding-bottom: $unit-2;
    flex-direction: column;
    background-color: var(--color-theme);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    box-shadow: 0 0 $unit 0 rgba(var(--color-box-shadow), 0.2);
    max-width: 33%;

    @media screen and (max-width: $breakpoint) {
      order: 99;
      max-width: 100%;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $unit;
    padding-left: $unit-2;
    border-radius: 6px 6px 0 0;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-secondary) !important;
    color: white;
    flex: 0;
  }

  .heading {
    margin: 0;
    font-size: inherit;
  }

  .lanes {
    overflow-y: auto;
    flex: 1;
  }
`;
