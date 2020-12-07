import React, { FormEvent, useEffect, useState } from 'react';
import * as teamActions from '../actions/team';
import { validateTeamSettings } from '../helpers';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import { useTeamSettings } from '../hooks/useTeamSettings';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

interface Props {
  teamId: string;
}

export default function EditTeam(props: Props) {
  const { loaded } = useSession();
  const [, setModalContent] = useModal();
  const { loading, teamSettings } = useTeamSettings();
  const [error, setError] = useState('');
  const canSubmit = Boolean(loaded && !error);

  const [teamName, setTeamName] = useState('');
  useEffect(() => {
    setTeamName(teamSettings.teamName);
  }, [teamSettings.teamName]);

  async function save(evt?: FormEvent) {
    evt && evt.preventDefault();

    const err = validateTeamSettings(teamName, props.teamId);
    if (err) {
      setError(err);
      return;
    }

    await teamActions.updateTeam({
      teamId: props.teamId,
      teamName,
    });

    setModalContent(null);
  }

  return (
    <form onSubmit={save}>
      <ModalHeader text="Edit team" />

      <ModalBody>
        <FormField label="Display name">
          <Input
            id="edit-team-name"
            readOnly={loading}
            value={teamName || ''}
            onChange={(evt) => {
              setTeamName(evt.target.value);
              setError('');
            }}
          />
        </FormField>
      </ModalBody>

      <ModalFooter error={error}>
        <div className="flex-grow" />
        <Button onClick={() => setModalContent(null)}>Cancel</Button>
        <Button disabled={!canSubmit} type="submit" bold flavor="confirm">
          Save
        </Button>
      </ModalFooter>
    </form>
  );
}
