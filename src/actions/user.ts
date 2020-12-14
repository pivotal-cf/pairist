import { auth, funcs } from '../firebase';

const updateUserProfileFunc = funcs.httpsCallable('updateUserProfile');

export async function logIn(email: string, password: string) {
  await auth.signInWithEmailAndPassword(email, password);
}

export async function signUp(email: string, password: string) {
  await auth.createUserWithEmailAndPassword(email, password);
}

export async function resetPassword(email: string) {
  if (!email) return;
  await auth.sendPasswordResetEmail(email);
}

export async function updateProfile(profile: { displayName?: string; photoURL?: string }) {
  if (!auth.currentUser) return;
  await updateUserProfileFunc(profile);
}

export async function logOut() {
  await auth.signOut();
}
