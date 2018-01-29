import firebase from "firebase"

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_URL,
}

export const firebaseApp = firebase.initializeApp(config)
export const db = firebaseApp.database()
