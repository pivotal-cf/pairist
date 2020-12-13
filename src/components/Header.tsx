import { css } from 'astroturf';
import { Link, useParams } from 'react-router-dom';
import logo from '../assets/pairist.svg';
import { useSession } from '../hooks/useSession';
import { RouteParams } from '../types';
import TeamDropdown from './TeamDropdown';
import UserDropdown from './UserDropdown';

export default function Header() {
  const { userId } = useSession();
  const { teamId } = useParams<RouteParams>();

  return (
    <header className={styles.header}>
      <div className={styles.spacerLeft}>{userId && <TeamDropdown teamId={teamId} />}</div>

      <Link to="/">
        <img className={styles.logo} src={logo} alt="Pairist logo" />
      </Link>

      <div className={styles.spacerRight}>{userId && <UserDropdown />}</div>
    </header>
  );
}

const styles = css`
  .header {
    color: white;
    background: #243640;
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    height: 50px;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    width: 24px;
    flex: 0;
  }

  .spacerLeft {
    flex: 1;
  }

  .spacerRight {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
`;
