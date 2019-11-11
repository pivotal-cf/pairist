import { css } from 'astroturf';
import React from 'react';
import { Route, Switch } from 'react-router';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import ChooseTeam from './ChooseTeam';
import Header from './Header';
import Modal from './Modal';
import SignIn from './SignIn';
import Team from './Team';

export default function App() {
  const [modalContent] = useModal();
  const { loaded, userId } = useSession();

  const notLoggedIn = loaded && !userId;

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
          {notLoggedIn ? <SignIn /> : <ChooseTeam />}
          {modalContent && <Modal>{modalContent}</Modal>}
        </Route>
      </Switch>
    </div>
  );
}

const styles = css`
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;
