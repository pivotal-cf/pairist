import React, { FormEvent, useState } from 'react';
import { useHistory } from 'react-router';
import * as teamActions from '../actions/team';
import { validateTeamSettings } from '../helpers';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

export const CreateTeam: React.FC = () => {
  const history = useHistory();
  const { userId, loaded } = useSession();
  const [, setModalContent] = useModal();
  const [teamName, setTeamName] = useState('');
  const [teamURL, setTeamURL] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(loaded && !error && !submitting);

  function cancel() {
    setModalContent(null);
  }

  async function save(evt?: FormEvent) {
    if (evt) evt.preventDefault();
    if (!userId) return;

    setSubmitting(true);

    const err = validateTeamSettings(teamName, teamURL);
    if (err) {
      setError(err);
      return;
    }

    try {
      await teamActions.createTeam({
        teamId: teamURL,
        teamName,
      });

      setModalContent(null);
      setSubmitting(false);
      history.push(`/teams/${teamURL}`);
    } catch (err) {
      setError('Failed to create team. The given URL may be taken or invalid.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={save}>
      <ModalHeader text="Create team" />

      <ModalBody>
        <FormField label={`Team URL (/teams/${teamURL})`}>
          <Input
            id="create-team-url"
            value={teamURL}
            onChange={(evt) => {
              setTeamURL(evt.target.value);
              setError('');
            }}
          />
        </FormField>

        <FormField label="Team name">
          <Input
            id="create-team-name"
            value={teamName}
            onChange={(evt) => {
              setTeamName(evt.target.value);
              setError('');
            }}
          />
        </FormField>
      </ModalBody>

      <ModalFooter error={error}>
        <Button disabled={submitting} onClick={cancel}>
          Cancel
        </Button>
        <Button
          disabled={!canSubmit}
          submitting={submitting}
          submittingText="Creating..."
          type="submit"
          bold
          flavor="confirm"
        >
          Create
        </Button>
      </ModalFooter>
    </form>
  );
};
