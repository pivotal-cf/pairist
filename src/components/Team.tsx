import { css } from 'astroturf';
import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { RouteParams } from '../types';
import Entities from './Entities';
import Lists from './Lists';
import Pairs from './Pairs';

export default function Team() {
  const { teamId } = useParams<RouteParams>();

  if (!teamId) {
    return <Redirect to="/teams" />;
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
