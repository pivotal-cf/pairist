import { css } from 'astroturf';

interface Props {
  text: string;
}

export default function ModalHeader(props: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.heading}>{props.text}</h1>
    </header>
  );
}

const styles = css`
  @import '../variables.scss';

  .header {
    background: var(--color-primary);
    color: var(--color-tertiary);
    border-top-left-radius: $unit-half;
    border-top-right-radius: $unit-half;
    padding: $unit-2;
  }

  .heading {
    margin: 0;
    font-size: inherit;
  }
`;
