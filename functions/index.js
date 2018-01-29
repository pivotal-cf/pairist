const functions = require('firebase-functions')
const admin = require('firebase-admin')

// admin.initializeApp(functions.config().firebase)
//
// const ref = admin.database().ref()
//
// exports.fillInUserProfile = functions.auth.user().onCreate(event => {
//   const uid = event.data.uid
//   const newUserRef = ref.child(`/users/${uid}`)
//   return newUserRef.set(event)
// });
