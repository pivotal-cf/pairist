import { css } from 'astroturf';
import { useEffect } from 'react';
import { Check, ChevronDown, Plus, Settings } from 'react-feather';
import { useMemberTeams } from '../hooks/useMemberTeams';
import { useModal } from '../hooks/useModal';
import { useTeamSettings } from '../hooks/useTeamSettings';
import { CreateTeam } from './CreateTeam';
import Dropdown from './Dropdown';
import DropdownGroup from './DropdownGroup';
import DropdownItem from './DropdownItem';
import EditTeam from './EditTeam';
import HeaderButton from './HeaderButton';

interface Props {
  teamId?: string;
}

export default function TeamDropdown(props: Props) {
  const { teamId } = props;
  const [, setModalContent] = useModal();
  const memberTeams = useMemberTeams();
  const { teamSettings } = useTeamSettings();
  const currentTeamName = teamSettings.teamName;

  useEffect(() => {
    document.title = currentTeamName ? `${currentTeamName} | Pairist` : 'Pairist';
  }, [currentTeamName]);

  const teams = [];

  for (const memberTeamId in memberTeams) {
    let teamName = memberTeams[memberTeamId];

    let icon = <span className={styles.spacer} />;
    if (memberTeamId === teamId) {
      icon = <Check />;
      teamName = currentTeamName || teamName;
    }

    teams.push(
      <DropdownItem key={memberTeamId} href={`/teams/${memberTeamId}`} leftIcon={icon}>
        {teamName}
      </DropdownItem>
    );
  }

  if (!teams.length || !teamId) {
    return (
      <Dropdown trigger={<HeaderButton bold icon={<ChevronDown />} content="No team selected" />}>
        <DropdownItem leftIcon={<Plus />} onClick={() => setModalContent(<CreateTeam />)}>
          Create new team
        </DropdownItem>
        {teams.length > 0 && <DropdownGroup name="My teams">{teams}</DropdownGroup>}
      </Dropdown>
    );
  }

  let buttonContent;
  if (currentTeamName) {
    buttonContent = <span>{currentTeamName}</span>;
  } else {
    buttonContent = <span>Loading...</span>;
  }

  return (
    <Dropdown trigger={<HeaderButton bold icon={<ChevronDown />} content={buttonContent} />}>
      <DropdownItem
        leftIcon={<Settings />}
        onClick={() => setModalContent(<EditTeam teamId={teamId} />)}
      >
        Edit team settings
      </DropdownItem>
      <DropdownItem leftIcon={<Plus />} onClick={() => setModalContent(<CreateTeam />)}>
        Create new team
      </DropdownItem>
      <DropdownGroup name="My teams">{teams}</DropdownGroup>
    </Dropdown>
  );
}

const styles = css`
  @import '../variables.scss';

  .spacer {
    display: inline-block;
    width: 0.8em;
    height: 0.8em;
  }
`;
