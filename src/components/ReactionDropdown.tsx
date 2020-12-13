import { Smile } from 'react-feather';
import Dropdown from './Dropdown';
import DropdownItem from './DropdownItem';
import IconButton from './IconButton';

interface Props {}

export default function ReactionDropdown(props: Props) {
  return (
    <Dropdown align="right" trigger={<IconButton label="Add reaction" icon={<Smile />} />}>
      <DropdownItem>one</DropdownItem>
      <DropdownItem>two</DropdownItem>
    </Dropdown>
  );
}
