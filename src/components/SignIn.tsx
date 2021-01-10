import { css } from 'astroturf';
import { FormEvent, useState } from 'react';
import * as userActions from '../actions/user';
import { allowedEmailDomains } from '../config';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';

interface Props {}

function checkEmailDomain(givenEmail: string) {
  if (allowedEmailDomains) {
    const givenEmailDomain = givenEmail.split('@').pop();
    const allowDomainsList = allowedEmailDomains.split(',');

    if (!givenEmailDomain || !allowDomainsList.includes(givenEmailDomain)) {
      throw new Error(
        `Email not valid. Your administrator only allows accounts with emails from these domains: ${allowDomainsList.join(
          ', '
        )}`
      );
    }
  }
}

export default function SignIn(props: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function logIn(evt: FormEvent) {
    evt.preventDefault();

    try {
      await userActions.logIn(email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Did you mean to sign up?');
        return;
      }

      setError(err.message);
    }
  }

  async function signUp() {
    try {
      checkEmailDomain(email);

      await userActions.signUp(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className={styles.signIn} onSubmit={logIn}>
      <h2>Welcome to Pairist! 👋</h2>

      <FormField label="Email">
        <Input
          id="sign-in-email"
          value={email}
          onChange={(evt) => setEmail(evt.target.value)}
          type="email"
          placeholder="me@company.com"
        />
      </FormField>

      <FormField label="Password">
        <Input
          id="sign-in-password"
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          type="password"
          placeholder="your password here"
        ></Input>
      </FormField>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.buttons}>
        <Button onClick={signUp}>Sign up</Button>
        <div style={{ flexGrow: 1 }} />
        <Button bold flavor="confirm" type="submit" onClick={logIn}>
          Log in
        </Button>
      </div>

      <hr className={styles.divider} />

      <p>To get started, create an account or log in.</p>

      <p>
        In Pairist 2, you log in as yourself, not your team. You'll be able to create and join teams
        once you've logged in.
      </p>
    </form>
  );
}

const styles = css`
  @import '../variables.scss';

  .signIn {
    width: 320px;
    margin: 20vh auto;
  }

  .divider {
    border-top: 1px solid $color-border;
    margin: $unit-3 0;
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
