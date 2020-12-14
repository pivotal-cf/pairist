import { css } from 'astroturf';
import { ReactNode } from 'react';

interface Props {
  error?: string;
  children: ReactNode;
}

export default function ModalFooter(props: Props) {
  return (
    <footer className={styles.footer}>
      {props.error && (
        <div className={styles.error} role="alert">
          {props.error}
        </div>
      )}
      <div className={styles.buttons}>{props.children}</div>
    </footer>
  );
}

const styles = css`
  @import '../variables.scss';

  .footer {
    padding: $unit-2;
    padding-top: 0;

    button + button {
      margin-left: 8px;
    }
  }

  .error {
    border-radius: $unit-half;
    background: transparentize($color-danger, 0.9);
    padding: $unit;
    color: $color-danger;
    margin-bottom: $unit-2;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
  }
`;
