import { ChevronDown, Lock, LogOut, User } from 'react-feather';
import { useHistory } from 'react-router-dom';
import * as userActions from '../actions/user';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import Dropdown from './Dropdown';
import DropdownItem from './DropdownItem';
import EditProfile from './EditProfile';
import ResetPasswordDialog from './ResetPasswordDialog';
import HeaderButton from './HeaderButton';

export default function UserDropdown() {
  const session = useSession();
  const history = useHistory();
  const [, setModalContent] = useModal();

  if (!session.loaded) {
    return <HeaderButton disabled content="Loading..." />;
  }

  if (!session.userId) {
    return null;
  }

  const displayName = session.displayName || session.email || '';
  const imageURL = session.photoURL || '';
  const imageHash = session.userId || '';

  async function logOut() {
    await userActions.logOut();
    history.push('/');
  }

  return (
    <Dropdown
      align="right"
      trigger={
        <HeaderButton
          icon={<ChevronDown />}
          content={displayName}
          imageURL={imageURL}
          imageHash={imageHash}
        />
      }
    >
      <DropdownItem leftIcon={<User />} onClick={() => setModalContent(<EditProfile />)}>
        Edit profile
      </DropdownItem>
      <DropdownItem
        leftIcon={<Lock />}
        onClick={() => setModalContent(<ResetPasswordDialog />)}
      >
        Reset password
      </DropdownItem>
      <DropdownItem leftIcon={<LogOut />} onClick={logOut}>
        Log out
      </DropdownItem>
    </Dropdown>
  );
}
