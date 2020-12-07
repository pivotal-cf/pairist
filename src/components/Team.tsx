import { css } from 'astroturf';
import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { useTeamSettings } from '../hooks/useTeamSettings';
import { RouteParams } from '../types';
import Entities from './Entities';
import Lists from './Lists';
import Pairs from './Pairs';

export default function Team() {
  const { teamId } = useParams<RouteParams>();
  const { loading, error } = useTeamSettings();
  const [, setNotification] = useNotification();

  if (!teamId) {
    return <Redirect to="/" />;
  }

  if (!loading && error) {
    setTimeout(
      () => setNotification('This team does not exist or you are not a member of it.'),
      10
    );
    return <Redirect to="/" />;
  }

  return (
    <div className={styles.team}>
      <Lists />
      <Pairs />
      <Entities teamId={teamId} />
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .team {
    display: flex;
    height: calc(100% - 50px);

    @media screen and (max-width: $breakpoint) {
      height: initial;
      flex-direction: column-reverse;
    }
  }
`;
