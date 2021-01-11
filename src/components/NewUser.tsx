import { css } from 'astroturf';
import Button from './Button';

interface Props {}

export default function NewUser(props: Props) {
  return (
    <div className={styles.newUser}>
      <h2>Welcome to Pairist! 👋</h2>

      <p>
        We've sent you an email to verify your account. Please click the link in the email, then
        continue below.
      </p>

      <Button bold flavor="confirm" onClick={() => window.location.reload()}>
        Continue
      </Button>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .newUser {
    width: 320px;
    margin: 30vh auto;
  }
`;
