import { css } from 'astroturf';
import React, { useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';

interface Props {
  flavor: 'error';
  children: React.ReactNode;
}

export default function Notification(props: Props) {
  const [, setNotification] = useNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [setNotification]);

  return (
    <div className={styles.alert} role="alert">
      {props.children}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .alert {
    z-index: 9999;
    background: lighten($color-danger, 50);
    color: $color-danger;
    border: 2px solid $color-danger;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: $unit-3;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    padding: $unit-2;
    border-radius: $unit-half;
  }
`;
