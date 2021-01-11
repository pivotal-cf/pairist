import { css } from 'astroturf';
import { pairistVersion } from '../config';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>Pairist v{pairistVersion}</div>
      <div>
        <a href="https://github.com/pivotal-cf/pairist" target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </div>
    </footer>
  );
}

const styles = css`
  @import '../variables.scss';

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $unit-2;
    font-size: 0.8em;
    width: 100%;
  }
`;
