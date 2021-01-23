import { auth, funcs, db } from '../firebase';

const updateUserProfileFunc = funcs.httpsCallable('updateUserProfile');

export async function logIn(email: string, password: string) {
  await auth.signInWithEmailAndPassword(email, password);
}

export async function signUp(email: string, displayName: string, password: string) {
  const credential = await auth.createUserWithEmailAndPassword(email, password);

  if (credential) {
    credential.user?.updateProfile({displayName})
    credential.user?.sendEmailVerification();
  }
}

export async function resetPassword(email: string) {
  if (!email) return;
  await auth.sendPasswordResetEmail(email);
}

export async function updateProfile(profile: { displayName?: string; photoURL?: string }, additionalOptions: { identiconString?: string, theme?: string }) {
  if (!auth.currentUser) return;
  await updateUserProfileFunc(profile);
  await db.collection('additionalUserInfo').doc(auth.currentUser.uid).set(
    additionalOptions,
    {merge: true}
  );
}

export async function logOut() {
  await auth.signOut();
}
