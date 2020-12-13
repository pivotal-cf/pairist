import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import * as config from './config';

export const app = firebase.initializeApp({
  projectId: config.projectId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
});

export const db = app.firestore();

export const auth = app.auth();

export const fieldValue = firebase.firestore.FieldValue;

export const funcs = app.functions();
