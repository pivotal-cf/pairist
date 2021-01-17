import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as userActions from '../actions/user';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

export default function ResetPasswordDialog() {
  const history = useHistory();
  const { loaded, email } = useSession();
  const [, setModalContent] = useModal();
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function cancel() {
    setModalContent(null);
  }

  async function logOut() {
    await userActions.logOut();
    history.push('/');
  }

  function onSubmit() {
    setSubmitting(true);
    userActions.resetPassword(email || emailInput || '');
    logOut();
  }

  return (
    <form onSubmit={onSubmit}>
      <ModalHeader text="Reset password" />

      <ModalBody row>
        {email ? (
          <div>
            An email will be sent to <b>{email}</b> to reset your password.
            <br />
            <br />
            <i>Note: it may go to your spam folder.</i>
          </div>
        ) : (
          <div>
            Enter your email below to receive a reset password email.
            <br />
            <br />
            <i>Note: it may go to your spam folder.</i>
            <FormField label="Email">
              <Input
                id="account-email"
                value={emailInput || ''}
                onChange={(evt) => setEmailInput(evt.target.value)}
              />
            </FormField>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex-grow" />
        <Button onClick={cancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          disabled={!loaded || submitting}
          submitting={submitting}
          type="submit"
          bold
          flavor="confirm"
        >
          Reset password
        </Button>
      </ModalFooter>
    </form>
  );
}
