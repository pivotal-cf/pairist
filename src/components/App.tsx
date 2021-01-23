import { css } from 'astroturf';
import { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import { setTheme } from '../actions/app';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import { useNotification } from '../hooks/useNotification';
import { useAdditionalUserInfo } from '../hooks/useAdditionalUserInfo';
import ChooseTeam from './ChooseTeam';
import Header from './Header';
import Footer from './Footer';
import Modal from './Modal';
import SignIn from './SignIn';
import Team from './Team';
import Notification from './Notification';
import NewUser from './NewUser';
import { db, auth } from '../firebase';

export default function App() {
  const [modalContent] = useModal();
  const [notification] = useNotification();
  const { loaded, userId } = useSession();
  const { theme } = useAdditionalUserInfo(userId);

  const notLoggedIn = loaded && !userId;
  const unverified = Boolean(auth.currentUser && !auth.currentUser.emailVerified);

  useEffect(() => {
    // When a new user signs in for the first time, there will be a brief
    // window where their email is not yet verified by the cloud function. Assuming
    // their email is valid, once the function verifies this it will update the
    // userRefresh collection. Here, we subscribe to changes there so we can refresh
    // the token when the user's email is verified.
    if (userId) {
      const unsubscribe = db
        .collection('userRefresh')
        .doc(userId)
        .onSnapshot(async () => {
          await auth.currentUser?.reload();
          auth.currentUser?.getIdToken(true);
        });

      return unsubscribe;
    }
  }, [userId]);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <div className={styles.app}>
      <Switch>
        <Route path="/teams/:teamId">
          <Header />
          <Team />
          {modalContent && <Modal>{modalContent}</Modal>}
        </Route>

        <Route path="/">
          <Header />
          {notLoggedIn ? <SignIn /> : unverified ? <NewUser /> : <ChooseTeam />}
          <Footer />
          {modalContent && <Modal>{modalContent}</Modal>}
        </Route>
      </Switch>

      {notification && <Notification flavor="error">{notification}</Notification>}
    </div>
  );
}

const styles = css`
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-app-background);
  }
`;
