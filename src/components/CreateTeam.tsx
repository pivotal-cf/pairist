import { FC, FormEvent, useState } from 'react';
import { useHistory } from 'react-router';
import * as teamActions from '../actions/team';
import { validateTeamSettings } from '../helpers';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import { auth } from '../firebase';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

export const CreateTeam: FC = () => {
  const history = useHistory();
  const { userId, loaded } = useSession();
  const [, setModalContent] = useModal();
  const [teamName, setTeamName] = useState('');
  const [teamURL, setTeamURL] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const unverified = Boolean(auth.currentUser && !auth.currentUser.emailVerified);
  console.log(unverified);
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

      history.push('/');
    } catch (err) {
      setError('Failed to create team. The given URL may be taken or invalid.');
      setSubmitting(false);
    }
  }

  const modalBody = unverified ? (
    <ModalBody>
      <p>
        Unverified users cannot create new teams. We've sent you an email to verify your account.
        <br/><br/>
        <b>Note: it may be in your spam folder.</b>
      </p>
    </ModalBody>
  ) : (
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
  );

  return (
    <form onSubmit={save}>
      <ModalHeader text="Create team" />

      { modalBody }

      <ModalFooter error={error}>
        <Button disabled={submitting} onClick={cancel}>
          Cancel
        </Button>
        {!unverified && <Button
          disabled={!canSubmit}
          submitting={submitting}
          submittingText="Creating..."
          type="submit"
          bold
          flavor="confirm"
        >
          Create
        </Button>}
      </ModalFooter>
    </form>
  );
};
