import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const allowedEmailDomains = functions.config().pairist.allowed_email_domains
  ? (functions.config().pairist.allowed_email_domains || '').split(',')
  : null;

const auth = admin.auth();

export const verifyNewUser = functions.auth.user().onCreate(async user => {
  const email = user.email || '';

  console.log(`Verifying new user with email ${email}`);
  console.log(`Allowed email domains are ${JSON.stringify(allowedEmailDomains)}`);

  if (!allowedEmailDomains || !allowedEmailDomains.length) {
    console.log(`No allowed email domains set; verifying`);
    await auth.updateUser(user.uid, { emailVerified: true });
    return;
  }

  const emailDomain = email.split('@').pop();
  const hasAllowedEmailDomain = allowedEmailDomains.includes(emailDomain);

  if (hasAllowedEmailDomain) {
    console.log(`User with email ${email} has allowed email domain; verifying`);

    await auth.updateUser(user.uid, { emailVerified: true });
  } else {
    console.log(`User with email ${email} does NOT have allowed email domain; deleting`);

    await auth.deleteUser(user.uid);

    console.log(`User with email ${email} deleted`);
  }
});
