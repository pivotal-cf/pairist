import { css } from 'astroturf';
import { FormEvent, useState } from 'react';
import { Shuffle } from 'react-feather';
import { useParams } from 'react-router';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
import { colors } from '../colors';
import { emojiList } from '../emojis';
import { useModal } from '../hooks/useModal';
import { RouteParams } from '../types';
import Button from './Button';
import EmojiPicker from './EmojiPicker';
import FormField from './FormField';
import IconButton from './IconButton';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';
import Select from './Select';
import TrackChip from './TrackChip';

interface Props {
  flavor: 'track' | 'role';
  mode: 'create' | 'edit';
  newChip?: boolean;
  entityId?: string;
  initialName?: string;
  initialEmoji?: string;
  initialColor?: string;
}

function getRandomEmoji() {
  return emojiList[Math.floor(Math.random() * emojiList.length)][0];
}

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)].value;
}

export default function CreateTrackOrRole(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();
  const [, setModalContent] = useModal();
  const [name, setName] = useState(props.initialName || 'Untitled');
  const [emoji, setEmoji] = useState(props.initialEmoji || getRandomEmoji());
  const [color, setColor] = useState(props.initialColor || getRandomColor());
  const [error, setError] = useState('');
  const canSubmit = Boolean(!error);

  async function deleteTrackOrRole() {
    if (props.flavor === 'track') {
      await trackActions.deleteTrack(teamId, props.entityId || '');
    } else {
      await roleActions.deleteRole(teamId, props.entityId || '');
    }

    setModalContent(null);
  }

  function cancel() {
    setModalContent(null);
  }

  function randomize() {
    setEmoji(getRandomEmoji());
    setColor(getRandomColor());
  }

  async function save(evt?: FormEvent) {
    if (evt) evt.preventDefault();

    if (!name) {
      setError('Name cannot be empty.');
      return;
    }

    try {
      if (props.flavor === 'track') {
        if (props.mode === 'create') {
          await trackActions.createTrack(teamId, { name, color, emoji });
        } else {
          await trackActions.updateTrack(teamId, props.entityId || '', { name, color, emoji });
        }
      } else {
        if (props.mode === 'create') {
          await roleActions.createRole(teamId, { name, color, emoji });
        } else {
          await roleActions.updateRole(teamId, props.entityId || '', { name, color, emoji });
        }
      }

      setModalContent(null);
    } catch (err) {
      console.error(err);
      setError(`'Failed to create ${props.flavor}.'`);
    }
  }

  const headerVerb = props.mode === 'create' ? 'Create' : 'Edit';

  return (
    <form onSubmit={save}>
      <ModalHeader text={`${headerVerb} ${props.flavor}`} />

      <ModalBody>
        <FormField label="Name" grow>
          <Input
            id="create-edit-track-or-role-name"
            value={name}
            onChange={(evt) => {
              setName(evt.target.value);
              setError('');
            }}
          />
        </FormField>

        <div className={styles.formRow}>
          <FormField label="Emoji">
            <EmojiPicker selected={emoji} onSelect={(selected) => setEmoji(selected)} />
          </FormField>

          <FormField label="Color" grow>
            <Select
              id="create-edit-track-or-role-color"
              value={color}
              values={colors}
              onChange={(evt) => {
                setColor(evt.target.value);
              }}
            />
          </FormField>

          <FormField label="&nbsp;">
            <IconButton label="Randomize" icon={<Shuffle />} onClick={randomize} />
          </FormField>
        </div>

        <FormField label="Preview">
          <TrackChip
            name={name}
            color={color}
            emoji={emoji}
            flavor={props.flavor}
            entityId="preview"
            draggable={false}
          />
        </FormField>
      </ModalBody>

      <ModalFooter error={error}>
        {!props.newChip && <Button flavor="danger" bold onClick={deleteTrackOrRole}>
          Delete
        </Button>}
        <div style={{ flex: 1 }} />
        <Button onClick={cancel}>Cancel</Button>
        <Button disabled={!canSubmit} type="submit" bold flavor="confirm">
          Save
        </Button>
      </ModalFooter>
    </form>
  );
}

const styles = css`
  .emoji {
    line-height: 1em;
    font-size: inherit;
  }

  .formRow {
    display: flex;

    > * {
      margin-top: 16px !important;

      + * {
        margin-left: 16px;
      }
    }
  }
`;
