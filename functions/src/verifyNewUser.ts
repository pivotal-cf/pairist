import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const allowedEmailDomains = functions.config().pairist.allowed_email_domains
  ? (functions.config().pairist.allowed_email_domains || '').split(',')
  : null;

const auth = admin.auth();
const db = admin.firestore();

export const verifyNewUser = functions.auth.user().onCreate(async (user) => {
  const email = user.email || '';

  console.log(`Verifying new user with id ${user.uid}`);
  console.log(`Allowed email domains are ${JSON.stringify(allowedEmailDomains)}`);

  if (!allowedEmailDomains || !allowedEmailDomains.length) {
    console.log(`No allowed email domains set; verifying`);

    await setUserVerified(user.uid);
    return;
  }

  const emailDomain = email.split('@').pop();
  const hasAllowedEmailDomain = allowedEmailDomains.includes(emailDomain);

  if (hasAllowedEmailDomain) {
    console.log(`User with id ${user.uid} has allowed email domain; verifying`);

    await setUserVerified(user.uid);
  } else {
    console.warn(`User with id ${user.uid} does NOT have allowed email domain; NOT verifying`);
  }
});

async function setUserVerified(userId: string) {
  await auth.setCustomUserClaims(userId, { pairistValidEmail: true });

  await db.collection('userRefresh').doc(userId).set({ refreshTime: Date.now() });
}
