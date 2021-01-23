import { css } from 'astroturf';
import { ReactNode } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

export default function DropdownGroup(props: Props) {
  return (
    <ul className={styles.group} aria-label={props.name}>
      <div className={styles.name}>{props.name}</div>
      {props.children}
    </ul>
  );
}

const styles = css`
  @import '../variables.scss';

  .group {
    padding: 0;
    margin: 0;
  }

  .name {
    font-weight: bold;
    color: var(--color-text);
    padding: $unit;
  }
`;
