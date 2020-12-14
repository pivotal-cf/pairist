import { useEffect, useState } from 'react';
import { auth } from '../firebase';

export const useSession = () => {
  const currentUser = auth.currentUser;

  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState(currentUser?.uid || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoaded(true);

      if (user) {
        setDisplayName(user.displayName || '');
        setUserId(user.uid);
        setPhotoURL(user.photoURL || '');
        return;
      }

      setDisplayName('');
      setUserId('');
      setPhotoURL('');
    });

    return unsubscribe;
  }, []);

  return {
    loaded,
    setLoaded,
    email,
    setEmail,
    displayName,
    setDisplayName,
    userId,
    setUserId,
    photoURL,
    setPhotoURL,
  };
};
