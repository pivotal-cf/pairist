import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as teamActions from '../actions/team';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import { useTeamSettings } from '../hooks/useTeamSettings';
import { RouteParams } from '../types';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

export default function AddTeamMember() {
  const { teamId = '-' } = useParams<RouteParams>();
  const { teamSettings } = useTeamSettings();
  const { loaded } = useSession();
  const [, setModalContent] = useModal();
  const [error, setError] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function cancel() {
    setModalContent(null);
  }

  async function save(evt?: FormEvent) {
    setSubmitting(true);

    evt && evt.preventDefault();

    try {
      await teamActions.addTeamMember(teamId, teamSettings.teamName, newMemberEmail);
      setModalContent(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to add member. ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={save}>
      <ModalHeader text="Add team member" />

      <ModalBody row>
        <FormField label="Email" grow>
          <Input
            id="add-member-email"
            value={newMemberEmail}
            onChange={(evt) => {
              setNewMemberEmail(evt.target.value);
              setError('');
            }}
          />
        </FormField>
      </ModalBody>

      <ModalFooter error={error}>
        <div className="flex-grow" />
        <Button disabled={submitting} onClick={cancel}>
          Cancel
        </Button>
        <Button
          disabled={!loaded || submitting}
          submitting={submitting}
          submittingText="Adding..."
          type="submit"
          bold
          flavor="confirm"
        >
          Add
        </Button>
      </ModalFooter>
    </form>
  );
}
