import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import { validateFirebaseAuthentication } from './helpers';
import { currentPairsEndpoint } from './api/current';
import { listsEndpoint } from './api/lists';
import { historyEndpoint } from './api/history';

// Inspired by this official Firebase sample:
// https://github.com/firebase/functions-samples/tree/master/authorized-https-endpoint

const app = express();

app.use(cors({ origin: true }));
app.use(validateFirebaseAuthentication);

app.get('/current/:teamId', currentPairsEndpoint);
app.get('/lists/:teamId', listsEndpoint);
app.get('/history/:teamId', historyEndpoint);

export const api = functions.https.onRequest(app);
