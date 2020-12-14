import { css } from 'astroturf';
import { Plus } from 'react-feather';
import { useMemberTeams } from '../hooks/useMemberTeams';
import { useModal } from '../hooks/useModal';
import Button from './Button';
import { CreateTeam } from './CreateTeam';

interface Props {}

export default function ChooseTeam(props: Props) {
  const [, setModalContent] = useModal();
  const memberTeams = useMemberTeams();

  const teams = [];

  for (const teamId in memberTeams) {
    const teamName = memberTeams[teamId];

    teams.push(
      <li key={teamId}>
        <Button href={`/teams/${teamId}`}>{teamName}</Button>
      </li>
    );
  }

  return (
    <div className={styles.chooseTeam}>
      <h3>My teams</h3>

      {teams.length > 0 && <ul className={styles.teamList}>{teams}</ul>}

      <Button
        bold
        flavor="confirm"
        onClick={() => setModalContent(<CreateTeam />)}
        leftIcon={<Plus />}
      >
        Create a new team
      </Button>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .chooseTeam {
    width: 320px;
    margin: 30vh auto;
    text-align: center;
  }

  .teamList {
    margin: 0;
    padding: 0;

    li {
      margin: 0;
      margin-bottom: $unit-2;
      list-style-type: none;
    }
  }
`;
