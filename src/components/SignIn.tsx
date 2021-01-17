import { css } from 'astroturf';
import { FormEvent, useState } from 'react';
import * as userActions from '../actions/user';
import { allowedEmailDomains } from '../config';
import { useModal } from '../hooks/useModal';
import ResetPasswordDialog from './ResetPasswordDialog';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';

interface Props {}

function checkEmailDomain(givenEmail: string, allowdDomains: string[]) {
  const givenEmailDomain = givenEmail.split('@').pop();

  if (!givenEmailDomain || !allowdDomains.includes(givenEmailDomain)) {
    throw new Error(
      `Email not valid. Your administrator only allows accounts with emails from these domains: ${allowdDomains.join(
        ', '
      )}`
    );
  }
}

export default function SignIn(props: Props) {
  const [, setModalContent] = useModal();

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const [logInEmail, setLogInEmail] = useState('');
  const [logInPassword, setLogInPassword] = useState('');
  const [logInError, setLogInError] = useState('');

  const validDomains = allowedEmailDomains?.split(',') || [];

  async function logIn(evt: FormEvent) {
    evt.preventDefault();

    try {
      await userActions.logIn(logInEmail, logInPassword);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setLogInError('No user found with this email. Did you mean to sign up?');
        return;
      }

      setLogInError(err.message);
    }
  }

  async function signUp() {
    try {
      checkEmailDomain(signUpEmail, validDomains);

      await userActions.signUp(signUpEmail, signUpDisplayName, signUpPassword);
    } catch (err) {
      setSignUpError(err.message);
    }
  }

  return (
    <div className={styles.welcomeContainer}>
      <h2 className={styles.formHeader}>Welcome to Pairist! 👋</h2>

      <div className={styles.formContainer}>
        <form className={styles.welcomeForm} onSubmit={logIn}>
          <FormField label="Email">
            <Input
              id="sign-in-email"
              value={signUpEmail}
              onChange={(evt) => setSignUpEmail(evt.target.value)}
              type="email"
              placeholder={`you@${validDomains[0] || 'company.com'}`}
            />
          </FormField>

          <FormField label="Display name">
            <Input
              id="sign-in-display-name"
              value={signUpDisplayName}
              onChange={(evt) => setSignUpDisplayName(evt.target.value)}
              placeholder={'your name'}
            />
          </FormField>

          <FormField label="Password">
            <Input
              id="sign-in-password"
              value={signUpPassword}
              onChange={(evt) => setSignUpPassword(evt.target.value)}
              type="password"
              placeholder="your password here"
            />
          </FormField>

          {signUpError && (
            <div className={styles.error} role="alert">
              {signUpError}
            </div>
          )}

          <div className={styles.buttons}>
            <div className="flex-grow" />

            <Button bold flavor="confirm" onClick={signUp}>
              Sign up
            </Button>
          </div>
        </form>

        <form className={styles.welcomeForm} onSubmit={logIn}>
          <FormField label="Email">
            <Input
              id="log-in-email"
              value={logInEmail}
              onChange={(evt) => setLogInEmail(evt.target.value)}
              type="email"
              placeholder={`you@${validDomains[0] || 'company.com'}`}
            />
          </FormField>

          <FormField label="Password">
            <Input
              id="log-in-password"
              value={logInPassword}
              onChange={(evt) => setLogInPassword(evt.target.value)}
              type="password"
              placeholder="your password here"
            />
          </FormField>

          {logInError && (
            <div className={styles.error} role="alert">
              {logInError}
            </div>
          )}

          <div className="flex-grow" />

          <div className={styles.buttons}>
            <Button onClick={() => setModalContent(<ResetPasswordDialog />)}>
              Forgot password
            </Button>
            <div className="flex-grow" />
            <Button bold flavor="confirm" type="submit" onClick={logIn}>
              Log in
            </Button>
          </div>
        </form>
      </div>

      <blockquote>To get started, create an account or log in.</blockquote>

      <blockquote>
        In Pairist 2, you log in as yourself, not your team. You'll be able to create and join teams
        once you've logged in.
      </blockquote>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .welcomeContainer {
    margin: auto;
    max-width: $unit * 76;
  }

  .formContainer,
  .formHeader {
    display: flex;
    justify-content: center;
  }

  .welcomeForm {
    padding: $unit * 3;
    max-width: $unit * 40;
    display: flex;
    flex-direction: column;

    + .welcomeForm {
      border-left: 1px solid $color-border;
    }
  }

  .verticalFiller {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .error {
    border-radius: $unit-half;
    background: transparentize($color-danger, 0.9);
    padding: $unit;
    color: $color-danger;
    margin-top: $unit-3;
  }

  .buttons {
    margin-top: $unit-3;
    display: flex;
  }
`;
