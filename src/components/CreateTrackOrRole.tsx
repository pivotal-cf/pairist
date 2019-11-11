import { css } from 'astroturf';
import 'emoji-mart/css/emoji-mart.css';
import React, { FormEvent, useState } from 'react';
import { useParams } from 'react-router';
import * as roleActions from '../actions/role';
import * as trackActions from '../actions/track';
import { colors } from '../colors';
import { useModal } from '../hooks/useModal';
import { RouteParams } from '../types';
import Button from './Button';
import EmojiPicker from './EmojiPicker';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';
import Select from './Select';
import TrackChip from './TrackChip';

interface Props {
  flavor: 'track' | 'role';
  mode: 'create' | 'edit';
  entityId?: string;
  initialName?: string;
  initialEmoji?: string;
  initialColor?: string;
}

export default function CreateTrackOrRole(props: Props) {
  const { teamId = '-' } = useParams<RouteParams>();
  const [, setModalContent] = useModal();
  const [name, setName] = useState(props.initialName || 'Untitled');
  const [emoji, setEmoji] = useState(props.initialEmoji || 'grinning');
  const [color, setColor] = useState(props.initialColor || colors[0].value);
  const [error, setError] = useState('');
  const canSubmit = Boolean(!error);

  function cancel() {
    setModalContent(null);
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

          <FormField label="Color">
            <Select
              id="create-edit-track-or-role-color"
              value={color}
              values={colors}
              onChange={(evt) => {
                setColor(evt.target.value);
              }}
            />
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
