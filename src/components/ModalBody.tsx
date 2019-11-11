import { css } from 'astroturf';
import React from 'react';
import { cn } from '../helpers';

interface Props {
  row?: boolean;
  children: React.ReactNode;
}

export default function ModalBody(props: Props) {
  return <main className={cn(styles.main, props.row && styles.row)}>{props.children}</main>;
}

const styles = css`
  @import '../variables.scss';

  .main {
    padding: $unit-2;
    display: flex;
    flex-direction: column;

    &.row {
      flex-direction: row;
    }
  }
`;
